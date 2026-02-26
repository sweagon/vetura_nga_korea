'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CarCard from '@/components/cars/CarCard';
import FilterSidebar from '@/components/cars/FilterSidebar';
import { fetchCars } from '@/lib/api';
import { ChevronLeft, ChevronRight, Loader2, XCircle, Car, SlidersHorizontal, Search } from 'lucide-react';


// Define Car interface
interface Car {
    id: number;
    make: string;
    model: string;
    full_name?: string;
    grade?: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    images?: string[];
    [key: string]: any;
}

// Cache for multi-make queries
const queryCache = new Map<string, Car[]>();

export default function CarsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [allCars, setAllCars] = useState<Car[]>([]);
    const [filteredCars, setFilteredCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMakes, setLoadingMakes] = useState<string[]>([]);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    const searchQuery = searchParams.get('search') || '';
    const currentPage = Number(searchParams.get('page')) || 1;

    // Handle multiple makes
    const getMakesArray = useCallback((): string[] => {
        const makes = searchParams.get('make');
        if (!makes) return [];
        return makes.split(',').filter(Boolean);
    }, [searchParams]);

    // Build cache key
    const getCacheKey = useCallback((): string => {
        const makes = getMakesArray();
        const otherParams = {
            search: searchQuery,
            model: searchParams.get('model') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            minYear: searchParams.get('minYear') || '',
            maxYear: searchParams.get('maxYear') || '',
            fuelType: searchParams.get('fuelType') || '',
            transmission: searchParams.get('transmission') || '',
            sort: searchParams.get('sort') || ''
        };
        return JSON.stringify({ makes, ...otherParams });
    }, [searchParams, searchQuery, getMakesArray]);

    // Build filters from URL params
    const buildFilters = useCallback((): Record<string, string> => {
        const filters: Record<string, string> = {
            page: '1',
            limit: '50'
        };

        if (searchQuery) filters.search = searchQuery;
        if (searchParams.get('model')) filters.model = searchParams.get('model')!;
        if (searchParams.get('minPrice')) filters.minPrice = searchParams.get('minPrice')!;
        if (searchParams.get('maxPrice')) filters.maxPrice = searchParams.get('maxPrice')!;
        if (searchParams.get('minYear')) filters.minYear = searchParams.get('minYear')!;
        if (searchParams.get('maxYear')) filters.maxYear = searchParams.get('maxYear')!;
        if (searchParams.get('fuelType')) filters.fuelType = searchParams.get('fuelType')!;
        if (searchParams.get('transmission')) filters.transmission = searchParams.get('transmission')!;
        if (searchParams.get('sort')) filters.sort = searchParams.get('sort')!;

        return filters;
    }, [searchParams, searchQuery]);

    // Optimized fetch for multiple makes
    const fetchCarsForMakes = useCallback(async (): Promise<Car[]> => {
        const makes = getMakesArray();
        if (makes.length === 0) return [];

        // Cancel previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Check cache first
        const cacheKey = getCacheKey();
        if (queryCache.has(cacheKey)) {
            console.log('📦 Using cached results');
            return queryCache.get(cacheKey) || [];
        }

        setLoadingMakes(makes);
        const startTime = performance.now();

        try {
            // Fetch all makes in parallel
            const promises = makes.map(make =>
                fetchCars({
                    ...buildFilters(),
                    make,
                    page: 1,
                    limit: 50
                })
            );

            const results = await Promise.all(promises);
            const allCarsFromMakes = results.flatMap(r => r?.cars || []);

            // Remove duplicates (by id)
            const uniqueCars = Array.from(
                new Map(allCarsFromMakes.map(car => [car.id, car])).values()
            );

            const endTime = performance.now();
            console.log(`✅ Fetched ${uniqueCars.length} cars from ${makes.length} makes in ${(endTime - startTime).toFixed(0)}ms`);

            // Store in cache
            queryCache.set(cacheKey, uniqueCars);

            // Limit cache size
            if (queryCache.size > 20) {
                const firstKey = queryCache.keys().next().value;
                if (firstKey) queryCache.delete(firstKey);
            }

            return uniqueCars;
        } finally {
            setLoadingMakes([]);
            abortControllerRef.current = null;
        }
    }, [getMakesArray, buildFilters, getCacheKey]);

    // Regular fetch for single make or no make
    const fetchRegular = useCallback(async (): Promise<Car[]> => {
        const filters = buildFilters();
        // If there's a single make, pass it directly
        const singleMake = searchParams.get('make');
        if (singleMake && !singleMake.includes(',')) {
            filters.make = singleMake;
        }
        const data = await fetchCars(filters);
        return data?.cars || [];
    }, [buildFilters, searchParams]);

    const getActiveFilterCount = useCallback(() => {
        // This should match your filter logic
        const params = new URLSearchParams(searchParams);
        let count = 0;

        // Check each filter parameter
        if (params.get('make')) count += params.get('make')?.split(',').length || 0;
        if (params.get('model')) count++;
        if (params.get('fuelType')) count += params.get('fuelType')?.split(',').length || 0;
        if (params.get('transmission')) count += params.get('transmission')?.split(',').length || 0;
        if (params.get('minPrice') || params.get('maxPrice')) count++;
        if (params.get('minYear') || params.get('maxYear')) count++;
        if (params.get('minMileage') || params.get('maxMileage')) count++;

        return count;
    }, [searchParams]);

    // Load cars
    useEffect(() => {
        const loadCars = async () => {
            setLoading(true);

            try {
                let cars: Car[] = [];

                // Handle multiple makes specially
                if (getMakesArray().length > 0) {
                    cars = await fetchCarsForMakes();
                } else {
                    cars = await fetchRegular();
                }

                setAllCars(cars);

                // Apply client-side search if needed (as fallback)
                let filtered = cars;
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    filtered = filtered.filter((car: Car) => {
                        const searchableText = `
                            ${car.make} ${car.model} ${car.grade || ''} ${car.full_name || ''} 
                            ${car.fuelType || ''} ${car.transmission || ''}
                        `.toLowerCase();
                        return searchableText.includes(query);
                    });
                }

                // Apply sorting
                const sortOption = searchParams.get('sort') || 'price_asc';
                filtered = [...filtered].sort((a, b) => {
                    switch (sortOption) {
                        case 'price_asc': return (a.price || 0) - (b.price || 0);
                        case 'price_desc': return (b.price || 0) - (a.price || 0);
                        case 'year_desc': return (b.year || 0) - (a.year || 0);
                        case 'mileage_asc': return (a.mileage || 0) - (b.mileage || 0);
                        default: return (b.id || 0) - (a.id || 0);
                    }
                });

                setFilteredCars(filtered);

                // Update pagination
                const itemsPerPage = 12;
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                setPagination({
                    page: Math.min(currentPage, totalPages || 1),
                    totalPages: totalPages || 1,
                    total: filtered.length
                });
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    console.log('Request aborted');
                    return;
                }
                console.error('Error loading cars:', error);
                setFilteredCars([]);
                setPagination({ page: 1, totalPages: 1, total: 0 });
            } finally {
                setLoading(false);
            }
        };

        loadCars();

        // Cleanup on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [searchParams, searchQuery, currentPage, getMakesArray, fetchCarsForMakes, fetchRegular]);

    // Get current page cars
    const currentCars = useMemo((): Car[] => {
        const start = (pagination.page - 1) * 12;
        const end = start + 12;
        return filteredCars.slice(start, end);
    }, [filteredCars, pagination.page]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`/cars?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSortChange = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);
        params.set('page', '1');
        router.push(`/cars?${params.toString()}`);
    };

    // Clear all filters
    const handleClearFilters = () => {
        router.push('/cars');
    };

    return (
        <div className="container-custom py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Të gjitha makinat</h1>
                <p className="text-gray-600">
                    {filteredCars.length} makina të gatshme për import nga Korea
                    {searchQuery && ` për "${searchQuery}"`}
                </p>
                {getMakesArray().length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                        Duke shfaqur markat: {getMakesArray().join(', ')}
                    </p>
                )}
                {loadingMakes.length > 0 && (
                    <p className="text-sm text-ferrari-red mt-1 animate-pulse">
                        Duke kërkuar: {loadingMakes.join(', ')}...
                    </p>
                )}
            </div>

            {/* Search Query Display */}
            {searchQuery && (
                <div className="bg-ferrari-red/10 p-4 rounded-lg mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <Search size={20} className="text-ferrari-red mr-2" />
                        <span>
                            Duke kërkuar: <strong>"{searchQuery}"</strong>
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('search');
                            params.set('page', '1');
                            router.push(`/cars?${params.toString()}`);
                        }}
                        className="text-sm text-ferrari-red hover:underline"
                    >
                        Pastro kërkimin
                    </button>
                </div>
            )}

            {/* Mobile Filter Button */}
            <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden w-full mb-4 btn-secondary flex items-center justify-center"
            >
                <SlidersHorizontal size={18} className="mr-2" />
                Filtro makina
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className={`lg:w-1/5 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
                    <FilterSidebar onFilterChange={() => { }} />
                </div>

                {/* Main Content */}
                <div className="lg:w-4/5">
                    {/* Sort Bar - More compact and integrated */}
                    <div className="bg-surface rounded-xl shadow-sm border border-theme p-4 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-secondary">
                                    Duke shfaqur <span className="font-semibold text-ferrari-red">{currentCars.length}</span> nga {filteredCars.length} makina
                                </span>
                                {getActiveFilterCount() > 0 && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="text-xs text-gray-500 hover:text-ferrari-red flex items-center gap-1"
                                    >
                                        <XCircle size={12} />
                                        <span>Pastro filtrat</span>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-xs text-gray-500 whitespace-nowrap">Rendit sipas:</span>
                                <select
                                    className="flex-1 sm:w-48 px-3 py-1.5 bg-secondary border border-theme rounded-lg text-sm focus:outline-none focus:border-ferrari-red"
                                    value={searchParams.get('sort') || 'price_asc'}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                >
                                    <option value="price_asc">Çmimi: Nga më i ulëti</option>
                                    <option value="price_desc">Çmimi: Nga më i larti</option>
                                    <option value="year_desc">Viti: Më të rijtë</option>
                                    <option value="mileage_asc">Kilometrazha: Më e ulët</option>
                                    <option value="recommended">Të rekomanduara</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cars Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-tertiary h-48 rounded-t-xl"></div>
                                    <div className="bg-surface p-4 rounded-b-xl border border-theme border-t-0">
                                        <div className="h-4 bg-tertiary rounded w-4/5 mb-2"></div>
                                        <div className="h-4 bg-tertiary rounded w-1/2 mb-3"></div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="h-3 bg-tertiary rounded"></div>
                                            <div className="h-3 bg-tertiary rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : currentCars.length === 0 ? (
                        <div className="text-center py-16 bg-surface rounded-xl shadow-sm border border-theme">
                            <div className="w-20 h-20 bg-ferrari-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Car size={32} className="text-ferrari-red" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Nuk u gjet asnjë makinë</h3>
                            <p className="text-secondary mb-6 max-w-md mx-auto">
                                {getMakesArray().length > 0 && searchQuery
                                    ? `Nuk gjetëm makina për "${searchQuery}" nga markat: ${getMakesArray().join(', ')}.`
                                    : getMakesArray().length > 0
                                        ? `Nuk gjetëm makina për markat: ${getMakesArray().join(', ')}. Provo të ndryshosh filtrat.`
                                        : searchQuery
                                            ? `Nuk gjetëm makina për "${searchQuery}". Provo me një kërkim tjetër.`
                                            : 'Provo të ndryshosh filtrat ose të kërkosh për diçka tjetër'
                                }
                            </p>
                            <button
                                onClick={handleClearFilters}
                                className="btn-primary"
                            >
                                Pastro filtrat
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {currentCars.map(car => (
                                    <CarCard key={car.id} car={car} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center space-x-2 mt-12">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="p-2 border border-theme rounded-lg disabled:opacity-50 
                                 hover:border-ferrari-red transition disabled:hover:border-theme
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
                                                            : 'border border-theme hover:border-ferrari-red bg-surface'
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
                                        className="p-2 border border-theme rounded-lg disabled:opacity-50 
                                 hover:border-ferrari-red transition disabled:hover:border-theme
                                 bg-surface"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}