'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { fetchCarById, fetchCarPhotos, type Car } from '@/lib/api';
import { CarDetailClient } from '@/components/cars/CarDetailClient';
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton';
import Link from 'next/link';

export default function CarDetailClientWrapper({ id }: { id: string }) {
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch the car first: the CDN probe needs the provider's
                // thumbnail URL to derive the car's actual CDN folder and
                // photo-set id (both can differ from the page id).
                const data = await fetchCarById(id);

                if (!data) {
                    setError('Makina nuk u gjet');
                    setLoading(false);
                    return;
                }

                // Render the page immediately with the provider thumbnail, so
                // a slow CDN probe never blocks the whole detail page.
                setCar(data);
                setLoading(false);
                setPhotosLoading(true);

                // Probe the CDN for the full photo set (server-side, cached);
                // when it resolves, the gallery upgrades in place. Failures are
                // non-fatal: the client-side fallback in ImageGallery covers it.
                const lot = data.lots?.[0];
                const thumb =
                    lot?.images?.normal?.[0] ||
                    lot?.images?.downloaded?.[0] ||
                    '';
                try {
                    const photos = await fetchCarPhotos(id, thumb).catch(() => [] as string[]);

                    if (photos.length && lot && lot.images) {
                        lot.images = {
                            ...lot.images,
                            normal: photos,
                            big: photos,
                            downloaded: photos,
                        };
                        setCar((prev) => (prev ? { ...prev } : prev));
                    }
                } finally {
                    setPhotosLoading(false);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gabim gjatë ngarkimit');
                setLoading(false);
            }
        };

        if (id) {
            fetchCar();
        } else {
            setError('ID e pavlefshme');
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return <DetailSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Makina nuk u gjet</h2>
                    <p className="text-text-secondary mb-2">{error}</p>
                    <p className="text-sm text-muted mb-6">
                        ID: {id}
                    </p>
                    <div className="flex flex-col gap-3">
                        <a
                            href={`/api/proxy/cars/${encodeURIComponent(id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-400 text-sm underline"
                        >
                            Testo API direkt
                        </a>
                        <Link href="/cars" className="btn-primary inline-block">
                            Kthehu te Makinat
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!car) {
        notFound();
    }

    return <CarDetailClient car={car} photosLoading={photosLoading} />;
}
