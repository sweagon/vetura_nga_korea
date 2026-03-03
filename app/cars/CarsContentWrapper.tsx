// app/cars/CarsContentWrapper.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CarCard from '@/components/cars/CarCard';
import { fetchCars, type Car, type FetchCarsResponse } from '@/lib/api';
import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';
import Pagination from '@/components/ui/Pagination';
import { AlertCircle, ArrowUpDown } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import CompactSearch from '@/components/ui/CompactSearch';

interface SortOption {
    value: string;
    label: string;
    sortFn: (a: Car, b: Car) => number;
}

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
    const [currentSort, setCurrentSort] = useState(sortBy);

    const currentPage = Number(searchParams.get('page')) || 1;
    const perPage = Number(searchParams.get('per_page')) || 12;

    // Define sort options
    const sortOptionsList: SortOption[] = [
        {
            value: 'recommended',
            label: 'Më të përshtatshmet',
            sortFn: (a, b) => 0
        },
        {
            value: 'price_asc',
            label: 'Çmimi: Nga më i ulëti',
            sortFn: (a, b) => {
                const priceA = a.lots?.[0]?.buy_now || 0;
                const priceB = b.lots?.[0]?.buy_now || 0;
                return priceA - priceB;
            }
        },
        {
            value: 'price_desc',
            label: 'Çmimi: Nga më i larti',
            sortFn: (a, b) => {
                const priceA = a.lots?.[0]?.buy_now || 0;
                const priceB = b.lots?.[0]?.buy_now || 0;
                return priceB - priceA;
            }
        },
        {
            value: 'year_desc',
            label: 'Viti: Më të rijtë',
            sortFn: (a, b) => b.year - a.year
        },
        {
            value: 'year_asc',
            label: 'Viti: Më të vjetrit',
            sortFn: (a, b) => a.year - b.year
        },
        {
            value: 'mileage_asc',
            label: 'Kilometrazha: Më e ulët',
            sortFn: (a, b) => {
                const kmA = a.lots?.[0]?.odometer?.km || 0;
                const kmB = b.lots?.[0]?.odometer?.km || 0;
                return kmA - kmB;
            }
        },
        {
            value: 'mileage_desc',
            label: 'Kilometrazha: Më e lartë',
            sortFn: (a, b) => {
                const kmA = a.lots?.[0]?.odometer?.km || 0;
                const kmB = b.lots?.[0]?.odometer?.km || 0;
                return kmB - kmA;
            }
        },
    ];

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
            const sortOption = sortOptionsList.find(opt => opt.value === currentSort);
            if (sortOption && currentSort !== 'recommended') {
                const sorted = [...data.data].sort(sortOption.sortFn);
                setSortedCars(sorted);
            } else {
                setSortedCars(data.data);
            }
        }
    }, [data, currentSort]);

    const handleSortChange = (value: string) => {
        setCurrentSort(value);
    };

    const handlePageChange = useCallback((page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`/cars?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [router, searchParams]);

    const hasNextPage = data?.links?.next !== null;
    const hasPrevPage = data?.links?.prev !== null;
    const shouldShowPagination = hasNextPage || hasPrevPage;

    // Prepare sort options for CustomSelect
    const sortSelectOptions = sortOptionsList.map(opt => ({
        value: opt.value,
        label: opt.label
    }));

    // Loading state
    if (loading) {
        return (
            <div className="space-y-8">
                {/* Sort Bar Skeleton */}
                <div className="bg-surface-2 border border-light/20 rounded-xl p-3 md:p-4 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="h-4 w-24 bg-surface-3 rounded animate-pulse"></div>
                        <div className="w-full sm:w-56 h-10 bg-surface-3 rounded-lg animate-pulse"></div>
                    </div>
                </div>

                {/* Results count skeleton */}
                <div className="flex justify-between items-center px-2">
                    <div className="h-4 w-48 bg-surface-2 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-surface-2 rounded animate-pulse"></div>
                </div>

                {/* Grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(perPage)].map((_, i) => (
                        <CarCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
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
        );
    }

    // Empty state
    if (!sortedCars.length) {
        return (
            <div className="text-center py-16 bg-surface-2/30 rounded-2xl border border-light/20">
                <p className="text-secondary mb-2">Nuk u gjet asnjë makinë me këto kritere.</p>
                <p className="text-sm text-muted mb-4">Filtrat që keni zgjedhur nuk kanë rezultate.</p>
                <button
                    onClick={() => router.push('/cars')}
                    className="btn-secondary"
                >
                    Shiko të gjitha makinat
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Sort Bar */}
            <div className="bg-surface-2 border border-light/20 rounded-xl p-3 md:p-4 flex lg:flex-row flex-col md:gap-8 gap-4 justify-between">
                {/* Search Bar - If you want it */}
                <div>
                    <CompactSearch variant="header" />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-xs md:text-sm text-muted flex items-center gap-1">
                        <ArrowUpDown size={14} />
                        Rendit sipas:
                    </span>

                    <div className="w-full sm:w-56">
                        <CustomSelect
                            value={currentSort}
                            onChange={handleSortChange}
                            options={sortSelectOptions}
                            placeholder="Zgjidh renditjen"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

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
    );
}