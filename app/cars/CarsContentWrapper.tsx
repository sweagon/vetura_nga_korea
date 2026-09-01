'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CarCard from '@/components/cars/CarCard';
import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { AlertCircle, ArrowUpDown, Loader2, Search } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import CompactSearch from '@/components/ui/CompactSearch';
import AdvancedFilterSidebar from '@/components/filters/AdvancedFilterSidebar';
import Pagination from '@/components/ui/Pagination';
import MobileFilterBar from '@/components/cars/MobileFilterBar';
import MobileSortSheet from '@/components/cars/MobileSortSheet';
import { useCarFilters } from '@/hooks/useCarFilters';
import { useFilter } from '@/contexts/FilterContext';
import { type Car, getVehicleTypeFromBodyName } from '@/lib/api';
import { useConfig } from '@/lib/ConfigContext';
import { getDisplayPrice } from '@/lib/pricing';

interface SortOption {
    value: string;
    label: string;
    sortFn: (a: Car, b: Car) => number;
}

const priceCache = new Map<string, number>();
const PRICE_CACHE_MAX = 400;

export default function CarsContentWrapper() {
    const { isFilterOpen, setIsFilterOpen } = useFilter();
    const { config } = useConfig();
    const [currentSort, setCurrentSort] = useState('recommended');
    const [sortOpen, setSortOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    const searchParams = useSearchParams();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const sheetOpen = isFilterOpen || sortOpen;

    useEffect(() => {
        if (sheetOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        };
    }, [sheetOpen]);

    // Close sheets with the Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsFilterOpen(false);
                setSortOpen(false);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [setIsFilterOpen]);

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
        cars, loading, loadingMore, currentPage, totalPages, totalMatches,
        searchProgress, currentSearchPage, totalSearchPages, hasClientFilters,
        error, isSearching, goToPage
    } = useCarFilters(serverFilters, clientFilters);

    const getCarDisplayPrice = useCallback((car: Car): number => {
        if (priceCache.has(car.id)) return priceCache.get(car.id) || 0;

        const lot = car.lots?.[0];
        if (!lot || !config) return 0;

        try {
            const vehicleType = getVehicleTypeFromBodyName(car.body_type?.name || '');
            const finalPrice = getDisplayPrice(lot, config, vehicleType);
            if (finalPrice > 0) {
                if (priceCache.size >= PRICE_CACHE_MAX) priceCache.clear();
                priceCache.set(car.id, finalPrice);
                return finalPrice;
            }
        } catch (err) {
            console.error('Error calculating price for car:', car.id, err);
        }
        return 0;
    }, [config]);

    const getCarMileage = useCallback((car: Car): number => {
        return car.lots?.[0]?.odometer?.km || 0;
    }, []);

    const sortOptionsList = useMemo<SortOption[]>(() => [
        { value: 'recommended', label: 'Të rekomanduara', sortFn: () => 0 },
        { value: 'price_asc', label: 'Çmimi: Nga më i ulëti', sortFn: (a, b) => getCarDisplayPrice(a) - getCarDisplayPrice(b) },
        { value: 'price_desc', label: 'Çmimi: Nga më i larti', sortFn: (a, b) => getCarDisplayPrice(b) - getCarDisplayPrice(a) },
        { value: 'year_desc', label: 'Viti: Më të rijtë', sortFn: (a, b) => b.year - a.year },
        { value: 'year_asc', label: 'Viti: Më të vjetrit', sortFn: (a, b) => a.year - b.year },
        { value: 'mileage_asc', label: 'Kilometrazha: Më e ulët', sortFn: (a, b) => getCarMileage(a) - getCarMileage(b) },
        { value: 'mileage_desc', label: 'Kilometrazha: Më e lartë', sortFn: (a, b) => getCarMileage(b) - getCarMileage(a) },
    ], [getCarDisplayPrice, getCarMileage]);

    const sortSelectOptions = useMemo(() =>
        sortOptionsList.map(opt => ({ value: opt.value, label: opt.label })),
        [sortOptionsList]
    );

    const activeFilterCount = useMemo(() =>
        Object.values(clientFilters).filter(Boolean).length,
        [clientFilters]
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

    const isInitialLoad = loading && cars.length === 0;
    const isSearchingWithNoResults = isSearching && cars.length === 0;
    const hasResults = cars.length > 0;
    const isDoneSearching = !isSearching && !loading;

    if (!isClient) {
        return (
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="hidden lg:block lg:w-72 lg:shrink-0"></div>
                <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="hidden lg:block lg:w-72 lg:shrink-0">
                    <AdvancedFilterSidebar isOpen={false} onClose={() => { }} />
                </div>
                <div className="flex-1 text-center py-16 bg-surface-2/30 rounded-2xl border border-light/20">
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <p className="text-secondary mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-dark transition-colors text-sm font-medium"
                    >
                        Provo përsëri
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-8 relative">
                {/* Sidebar: sticky column on desktop, fixed bottom sheet on mobile */}
                <AdvancedFilterSidebar
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                />

                <div className="flex-1 min-w-0 space-y-8 pb-24 lg:pb-0" ref={contentRef}>
                    <div className="bg-surface-2 border border-light/20 rounded-xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
                        <div className="w-full lg:w-auto">
                            <CompactSearch variant="header" />
                        </div>
                        <div className="hidden lg:flex items-center gap-3 w-full lg:w-auto">
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

                    {isSearching && searchProgress > 0 && searchProgress < 100 && (
                        <div className="space-y-2 bg-surface-2/50 backdrop-blur-sm rounded-xl p-4 border border-light/20">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Loader2 size={16} className="text-orange-500 animate-spin" />
                                    <span className="text-sm text-primary">Duke kërkuar...</span>
                                </div>
                                <span className="text-sm font-medium text-orange-500">{searchProgress}%</span>
                            </div>
                            <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-300"
                                    style={{ width: `${searchProgress}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted">
                                    Faqja {currentSearchPage} nga {totalSearchPages || '?'}
                                </span>
                                {totalMatches > 0 && (
                                    <span className="text-orange-500">
                                        {totalMatches} makina
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {hasResults && (
                        <div className="flex justify-between items-center px-2">
                            <p className="text-sm text-muted">
                                Duke shfaqur {displayedCars.length} nga {totalMatches} makina
                                {isSearching && (
                                    <span className="ml-2 text-xs text-orange-500 animate-pulse">
                                        (duke përditësuar...)
                                    </span>
                                )}
                            </p>
                            {!isSearching && totalPages > 1 && (
                                <p className="text-sm text-muted">Faqja {currentPage} nga {totalPages}</p>
                            )}
                        </div>
                    )}

                    {isInitialLoad || isSearchingWithNoResults ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {[...Array(12)].map((_, i) => (
                                <CarCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : hasResults ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {displayedCars.map((car: Car) => (
                                <CarCard key={car.id} car={car} />
                            ))}
                        </div>
                    ) : isDoneSearching && !hasResults ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-surface-2/30 to-surface-2/20 rounded-2xl border border-light/20">
                            <Search className="w-16 h-16 text-muted/30 mb-4" strokeWidth={1} />
                            <h3 className="text-xl font-semibold text-primary mb-2">Nuk u gjet asnjë makinë</h3>
                            <p className="text-secondary mb-6 text-center max-w-md">
                                {hasClientFilters
                                    ? 'Nuk kemi makina që përputhen me kriteret e tua.'
                                    : 'Provo të ndryshosh kriteret e kërkimit.'}
                            </p>
                            {hasClientFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-dark transition-colors text-sm font-medium"
                                >
                                    Pastro filtrat
                                </button>
                            )}
                        </div>
                    ) : null}

                    {loadingMore && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
                            {[...Array(6)].map((_, i) => (
                                <CarCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {!isSearching && !loading && totalPages > 1 && (
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
            </div>

            <MobileFilterBar
                onOpenFilters={() => setIsFilterOpen(true)}
                onOpenSort={() => setSortOpen(true)}
                activeCount={activeFilterCount}
            />

            <MobileSortSheet
                open={sortOpen}
                onClose={() => setSortOpen(false)}
                options={sortSelectOptions}
                current={currentSort}
                onSelect={(value) => {
                    setCurrentSort(value);
                    setSortOpen(false);
                }}
            />
        </>
    );
}
