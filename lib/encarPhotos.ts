// lib/encarPhotos.ts
// The provider API only exposes the first photo (_001.jpg) per listing.
// Encar's CDN serves the remaining photos at a predictable sequential pattern.
// This module probes which of those exist at request time (HEAD checks, no
// HTML scraping, no persistence) and returns the existing photo URLs sorted
// by index. Results are cached in-memory for a short window.
//
// The CDN supports an image resizing policy via query params. Without them it
// returns a soft 640x481 preset; requesting `impolicy=heightRate&rh=1200` gives
// a considerably higher-resolution 1597x1200 render of the same source.

// The CDN layout varies PER CAR: both the folder (carpicture08/pic4238, ...)
// and the numeric photo-set id can differ from the app's car id. The only
// reliable source for the base URL is the thumbnail the provider API returns
// (e.g. https://ci.encar.com/carpicture08/pic4238/42386096_001.jpg).
//
// When the provider returns a thumbnail, it may live on a proxy domain
// (e.g. https://encarapi.oprimus.com/photo/42789404) that only exposes one
// low-res image and does NOT reveal the CDN layout for the remaining photos.
// Empirically the Encar CDN layout is derivable from the car id itself:
//   https://ci.encar.com/carpicture/carpicture0X/pic{first4}/{id}_{NNN}.jpg
// where X = the 4th digit of the id, and {first4} = the id's first four digits.
// Examples: 42513666 -> carpicture01/pic4251, 42789404 -> carpicture08/pic4278.
//
// Re-listed cars confuse the derivation: the page id differs from the CDN
// photo-set id (Encar's `vehicleId`). The provider exposes the real CDN id via
// `alsoListedAs` / `also_listed_as`, which callers pass in as `extraIds`; the
// probe tries every candidate base and keeps whichever actually resolves.
const THUMB_BASE_RE = /^(https?:\/\/[^/]+\/carpicture\d+\/pic\d+\/\d+)_\d+\.jpg/;

function cdnBaseFromId(id: string): string | null {
  if (!/^\d{8,}$/.test(id)) return null;
  return `https://ci.encar.com/carpicture/carpicture0${id[3]}/pic${id.slice(0, 4)}/${id}`;
}

function uniqueBases(...ids: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!id) continue;
    const base = id.match(/^https/)? id : cdnBaseFromId(id);
    if (!base || seen.has(base)) continue;
    seen.add(base);
    out.push(base);
  }
  return out;
}

// High-quality render query (keeps original aspect ratio, no watermark).
const RESIZE_QUERY = 'impolicy=heightRate&rh=1200&cw=1600&ch=1200&cg=Center';

function withResizeQuery(url: string): string {
  return `${url}?${RESIZE_QUERY}`;
}

const MAX_PHOTOS = 40;
const HEAD_TIMEOUT = 3000;
const HEAD_RETRY_DELAY = 200;
const CACHE_TTL = 10 * 60 * 1000;
// An empty/suspicious probe result should not be trusted for 10 minutes: the
// CDN is often briefly unreachable (429/5xx/timeouts) from the server, and a
// single flaky probe would otherwise freeze the gallery at 1 image for a while.
const FLAKY_TTL = 30 * 1000;

type ProbeResult = 'ok' | 'missing' | 'failed';

type CacheEntry = { photos: string[]; ts: number; ttl: number };
const cache = new Map<string, CacheEntry>();

async function exists(url: string): Promise<ProbeResult> {
  const attempt = async (): Promise<ProbeResult> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEAD_TIMEOUT);
    try {
      // Probe the bare static file: the resize query only changes the *render*,
      // not existence, and skips CDN-side image processing (much faster HEADs).
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'VeturaNgaKorea/1.0',
        },
      });
      if (res.ok) return 'ok';
      // 403/404 are deterministic "this photo does not exist" answers.
      if (res.status === 403 || res.status === 404) return 'missing';
      // 429/5xx etc. are transient, not evidence the photo is gone.
      return 'failed';
    } catch {
      return 'failed';
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let result = await attempt();
  if (result === 'failed') {
    await new Promise(r => setTimeout(r, HEAD_RETRY_DELAY));
    result = await attempt();
  }
  return result;
}

async function checkBatch(urls: string[]): Promise<ProbeResult[]> {
  return Promise.all(urls.map(u => exists(u)));
}

export async function probeCarPhotos(
  id: string,
  opts: { force?: boolean; includeThumb?: string; extraIds?: string[] } = {}
): Promise<string[]> {
  if (!id || !/^\d+$/.test(id)) return [];

  const cacheKey = `car:${id}`;
  const cached = cache.get(cacheKey);
  if (cached && !opts.force && Date.now() - cached.ts < cached.ttl) {
    return cached.photos;
  }

  // Candidate CDN bases, in priority order: the provider thumbnail when it IS a
  // CDN URL, then the page id, then any re-listing/vehicle ids (alsoListedAs).
  // For re-listed cars the photo-set id differs from the page id, so trying the
  // extra ids is what unlocks the real gallery.
  const thumbBase = opts.includeThumb?.match(THUMB_BASE_RE)?.[1] || null;
  const candidateBases = [
    ...(thumbBase ? [thumbBase] : []),
    ...uniqueBases(id, ...(opts.extraIds ?? [])),
  ];

  // Scan each candidate's indices. To avoid probing dozens of indices before
  // learning the base is wrong, first check _001 for every candidate (cheap),
  // then only scan the full range on the first candidate whose _001 resolves.
  let photos: string[] = [];

  for (const base of candidateBases) {
    const probe001 = await exists(`${base}_001.jpg`);
    if (probe001 !== 'ok') continue;

    // Scan the whole range in parallel: CDN replies have unpredictable hot
    // requests (seconds), so a single parallel pass costs one max latency.
    const indices = Array.from({ length: MAX_PHOTOS }, (_, i) => i + 2);
    const results = await checkBatch(indices.map(n => `${base}_${String(n).padStart(3, '0')}.jpg`));

    let transientFailures = 0;
    const found: string[] = [withResizeQuery(`${base}_001.jpg`)];

    indices.forEach((n, i) => {
      const r = results[i];
      if (r === 'ok') {
        found.push(withResizeQuery(`${base}_${String(n).padStart(3, '0')}.jpg`));
      } else if (r !== 'missing') {
        transientFailures += 1;
      }
    });

    // Only a trustworthy (no transient errors) result is used to build the set;
    // otherwise bail so the raw thumbnail fallback below is used.
    const cdObtainable = transientFailures < 8;
    if (cdObtainable) {
      photos = found;
      // _001 resolving but nothing else means 1-photo listing; keep it.
    }
    break;
  }

  // No CDN base resolved: fall back to the provider's raw thumbnail. Also happen
  // when a base resolved but all probes were transient failures.
  if (!photos.length && opts.includeThumb) {
    photos = [opts.includeThumb];
  }

  const flaky = !photos.length || (photos.length === 1 && photos[0].startsWith('https://encarapi'));
  cache.set(cacheKey, {
    photos,
    ts: Date.now(),
    ttl: flaky ? FLAKY_TTL : CACHE_TTL,
  });
  return photos;
}

export function clearCarPhotoCache(id: string): void {
  cache.delete(`car:${id}`);
}