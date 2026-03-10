// hooks/useSmartFilters.ts
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchCars, type Car } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

// Configuration
const CARS_PER_PAGE = 50;
const DISPLAY_PER_PAGE = 12;
const BATCH_SIZE = 5;

interface SmartFiltersState {
    cars: Car[];
    loading: boolean;
    loadingMore: boolean;
    currentPage: number;
    totalPages: number;
    totalMatches: number;
    usingClientFilters: boolean;
    searchProgress: number;
    error: string | null;
}

export function useSmartFilters(
    serverFilters: Record<string, any>,
    clientFilters: Record<string, string>
) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current page from URL
    const urlPage = Number(searchParams.get('page')) || 1;

    // Check if any client-side filters are active
    const hasClientFilters = Object.values(clientFilters).some(v => v !== '');

    const [state, setState] = useState<SmartFiltersState>({
        cars: [],
        loading: true,
        loadingMore: false,
        currentPage: hasClientFilters ? 1 : urlPage,
        totalPages: 0,
        totalMatches: 0,
        usingClientFilters: hasClientFilters,
        searchProgress: 0,
        error: null
    });

    // Refs for tracking
    const allMatchesRef = useRef<Car[]>([]);
    const isLoadingRef = useRef(false);
    const filtersRef = useRef({ serverFilters, clientFilters });
    const initialLoadDoneRef = useRef(false);
    const prevClientFiltersRef = useRef(JSON.stringify(clientFilters));
    const prevUrlPageRef = useRef(urlPage);
    const prevServerFiltersRef = useRef(JSON.stringify(serverFilters));

    // Update filters ref
    useEffect(() => {
        filtersRef.current = { serverFilters, clientFilters };
    }, [serverFilters, clientFilters]);

    // Reset to page 1 when client filters change
    useEffect(() => {
        if (hasClientFilters) {
            const clientFiltersChanged = prevClientFiltersRef.current !== JSON.stringify(clientFilters);
            if (clientFiltersChanged) {
                setState(prev => ({
                    ...prev,
                    currentPage: 1,
                    loading: true,
                    searchProgress: 0
                }));
                initialLoadDoneRef.current = false;
                allMatchesRef.current = [];
                prevClientFiltersRef.current = JSON.stringify(clientFilters);
            }
        }
    }, [clientFilters, hasClientFilters]);

    // Filter function
    const matchesFilters = useCallback((car: Car): boolean => {
        const filters = filtersRef.current.clientFilters;

        if (filters.fuel_id && car.fuel?.id.toString() !== filters.fuel_id) return false;
        if (filters.transmission_id && car.transmission?.id.toString() !== filters.transmission_id) return false;
        if (filters.color_id && car.color?.id.toString() !== filters.color_id) return false;
        if (filters.body_type_id && car.body_type?.id.toString() !== filters.body_type_id) return false;
        if (filters.yearFrom && car.year < parseInt(filters.yearFrom)) return false;
        if (filters.yearTo && car.year > parseInt(filters.yearTo)) return false;
        if (filters.priceFrom) {
            const price = car.lots?.[0]?.buy_now || 0;
            if (price < parseInt(filters.priceFrom)) return false;
        }
        if (filters.priceTo) {
            const price = car.lots?.[0]?.buy_now || 0;
            if (price > parseInt(filters.priceTo)) return false;
        }
        return true;
    }, []);

    // MODE 1: Server-side only (no client filters) - NORMAL PAGINATION
    useEffect(() => {
        if (hasClientFilters) return;

        // Check if we really need to fetch
        const serverFiltersChanged = prevServerFiltersRef.current !== JSON.stringify(serverFilters);
        const pageChanged = prevUrlPageRef.current !== urlPage;

        if (!pageChanged && !serverFiltersChanged && !state.loading) {
            return;
        }

        let isMounted = true;

        const fetchServerPage = async () => {
            setState(prev => ({ ...prev, loading: true }));

            try {
                const response = await fetchCars({
                    page: urlPage,
                    per_page: DISPLAY_PER_PAGE,
                    vehicle_type: '1',
                    ...serverFilters
                });

                if (!isMounted) return;

                const totalFromApi = response.meta?.total || 0;
                const totalPages = Math.ceil(totalFromApi / DISPLAY_PER_PAGE);

                console.log('📊 Server Mode:', {
                    urlPage,
                    carsReceived: response.data?.length,
                    totalFromApi,
                    totalPages,
                    hasPagination: totalPages > 1
                });

                setState({
                    cars: response.data || [],
                    loading: false,
                    loadingMore: false,
                    currentPage: urlPage,
                    totalPages: totalPages,
                    totalMatches: totalFromApi,
                    usingClientFilters: false,
                    searchProgress: 100,
                    error: null
                });

                prevUrlPageRef.current = urlPage;
                prevServerFiltersRef.current = JSON.stringify(serverFilters);

            } catch (error) {
                if (!isMounted) return;
                console.error('Error fetching:', error);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to load cars'
                }));
            }
        };

        fetchServerPage();

        return () => {
            isMounted = false;
        };
    }, [urlPage, serverFilters, hasClientFilters, state.loading]);

    // MODE 2: Client-side filtering active - FETCH ALL PAGES WITH PROGRESS
    useEffect(() => {
        if (!hasClientFilters || initialLoadDoneRef.current) return;

        initialLoadDoneRef.current = true;

        const fetchAllPages = async () => {
            if (isLoadingRef.current) return;
            isLoadingRef.current = true;

            setState(prev => ({ ...prev, loading: true, searchProgress: 0 }));

            try {
                // First, get total pages from API
                const firstResponse = await fetchCars({
                    page: 1,
                    per_page: CARS_PER_PAGE,
                    vehicle_type: '1',
                    ...serverFilters
                });

                const totalApiPages = firstResponse.meta?.total
                    ? Math.ceil(firstResponse.meta.total / CARS_PER_PAGE)
                    : 100;

                let allMatches: Car[] = [];

                // Fetch first 5 pages immediately
                const initialBatch = [];
                for (let i = 1; i <= 5; i++) {
                    initialBatch.push(fetchCars({
                        page: i,
                        per_page: CARS_PER_PAGE,
                        vehicle_type: '1',
                        ...serverFilters
                    }));
                }

                const initialResults = await Promise.all(initialBatch);

                initialResults.forEach(response => {
                    const matches = (response.data || []).filter(matchesFilters);
                    if (matches.length > 0) {
                        allMatches = [...allMatches, ...matches];
                    }
                });

                allMatchesRef.current = allMatches;

                const totalPages = Math.ceil(allMatches.length / DISPLAY_PER_PAGE);
                const progress = Math.round((5 / totalApiPages) * 100);

                setState(prev => ({
                    ...prev,
                    cars: allMatches.slice(0, DISPLAY_PER_PAGE),
                    totalMatches: allMatches.length,
                    totalPages: totalPages,
                    loading: false,
                    searchProgress: progress
                }));

                // Continue fetching in background with progress updates
                let pagesFetched = 5;
                for (let page = 6; page <= totalApiPages; page += BATCH_SIZE) {
                    const batch = [];
                    for (let i = 0; i < BATCH_SIZE && page + i <= totalApiPages; i++) {
                        batch.push(fetchCars({
                            page: page + i,
                            per_page: CARS_PER_PAGE,
                            vehicle_type: '1',
                            ...serverFilters
                        }));
                    }

                    const batchResults = await Promise.all(batch);

                    batchResults.forEach(response => {
                        const matches = (response.data || []).filter(matchesFilters);
                        if (matches.length > 0) {
                            allMatches = [...allMatches, ...matches];
                            allMatchesRef.current = allMatches;
                        }
                    });

                    pagesFetched += BATCH_SIZE;
                    const newProgress = Math.min(100, Math.round((pagesFetched / totalApiPages) * 100));

                    setState(prev => ({
                        ...prev,
                        totalMatches: allMatches.length,
                        totalPages: Math.ceil(allMatches.length / DISPLAY_PER_PAGE),
                        searchProgress: newProgress,
                        cars: prev.currentPage === 1
                            ? allMatches.slice(0, DISPLAY_PER_PAGE)
                            : prev.cars
                    }));
                }

                setState(prev => ({
                    ...prev,
                    searchProgress: 100
                }));

            } catch (error) {
                console.error('Error:', error);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to load cars'
                }));
            }

            isLoadingRef.current = false;
        };

        fetchAllPages();
    }, [serverFilters, clientFilters, hasClientFilters, matchesFilters]);

    // Go to page
    const goToPage = useCallback((page: number) => {
        if (!hasClientFilters) {
            // MODE 1: Server-side - update URL
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', page.toString());
            router.push(`/cars?${params.toString()}`);
        } else {
            // MODE 2: Client-side - use cached matches
            setState(prev => ({ ...prev, loadingMore: true }));

            setTimeout(() => {
                const start = (page - 1) * DISPLAY_PER_PAGE;
                const end = start + DISPLAY_PER_PAGE;
                const displayCars = allMatchesRef.current.slice(start, end);

                setState(prev => ({
                    ...prev,
                    cars: displayCars,
                    currentPage: page,
                    loadingMore: false
                }));
            }, 100);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [hasClientFilters, router, searchParams]);

    return {
        cars: state.cars,
        loading: state.loading,
        loadingMore: state.loadingMore,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalMatches: state.totalMatches,
        usingClientFilters: state.usingClientFilters,
        searchProgress: state.searchProgress,
        goToPage,
        error: state.error
    };
}