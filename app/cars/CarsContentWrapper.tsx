'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import CarCard from '@/components/cars/CarCard';
import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { AlertCircle, ArrowUpDown, Loader2, Search } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import CompactSearch from '@/components/ui/CompactSearch';
import AdvancedFilterSidebar from '@/components/filters/AdvancedFilterSidebar';
import FilterToggle from '@/components/ui/FilterToggle';
import Pagination from '@/components/ui/Pagination';
import { useCarFilters } from '@/hooks/useCarFilters';
import { type Car } from '@/lib/api';

interface SortOption {
    value: string;
    label: string;
    sortFn: (a: Car, b: Car) => number;
}

export default function CarsContentWrapper() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentSort, setCurrentSort] = useState('recommended');
    const contentRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();

    const serverFilters = useMemo(() => ({
        manufacturer_id: searchParams.get('manufacturer_id') || undefined,
        model_id: searchParams.get('model_id') || undefined,
        from_year: searchParams.get('from_year') || undefined,
        to_year: searchParams.get('to_year') || undefined,
        buy_now_price_from: searchParams.get('buy_now_price_from') || undefined,
        buy_now_price_to: searchParams.get('buy_now_price_to') || undefined,
        odometer_from_km: searchParams.get('odometer_from_km') || undefined,
        odometer_to_km: searchParams.get('odometer_to_km') || undefined,
    }), [searchParams]);

    const clientFilters = useMemo(() => ({
        fuel_id: searchParams.get('fuel_id') || '',
        transmission_id: searchParams.get('transmission_id') || '',
        color_id: searchParams.get('color_id') || '',
        body_type_id: searchParams.get('body_type_id') || '',
        yearFrom: searchParams.get('filter_year_from') || '',
        yearTo: searchParams.get('filter_year_to') || '',
        priceFrom: searchParams.get('filter_price_from') || '',
        priceTo: searchParams.get('filter_price_to') || '',
    }), [searchParams]);

    const {
        cars,
        loading,
        loadingMore,
        currentPage,
        totalPages,
        totalMatches,
        searchProgress,
        hasClientFilters,
        error,
        goToPage
    } = useCarFilters(serverFilters, clientFilters);

    const sortOptionsList = useMemo<SortOption[]>(() => [
        { value: 'recommended', label: 'Më të përshtatshmet', sortFn: () => 0 },
        { value: 'price_asc', label: 'Çmimi: Nga më i ulëti', sortFn: (a, b) => (a.lots?.[0]?.buy_now || 0) - (b.lots?.[0]?.buy_now || 0) },
        { value: 'price_desc', label: 'Çmimi: Nga më i larti', sortFn: (a, b) => (b.lots?.[0]?.buy_now || 0) - (a.lots?.[0]?.buy_now || 0) },
        { value: 'year_desc', label: 'Viti: Më të rijtë', sortFn: (a, b) => b.year - a.year },
        { value: 'year_asc', label: 'Viti: Më të vjetrit', sortFn: (a, b) => a.year - b.year },
        { value: 'mileage_asc', label: 'Kilometrazha: Më e ulët', sortFn: (a, b) => (a.lots?.[0]?.odometer?.km || 0) - (b.lots?.[0]?.odometer?.km || 0) },
        { value: 'mileage_desc', label: 'Kilometrazha: Më e lartë', sortFn: (a, b) => (b.lots?.[0]?.odometer?.km || 0) - (a.lots?.[0]?.odometer?.km || 0) },
    ], []);

    const sortSelectOptions = useMemo(() =>
        sortOptionsList.map(opt => ({ value: opt.value, label: opt.label })),
        [sortOptionsList]
    );

    const displayedCars = useMemo(() => {
        if (!cars.length) return cars;
        const sortOption = sortOptionsList.find(opt => opt.value === currentSort);
        if (sortOption && currentSort !== 'recommended') {
            return [...cars].sort(sortOption.sortFn);
        }
        return cars;
    }, [cars, currentSort, sortOptionsList]);

    const handlePageChange = useCallback((page: number) => {
        goToPage(page);
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [goToPage]);

    const handleClearFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        ['fuel_id', 'transmission_id', 'color_id', 'body_type_id',
            'filter_year_from', 'filter_year_to', 'filter_price_from', 'filter_price_to']
            .forEach(key => params.delete(key));
        window.location.href = `/cars?${params.toString()}`;
    }, [searchParams]);

    // Loading state
    if (loading && cars.length === 0) {
        return (
            <div className="flex gap-8">
                <div className="hidden lg:block w-72 shrink-0">
                    <div className="bg-surface-2 border border-light/20 rounded-xl p-4 space-y-4 sticky top-24">
                        <div className="h-8 bg-surface-3 rounded w-3/4 animate-pulse" />
                        <div className="h-32 bg-surface-3 rounded animate-pulse" />
                        <div className="h-32 bg-surface-3 rounded animate-pulse" />
                    </div>
                </div>
                <div className="flex-1 space-y-8">
                    <div className="bg-surface-2 border border-light/20 rounded-xl p-4">
                        <div className="h-10 bg-surface-3 rounded-lg w-40 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[...Array(12)].map((_, i) => (
                            <CarCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex gap-8">
                <div className="hidden lg:block w-72 shrink-0">
                    <AdvancedFilterSidebar
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                    />
                </div>
                <div className="flex-1 text-center py-16 bg-surface-2/30 rounded-2xl border border-light/20">
                    <AlertCircle className="w-12 h-12 text-orange-primary mx-auto mb-4" />
                    <p className="text-secondary mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                    >
                        Provo përsëri
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-8 relative">
            <AdvancedFilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

            <div className="flex-1 min-w-0 space-y-8" ref={contentRef}>
                {/* Sort Bar */}
                <div className="bg-surface-2 border border-light/20 rounded-xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="w-full lg:w-auto">
                        <CompactSearch variant="header" />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <span className="text-sm text-muted whitespace-nowrap">
                            <ArrowUpDown size={14} className="inline mr-1" />
                            Rendit:
                        </span>
                        <div className="w-full lg:w-48">
                            <CustomSelect
                                value={currentSort}
                                onChange={setCurrentSort}
                                options={sortSelectOptions}
                                placeholder="Zgjidh renditjen"
                            />
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {hasClientFilters && loading && searchProgress > 0 && searchProgress < 100 && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">Duke kërkuar...</span>
                            <span className="text-orange-500">{searchProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1">
                            <div
                                className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${searchProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Results count */}
                {totalMatches > 0 && (
                    <div className="flex justify-between items-center px-2">
                        <p className="text-sm text-muted">
                            Duke shfaqur {displayedCars.length} nga {totalMatches} makina
                            {hasClientFilters && loading && (
                                <span className="ml-2 text-xs text-orange-500 animate-pulse">
                                    (duke kërkuar...)
                                </span>
                            )}
                        </p>
                        {totalPages > 1 && (
                            <p className="text-sm text-muted">Faqja {currentPage} nga {totalPages}</p>
                        )}
                    </div>
                )}

                {/* Car grid */}
                {displayedCars.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {displayedCars.map((car: Car) => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                )}

                {/* Loading More */}
                {loadingMore && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <CarCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !loadingMore && displayedCars.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 bg-surface-2/30 rounded-2xl border border-light/20">
                        <Search className="w-12 h-12 text-muted mb-4" />
                        <p className="text-secondary mb-2">Nuk u gjet asnjë makinë</p>
                        <p className="text-sm text-muted mb-6 text-center max-w-md">
                            {hasClientFilters
                                ? 'Kemi kontrolluar të gjitha faqet por nuk gjetëm makina.'
                                : 'Provo të ndryshosh kriteret e kërkimit.'}
                        </p>
                        {hasClientFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                            >
                                Pastro filtrat
                            </button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        onNext={() => handlePageChange(currentPage + 1)}
                        onPrev={() => handlePageChange(currentPage - 1)}
                        hasNext={currentPage < totalPages}
                        hasPrev={currentPage > 1}
                        loading={loadingMore}
                    />
                )}
            </div>

            <FilterToggle onClick={() => setIsFilterOpen(true)} />
        </div>
    );
}