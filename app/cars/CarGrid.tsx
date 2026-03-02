// app/cars/CarGrid.tsx - KEEP THIS VERSION (YOUR CURRENT CODE)
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CarCard from '@/components/cars/CarCard';
import { fetchCars, type Car, type FetchCarsResponse } from '@/lib/api';
import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';
import Pagination from '@/components/ui/Pagination';

interface CarGridProps {
    sortBy?: string;
    sortOptions?: Array<{ value: string; sortFn: (a: Car, b: Car) => number }>;
}

export default function CarGrid({ sortBy = 'recommended', sortOptions = [] }: CarGridProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<FetchCarsResponse | null>(null);
    const [sortedCars, setSortedCars] = useState<Car[]>([]);

    const currentPage = Number(searchParams.get('page')) || 1;
    const perPage = Number(searchParams.get('per_page')) || 12;

    // Fetch cars when search params change
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const params = Object.fromEntries(searchParams.entries());
                console.log('📡 Fetching cars with params:', params);
                const response = await fetchCars(params);
                console.log('📦 API Response:', response);
                setData(response);
            } catch (error) {
                console.error('Error fetching cars:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);


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

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`/cars?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Loading state
    if (loading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(perPage)].map((_, i) => (
                        <CarCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (!data?.data.length) {
        return (
            <div className="text-center py-16 bg-surface-2/30 rounded-2xl border border-light/20">
                <p className="text-secondary mb-2">Nuk u gjet asnjë makinë.</p>
                <p className="text-sm text-muted">Provo të ndryshosh kriteret e kërkimit.</p>
            </div>
        );
    }

    // Calculate pagination
    const totalPages = data.meta ? Math.ceil(data.meta.total / data.meta.per_page) : 1;
    const shouldShowPagination = data.meta && totalPages > 1;

    console.log('🔍 Pagination Debug:', {
        total: data?.meta?.total,
        per_page: data?.meta?.per_page,
        totalPages,
        shouldShowPagination,
        currentPage: data?.meta?.current_page,
        hasMeta: !!data?.meta
    });

    return (
        <div className="space-y-8">
            {/* Results count */}
            {data.meta && (
                <div className="flex justify-between items-center px-2">
                    <div className="text-sm text-muted">
                        Duke shfaqur {data.meta.from} - {data.meta.to} nga {data.meta.total} makina
                    </div>
                    {shouldShowPagination && (
                        <div className="text-sm text-muted">
                            Faqja {data.meta.current_page} nga {totalPages}
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
            {shouldShowPagination && (
                <div className="mt-8 pt-4 border-t border-light/20">
                    <Pagination
                        currentPage={data.meta!.current_page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}