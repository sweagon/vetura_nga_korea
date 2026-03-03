// app/cars/CarsContentWrapper.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CarCard from '@/components/cars/CarCard';
import { fetchCars, type Car, type FetchCarsResponse } from '@/lib/api';
import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';
import Pagination from '@/components/ui/Pagination';
import { AlertCircle } from 'lucide-react';

interface CarsContentWrapperProps {
    sortBy?: string;
    sortOptions?: Array<{ value: string; sortFn: (a: Car, b: Car) => number }>;
}

export default function CarsContentWrapper({
    sortBy = 'recommended',
    sortOptions = []
}: CarsContentWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<FetchCarsResponse | null>(null);
    const [sortedCars, setSortedCars] = useState<Car[]>([]);

    const currentPage = Number(searchParams.get('page')) || 1;
    const perPage = Number(searchParams.get('per_page')) || 12;

    // Create a cache key from all filter parameters
    const filterKey = useMemo(() => {
        const params = new URLSearchParams(searchParams);
        // Sort keys to ensure consistent cache keys
        const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
        return entries.map(([key, value]) => `${key}=${value}`).join('&');
    }, [searchParams]);

    // Fetch cars when filters change
    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                timeoutId = setTimeout(() => {
                    if (isMounted) {
                        console.log('⚠️ Request is taking longer than expected...');
                    }
                }, 5000);

                // Build params from URL
                const params: Record<string, any> = {
                    page: currentPage,
                    per_page: perPage,
                    vehicle_type: '1'
                };

                // Add all filters from URL
                const manufacturerId = searchParams.get('manufacturer_id');
                const modelId = searchParams.get('model_id');
                const fromYear = searchParams.get('from_year');
                const toYear = searchParams.get('to_year');
                const priceFrom = searchParams.get('buy_now_price_from');
                const priceTo = searchParams.get('buy_now_price_to');
                const odometerFrom = searchParams.get('odometer_from_km');
                const odometerTo = searchParams.get('odometer_to_km');

                if (manufacturerId) params.manufacturer_id = manufacturerId;
                if (modelId) params.model_id = modelId;
                if (fromYear) params.from_year = fromYear;
                if (toYear) params.to_year = toYear;
                if (priceFrom) params.buy_now_price_from = priceFrom;
                if (priceTo) params.buy_now_price_to = priceTo;
                if (odometerFrom) params.odometer_from_km = odometerFrom;
                if (odometerTo) params.odometer_to_km = odometerTo;

                console.log('📡 Fetching cars with params:', params);
                const response = await fetchCars(params);

                if (!isMounted) return;
                clearTimeout(timeoutId);

                console.log('✅ Response received:', {
                    total: response.meta?.total,
                    count: response.data?.length,
                    current_page: response.meta?.current_page
                });

                setData(response);

            } catch (err) {
                if (!isMounted) return;
                clearTimeout(timeoutId);
                console.error('Error fetching cars:', err);
                setError('Nuk u mumë të ngarkojmë makinat. Ju lutem provoni përsëri.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [filterKey, currentPage, perPage, searchParams]);

    // Apply client-side sorting
    useEffect(() => {
        if (data?.data) {
            const sortOption = sortOptions.find(opt => opt.value === sortBy);
            if (sortOption && sortBy !== 'recommended') {
                const sorted = [...data.data].sort(sortOption.sortFn);
                setSortedCars(sorted);
            } else {
                setSortedCars(data.data);
            }
        }
    }, [data, sortBy, sortOptions]);

    const handlePageChange = useCallback((page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        // Use router.push for client-side navigation
        router.push(`/cars?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [router, searchParams]);

    const hasNextPage = data?.links?.next !== null;
    const hasPrevPage = data?.links?.prev !== null;
    const shouldShowPagination = hasNextPage || hasPrevPage;

    // Error state
    if (error) {
        return (
            <div className="container-swiss py-6 md:py-8">
                <div className="text-center py-16 bg-surface-2/30 rounded-2xl border border-light/20">
                    <AlertCircle className="w-12 h-12 text-orange-primary mx-auto mb-4" />
                    <p className="text-secondary mb-2">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            // Trigger a re-fetch
                            const params = new URLSearchParams(searchParams);
                            router.push(`/cars?${params.toString()}`);
                        }}
                        className="btn-primary mt-4"
                    >
                        Provo përsëri
                    </button>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="container-swiss py-6 md:py-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-8 bg-surface-2 rounded w-64 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-surface-2 rounded w-96 animate-pulse"></div>
                </div>

                {/* Filter Bar Skeleton */}
                <div className="bg-surface-2 border border-light/20 rounded-xl p-3 md:p-4 mb-6">
                    <div className="h-10 bg-surface-2 rounded-lg w-40 animate-pulse"></div>
                </div>

                {/* Cars Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(perPage)].map((_, i) => (
                        <div key={i} className="bg-surface rounded-xl border border-medium overflow-hidden">
                            <div className="h-48 bg-surface-2 animate-pulse"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-5 bg-surface-2 rounded w-3/4 animate-pulse"></div>
                                <div className="flex justify-between">
                                    <div className="h-6 bg-surface-2 rounded w-24 animate-pulse"></div>
                                    <div className="h-5 bg-surface-2 rounded w-12 animate-pulse"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="h-4 bg-surface-2 rounded animate-pulse"></div>
                                    <div className="h-4 bg-surface-2 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (!sortedCars.length) {
        return (
            <div className="container-swiss py-6 md:py-8">
                <div className="text-center py-16 bg-surface-2/30 rounded-2xl border border-light/20">
                    <p className="text-secondary mb-2">Nuk u gjet asnjë makinë.</p>
                    <p className="text-sm text-muted">Provo të ndryshosh kriteret e kërkimit.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-swiss py-6 md:py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    Makina për Shitje
                </h1>
                <p className="text-secondary">
                    Shfleto makinat më të mira nga Korea
                </p>
            </div>

            {/* Results count */}
            {data?.meta && data.meta.total > 0 && (
                <div className="flex justify-between items-center px-2 mb-4">
                    <div className="text-sm text-muted">
                        Duke shfaqur {data.meta.from} - {data.meta.to}
                        {data.meta.total ? ` nga ${data.meta.total} makina` : ''}
                    </div>
                    {shouldShowPagination && (
                        <div className="text-sm text-muted">
                            Faqja {data.meta.current_page}
                            {hasNextPage && " +"}
                        </div>
                    )}
                </div>
            )}

            {/* Car grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {sortedCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                ))}
            </div>

            {/* Pagination */}
            {shouldShowPagination && data?.meta && (
                <div className="mt-8 pt-4 border-t border-light/20">
                    <Pagination
                        currentPage={data.meta.current_page}
                        onPageChange={handlePageChange}
                        hasNextPage={hasNextPage}
                        hasPrevPage={hasPrevPage}
                    />
                </div>
            )}
        </div>
    );
}