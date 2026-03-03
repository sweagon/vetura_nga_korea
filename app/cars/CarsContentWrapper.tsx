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

export default function CarsContentWrapper({ sortBy = 'recommended', sortOptions = [] }: CarsContentWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<FetchCarsResponse | null>(null);
    const [sortedCars, setSortedCars] = useState<Car[]>([]);

    const currentPage = Number(searchParams.get('page')) || 1;
    const perPage = Number(searchParams.get('per_page')) || 12;

    // Get all filter values from URL
    const filters = useMemo(() => ({
        manufacturerId: searchParams.get('manufacturer_id') || '',
        modelId: searchParams.get('model_id') || '',
        fromYear: searchParams.get('from_year') || '',
        toYear: searchParams.get('to_year') || '',
        priceFrom: searchParams.get('buy_now_price_from') || '',
        priceTo: searchParams.get('buy_now_price_to') || '',
        odometerFrom: searchParams.get('odometer_from_km') || '',
        odometerTo: searchParams.get('odometer_to_km') || '',
    }), [searchParams]);

    // Fetch cars when filters or page change
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

                const params: Record<string, any> = {
                    page: currentPage,
                    per_page: perPage,
                    vehicle_type: '1'
                };

                if (filters.manufacturerId) params.manufacturer_id = filters.manufacturerId;
                if (filters.modelId) params.model_id = filters.modelId;
                if (filters.fromYear) params.from_year = filters.fromYear;
                if (filters.toYear) params.to_year = filters.toYear;
                if (filters.priceFrom) params.buy_now_price_from = filters.priceFrom;
                if (filters.priceTo) params.buy_now_price_to = filters.priceTo;
                if (filters.odometerFrom) params.odometer_from_km = filters.odometerFrom;
                if (filters.odometerTo) params.odometer_to_km = filters.odometerTo;

                console.log('📡 Fetching cars with params:', params);
                const response = await fetchCars(params);

                if (!isMounted) return;
                clearTimeout(timeoutId);

                setData(response);

            } catch (err) {
                if (!isMounted) return;
                clearTimeout(timeoutId);
                console.error('Error fetching cars:', err);
                setError('Nuk u mumë të ngarkojmë makinat.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [filters, currentPage, perPage]);

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
        router.push(`/cars?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [router, searchParams]);

    const hasNextPage = data?.links?.next !== null;
    const hasPrevPage = data?.links?.prev !== null;
    const shouldShowPagination = hasNextPage || hasPrevPage;

    return (
        <div className="py-6 md:py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    Makina për Shitje
                </h1>
                <p className="text-secondary">
                    Shfleto makinat më të mira nga Korea
                </p>
            </div>

            {/* Results Section */}
            {error ? (
                <div className="text-center py-16 bg-surface-2/30 rounded-2xl border border-light/20">
                    <AlertCircle className="w-12 h-12 text-orange-primary mx-auto mb-4" />
                    <p className="text-secondary mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary mt-4"
                    >
                        Provo përsëri
                    </button>
                </div>
            ) : loading ? (
                <div className="space-y-8 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(perPage)].map((_, i) => (
                            <CarCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            ) : !sortedCars.length ? (
                <div className="text-center py-16 bg-surface-2/30 rounded-2xl border border-light/20 mt-8">
                    <p className="text-secondary mb-2">Nuk u gjet asnjë makinë me këto kritere.</p>
                    <p className="text-sm text-muted mb-4">Provo të ndryshosh kriteret e kërkimit më lart.</p>
                    <button
                        onClick={() => router.push('/cars')}
                        className="btn-secondary"
                    >
                        Shiko të gjitha makinat
                    </button>
                </div>
            ) : (
                <div className="space-y-8 mt-8">
                    {/* Results count */}
                    {data?.meta && data.meta.total > 0 && (
                        <div className="flex justify-between items-center px-2">
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
            )}
        </div>
    );
}