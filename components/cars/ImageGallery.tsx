// components/cars/ImageGallery.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

interface ImageGalleryProps {
    images: string[];
    carName: string;
    carId?: string;
    loading?: boolean;
}

// Client-side fallback: when the server probe returns too few photos (the CDN
// is unreachable from the server, transiently flaky, etc.), the browser itself
// probes the predictable Encar CDN pattern with <img> onload/onerror and grows
// the gallery progressively. Works from any consumer IP; results are cached in
// sessionStorage for the duration of the session.
const DISCOVER_MAX = 40;
const DISCOVER_BATCH = 4;
const DISCOVER_STREAK = 8;
const DISCOVER_TIMEOUT = 4000;
// The CDN folder + photo-set id are per car and differ from the page id, so we
// derive the base path from the provider's thumbnail (which is always present).
const THUMB_BASE_RE = /^(https?:\/\/[^/]+\/carpicture\d+\/pic\d+\/\d+)_\d+\.jpg/;

function probeCDNPhoto(base: string, n: number): Promise<{ n: number; url: string } | null> {
    return new Promise(resolve => {
        const url = `${base}_${String(n).padStart(3, '0')}.jpg?impolicy=heightRate&rh=1200&cw=1600&ch=1200&cg=Center`;
        const img = new Image();
        let settled = false;
        const finish = (value: { n: number; url: string } | null) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            img.onload = null;
            img.onerror = null;
            img.src = '';
            resolve(value);
        };
        const timer = setTimeout(() => finish(null), DISCOVER_TIMEOUT);
        img.onload = () => finish({ n, url });
        img.onerror = () => finish(null);
        img.src = url;
    });
}

function readSession<T>(key: string): T | null {
    try {
        const raw = window.sessionStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function writeSession(key: string, value: unknown): void {
    try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        // sessionStorage unavailable (private mode); discovery still works live.
    }
}

const INDEX_RE = /_(\d{3,})\./;

// Shimmer placeholder for an <img> that has not finished loading yet. The
// shimmer lives behind the image (absolute) and stays visible until onLoad,
// so tiles show a clean skeleton instead of a blank/empty box.
function ShimmedImg({ src, alt, className, eager = false }: {
    src: string;
    alt: string;
    className?: string;
    eager?: boolean;
}) {
    const [loaded, setLoaded] = useState(false);
    return (
        <>
            {!loaded && <div className="absolute inset-0 bg-surface-2 animate-pulse" aria-hidden="true" />}
            <img
                src={src}
                alt={alt}
                loading={eager ? 'eager' : 'lazy'}
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
                className={className}
            />
        </>
    );
}

export default function ImageGallery({ images, carName, carId, loading }: ImageGalleryProps) {
    const galleryRef = useRef<HTMLDivElement>(null);
    const [extras, setExtras] = useState<string[]>([]);
    const [discoveryDone, setDiscoveryDone] = useState(false);
    const [discovering, setDiscovering] = useState(false);

    // Merge server-provided + client-discovered photos, de-duplicating by their
    // numeric suffix (_NNN). When the raw API thumbnail (low-res, no resize
    // query) and the CDN render share an index, prefer the CDN render.
    const merged = (() => {
        if (!extras.length) return images;
        const byIndex = new Map<number, string>();
        [...images, ...extras].forEach(url => {
            const m = url.match(INDEX_RE);
            const key = m ? parseInt(m[1], 10) : -1;
            const existing = byIndex.get(key);
            if (!existing) {
                byIndex.set(key, url);
            } else if (!existing.includes('impolicy=heightRate') && url.includes('impolicy=heightRate')) {
                byIndex.set(key, url);
            }
        });
        return [...byIndex.values()];
    })();

    // The low-resolution API thumbnail is fine for cards but ugly full-screen:
    // while the hi-res set is still being fetched, keep it hidden behind the
    // skeleton instead of flashing it as the main image.
    const onlyThumb = merged.length > 0 && merged.every(url => !url.includes('impolicy=heightRate'));
    const waitingForHires = onlyThumb && (loading || discovering);
    const displayImages = waitingForHires ? [] : merged.length > 0 ? merged : ['/placeholder-car.jpg'];

    useEffect(() => {
        if (!carId || discoveryDone || images.length > 3) return;

        const base = images[0]?.match(THUMB_BASE_RE)?.[1];
        if (!base) return;

        const run = async () => {
            setDiscovering(true);
            try {
                const sessionKey = `encarPhotos:${carId}`;
                const cached = readSession<string[]>(sessionKey);
                if (cached && cached.length) {
                    setExtras(cached);
                    return;
                }

                const found: string[] = [];
                let consecutiveMisses = 0;

                for (let start = 1; start <= DISCOVER_MAX; start += DISCOVER_BATCH) {
                    const batch = Array.from({ length: DISCOVER_BATCH }, (_, i) => start + i);
                    const results = await Promise.all(batch.map(n => probeCDNPhoto(base, n)));
                    const hits = results.filter((r): r is { n: number; url: string } => r !== null);
                    if (hits.length) {
                        found.push(...hits.map(h => h.url));
                        consecutiveMisses = 0;
                    } else {
                        consecutiveMisses += DISCOVER_BATCH;
                    }
                    if (consecutiveMisses >= DISCOVER_STREAK) break;
                }

                if (found.length) {
                    writeSession(sessionKey, found);
                    setExtras(found);
                }
            } finally {
                setDiscovering(false);
                setDiscoveryDone(true);
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [carId, images.length, discoveryDone]);

    useEffect(() => {
        if (!galleryRef.current) return;

        const lightbox = new PhotoSwipeLightbox({
            gallery: galleryRef.current,
            children: 'a',
            pswpModule: () => import('photoswipe'),
            bgOpacity: 0.98,
            loop: true,
            wheelToZoom: true,
            pinchToClose: true,
            clickToCloseNonZoomable: true,
            preload: [1, 1],
        });

        lightbox.init();

        return () => {
            lightbox.destroy();
        };
    }, []);

    // Show first 4 images in a beautiful grid
    const displaySecondary = displayImages.slice(1, 5);
    const remainingCount = displayImages.length - 5;

    // The full photo set has not arrived yet (server probe or client-side
    // discovery still running):
    // - with no usable image yet, render a full skeleton main tile;
    // - with only the provider thumbnail, render skeleton secondary slots.
    const pendingMore = (loading || discovering) && displayImages.length <= 1;
    const noMainYet = displayImages.length === 0;

    // Encar/CDN photos are rendered at ~4:3 (1597x1200). Declare the true
    // ratio so the lightbox does not stretch the image.
    const fullW = 1600;
    const fullH = 1200;

    const renderSecondarySlot = (slot: number) => {
        const img = displaySecondary[slot];
        if (img) {
            const index = slot + 2;
            return (
                <a
                    key={img}
                    href={img}
                    data-pswp-width={fullW}
                    data-pswp-height={fullH}
                    target="_blank"
                    rel="noreferrer"
                    className="relative group aspect-[4/3] cursor-pointer bg-surface-2 overflow-hidden"
                >
                    <ShimmedImg
                        src={img}
                        alt={`${carName} - ${index}`}
                        className="w-full h-full object-cover relative"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                    {/* Show +X on the last tile if there are more */}
                    {slot === 3 && remainingCount > 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white text-2xl font-bold">+{remainingCount}</span>
                        </div>
                    )}
                </a>
            );
        }
        if (pendingMore) {
            return (
                <div
                    key={`skeleton-${slot}`}
                    className="aspect-[4/3] bg-surface-2 animate-pulse"
                    aria-hidden="true"
                />
            );
        }
        return null;
    };

    return (
        <div ref={galleryRef} className="grid grid-cols-4 gap-0.5 rounded-xl overflow-hidden">
            {/* Main large image - spans 2x2 */}
            {noMainYet ? (
                <div className="col-span-2 row-span-2 relative bg-surface-2 animate-pulse aspect-[4/3]" aria-hidden="true">
                    <span className="absolute bottom-2 left-2 px-3 py-1.5 bg-black/70 text-white text-sm rounded-lg backdrop-blur-sm">
                        📸 Po ngarkohen…
                    </span>
                </div>
            ) : (
                <a
                    href={displayImages[0]}
                    data-pswp-width={fullW}
                    data-pswp-height={fullH}
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-2 row-span-2 relative group cursor-pointer bg-surface-2 overflow-hidden"
                >
                    <ShimmedImg
                        src={displayImages[0]}
                        alt={`${carName} - Main`}
                        eager
                        className="w-full h-full object-contain relative aspect-[4/3]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <span className="absolute bottom-2 left-2 px-3 py-1.5 bg-black/70 text-white text-sm rounded-lg backdrop-blur-sm">
                        {pendingMore ? (
                            '📸 Po ngarkohen…'
                        ) : (
                            <>📸 {displayImages.length} photos</>
                        )}
                    </span>
                </a>
            )}

            {/* Remaining images */}
            {[0, 1, 2, 3].map(renderSecondarySlot)}

            {/* Hidden links for remaining images (for lightbox) */}
            {displayImages.slice(5).map((img, idx) => (
                <a
                    key={idx + 5}
                    href={img}
                    data-pswp-width={fullW}
                    data-pswp-height={fullH}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden"
                >
                    <img src={img} alt={`${carName} - ${idx + 6}`} loading="lazy" />
                </a>
            ))}
        </div>
    );
}