// app/cars/CarGrid.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import CarCard from '@/components/cars/CarCard';
import { fetchCars, type Car } from '@/lib/api';
import { ChevronLeft, ChevronRight, Car as CarIcon } from 'lucide-react';

// Cache for car data
const carCache = new Map<string, { cars: Car[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function CarGrid() {
    const searchParams = useSearchParams();
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    const abortControllerRef = useRef<AbortController | null>(null);
    const prevParamsRef = useRef<string>('');

    const currentPage = Number(searchParams.get('page')) || 1;
    const itemsPerPage = 12;

    // Get makes array from URL
    const getMakesArray = useCallback((): string[] => {
        const makes = searchParams.get('make');
        if (!makes) return [];
        return makes.split(',').filter(Boolean);
    }, [searchParams]);

    // Build cache key from search params
    const getCacheKey = useCallback(() => {
        return searchParams.toString();
    }, [searchParams]);

    // Load cars based on URL params
    useEffect(() => {
        const loadCars = async () => {
            const cacheKey = getCacheKey();

            // Skip if params haven't changed
            if (prevParamsRef.current === cacheKey && cars.length > 0) {
                return;
            }

            prevParamsRef.current = cacheKey;

            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setLoading(true);

            try {
                // Check cache first
                const cached = carCache.get(cacheKey);
                if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                    console.log('📦 Using cached car data');
                    setCars(cached.cars);
                    setPagination({
                        page: currentPage,
                        totalPages: Math.ceil(cached.cars.length / itemsPerPage),
                        total: cached.cars.length
                    });
                    setLoading(false);
                    return;
                }

                // Build base filters from URL params (excluding make)
                const baseFilters: Record<string, any> = {};

                if (searchParams.get('search')) baseFilters.search = searchParams.get('search')!;
                if (searchParams.get('model')) baseFilters.model = searchParams.get('model')!;
                if (searchParams.get('minPrice')) baseFilters.minPrice = searchParams.get('minPrice')!;
                if (searchParams.get('maxPrice')) baseFilters.maxPrice = searchParams.get('maxPrice')!;
                if (searchParams.get('minYear')) baseFilters.minYear = searchParams.get('minYear')!;
                if (searchParams.get('maxYear')) baseFilters.maxYear = searchParams.get('maxYear')!;
                if (searchParams.get('fuelType')) baseFilters.fuelType = searchParams.get('fuelType')!;
                if (searchParams.get('transmission')) baseFilters.transmission = searchParams.get('transmission')!;
                if (searchParams.get('sort')) baseFilters.sort = searchParams.get('sort')!;

                // Add pagination
                baseFilters.page = '1'; // Fetch first page for each make
                baseFilters.limit = '50'; // Fetch more cars per make to combine

                const makes = getMakesArray();
                let allCars: Car[] = [];

                if (makes.length > 1) {
                    console.log('🔍 Fetching multiple makes separately:', makes);

                    // Fetch each make separately
                    const promises = makes.map(make =>
                        fetchCars({
                            ...baseFilters,
                            make
                        })
                    );

                    const results = await Promise.all(promises);

                    // Combine all cars and remove duplicates by id
                    const carMap = new Map<number, Car>();
                    results.forEach(result => {
                        result.cars.forEach(car => {
                            if (!carMap.has(car.id)) {
                                carMap.set(car.id, car);
                            }
                        });
                    });

                    allCars = Array.from(carMap.values());
                    console.log(`✅ Combined ${allCars.length} cars from ${makes.length} makes`);
                } else {
                    // Single make or no make
                    const filters = { ...baseFilters };
                    if (makes.length === 1) {
                        filters.make = makes[0];
                    }

                    console.log('🔍 Fetching single make:', filters);
                    const data = await fetchCars(filters);
                    allCars = data.cars;
                }

                // Apply sorting client-side if needed
                const sortOption = searchParams.get('sort') || 'price_desc';
                allCars = [...allCars].sort((a, b) => {
                    switch (sortOption) {
                        case 'price_asc': return (a.price || 0) - (b.price || 0);
                        case 'price_desc': return (b.price || 0) - (a.price || 0);
                        case 'year_desc': return (b.year || 0) - (a.year || 0);
                        case 'mileage_asc': return (a.mileage || 0) - (b.mileage || 0);
                        default: return (b.id || 0) - (a.id || 0);
                    }
                });

                // Apply pagination
                const start = (currentPage - 1) * itemsPerPage;
                const paginatedCars = allCars.slice(start, start + itemsPerPage);
                const totalPages = Math.ceil(allCars.length / itemsPerPage);

                setCars(paginatedCars);
                setPagination({
                    page: currentPage,
                    totalPages: totalPages || 1,
                    total: allCars.length
                });

                // Cache the results
                carCache.set(cacheKey, {
                    cars: allCars,
                    timestamp: Date.now()
                });

                // Limit cache size
                if (carCache.size > 20) {
                    const firstKey = carCache.keys().next().value;
                    if (firstKey) carCache.delete(firstKey);
                }
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    return;
                }
                console.error('Error loading cars:', error);
                setCars([]);
                setPagination({
                    page: 1,
                    totalPages: 1,
                    total: 0
                });
            } finally {
                setLoading(false);
                abortControllerRef.current = null;
            }
        };

        loadCars();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [searchParams, currentPage, getCacheKey, itemsPerPage, getMakesArray]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());

        // Update URL without refresh
        window.history.pushState(null, '', `/cars?${params.toString()}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearFilters = () => {
        window.location.href = '/cars';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-surface rounded-xl border border-medium p-4">
                            <div className="h-48 bg-surface-2 rounded-lg mb-4 animate-pulse"></div>
                            <div className="h-4 bg-surface-2 rounded w-3/4 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-surface-2 rounded w-1/2 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (cars.length === 0) {
        return (
            <div className="text-center py-16 bg-surface rounded-xl border border-medium">
                <div className="w-20 h-20 bg-ferrari-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CarIcon size={32} className="text-ferrari-red" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Nuk u gjet asnjë makinë</h3>
                <p className="text-secondary mb-6">
                    Provo të ndryshosh filtrat ose të kërkosh për diçka tjetër
                </p>
                <button
                    onClick={handleClearFilters}
                    className="btn-primary"
                >
                    Pastro filtrat
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Results count */}
            <div className="flex items-center justify-between">
                <p className="text-secondary">
                    Duke shfaqur <span className="font-semibold text-ferrari-red">{cars.length}</span> nga {pagination.total} makina
                </p>
            </div>

            {/* Cars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {cars.map(car => (
                    <CarCard key={car.id} car={car} />
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="p-2 border border-medium rounded-lg disabled:opacity-50 
                                 hover:border-ferrari-red transition disabled:hover:border-medium
                                 bg-surface"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.page >= pagination.totalPages - 2) {
                                pageNum = pagination.totalPages - 4 + i;
                            } else {
                                pageNum = pagination.page - 2 + i;
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-9 h-9 rounded-lg text-sm font-medium transition 
                                        ${pagination.page === pageNum
                                            ? 'bg-ferrari-red text-white'
                                            : 'border border-medium hover:border-ferrari-red bg-surface text-primary'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="p-2 border border-medium rounded-lg disabled:opacity-50 
                                 hover:border-ferrari-red transition disabled:hover:border-medium
                                 bg-surface"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}