// lib/encarPhotos.ts
// The provider API only exposes the first photo (_001.jpg) per listing.
// Encar's CDN serves the remaining photos at a predictable sequential pattern:
//   https://ci.encar.com/carpicture04/pic4264/{id}_{NNN}.jpg
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
const CDN_PATH = (id: string, n: number) =>
  `https://ci.encar.com/carpicture04/pic4264/${id}_${String(n).padStart(3, '0')}.jpg`;

const THUMB_BASE_RE = /^(https?:\/\/[^/]+\/carpicture\d+\/pic\d+\/\d+)_\d+\.jpg/;

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
  opts: { force?: boolean; includeThumb?: string } = {}
): Promise<string[]> {
  if (!id || !/^\d+$/.test(id)) return [];

  const cacheKey = `car:${id}`;
  const cached = cache.get(cacheKey);
  if (cached && !opts.force && Date.now() - cached.ts < cached.ttl) {
    return cached.photos;
  }

  // Prefer the CDN base derived from the provider thumbnail over the page id
  // (folder + photo-set id differ per car).
  const baseUrl = opts.includeThumb?.match(THUMB_BASE_RE)?.[1] || null;
  const bareUrl = (n: number) =>
    `${baseUrl ? `${baseUrl}_${String(n).padStart(3, '0')}.jpg` : CDN_PATH(id, n)}`;

  // When the thumb gives us the exact base, _001 is guaranteed to exist and is
  // already included verbatim below; start scanning at _002 to avoid a wasted
  // HEAD + a duplicate entry. Otherwise scan from _001 as before.
  const startN = baseUrl ? 2 : 1;

  // Probe the whole scan range in parallel: CDN replies have unpredictable hot
  // requests (seconds), so sequential batches pay batch-count × slowest-latency.
  // A single parallel pass costs one max latency regardless of set size.
  const indices = Array.from({ length: MAX_PHOTOS - startN + 1 }, (_, i) => startN + i);
  const results = await checkBatch(indices.map(bareUrl));

  const found: string[] = [];
  let transientFailures = 0;
  let consecutiveMisses = 0;

  indices.forEach((n, i) => {
    const r = results[i];
    if (r === 'ok') {
      found.push(withResizeQuery(bareUrl(n)));
      consecutiveMisses = 0;
    } else if (r === 'missing') {
      consecutiveMisses += 1;
    } else {
      transientFailures += 1;
    }
  });

  // Only persist a trustworthy (non-empty, no transient errors) result for the
  // long TTL. Flaky/empty probes get re-run shortly after instead of poisoning
  // the gallery for 10 minutes.
  const cdObtainable = transientFailures < 8;
  const trustworthy = cdObtainable && consecutiveMisses < indices.length;
  const photos = [...found];
  // The provider's raw thumbnail is low-resolution; on the detail page we only
  // ever want the CDN's resized render. When the thumb revealed the exact CDN
  // base, _001 is guaranteed to exist, so lead with its resized version. The raw
  // thumbnail is kept only as a last resort when we cannot derive the base.
  if (baseUrl) {
    photos.unshift(withResizeQuery(`${baseUrl}_001.jpg`));
  } else if (opts.includeThumb) {
    photos.unshift(opts.includeThumb);
  }

  cache.set(cacheKey, {
    photos,
    ts: Date.now(),
    ttl: trustworthy ? CACHE_TTL : FLAKY_TTL,
  });
  return photos;
}

export function clearCarPhotoCache(id: string): void {
  cache.delete(`car:${id}`);
}