'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchCars, type Car } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';

const PER_PAGE = 12;
const API_PAGE_SIZE = 50;
const BATCH_SIZE = 5;
const DEBOUNCE_DELAY = 400; // ms

interface FilterState {
    cars: Car[];
    loading: boolean;
    loadingMore: boolean;
    currentPage: number;
    totalPages: number;
    totalMatches: number;
    searchProgress: number;
    currentSearchPage: number;
    totalSearchPages: number;
    error: string | null;
    showSkeleton: boolean;
}

export function useFilterWithSkeleton(
    serverFilters: Record<string, any>,
    clientFilters: Record<string, string>
) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlPage = Number(searchParams.get('page')) || 1;

    // Memoize filter values
    const serverFiltersStr = useMemo(() => JSON.stringify(serverFilters), [serverFilters]);
    const clientFiltersStr = useMemo(() => JSON.stringify(clientFilters), [clientFilters]);
    const hasClientFilters = useMemo(() =>
        Object.values(clientFilters).some(v => v !== ''),
        [clientFilters] // Fix: use clientFilters directly, not clientFiltersStr
    );

    const [state, setState] = useState<FilterState>({
        cars: [],
        loading: true,
        loadingMore: false,
        currentPage: hasClientFilters ? 1 : urlPage,
        totalPages: 0,
        totalMatches: 0,
        searchProgress: 0,
        currentSearchPage: 0,
        totalSearchPages: 0,
        error: null,
        showSkeleton: true
    });

    const allMatchesRef = useRef<Car[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Show skeleton immediately on filter change
    useEffect(() => {
        setState(prev => ({ ...prev, showSkeleton: true }));

        const timeout = setTimeout(() => {
            if (state.loading) {
                setState(prev => ({ ...prev, showSkeleton: true }));
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [serverFiltersStr, clientFiltersStr, state.loading]);

    // Server-only pagination
    const fetchServerPage = useCallback(async (page: number) => {
        try {
            const response = await fetchCars({
                page,
                per_page: PER_PAGE,
                vehicle_type: '1',
                ...JSON.parse(serverFiltersStr)
            });

            if (abortControllerRef.current?.signal.aborted) return;

            const cars = response.data || [];
            const totalFromApi = response.meta?.total || 0;

            setState({
                cars,
                loading: false,
                loadingMore: false,
                currentPage: page,
                totalPages: Math.ceil(totalFromApi / PER_PAGE) || 1,
                totalMatches: totalFromApi,
                searchProgress: 100,
                currentSearchPage: 0,
                totalSearchPages: 0,
                error: null,
                showSkeleton: false
            });
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Error fetching server page:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                showSkeleton: false,
                error: 'Failed to load cars'
            }));
        }
    }, [serverFiltersStr]);

    // Optimized filter function
    const matchesFilters = useCallback((car: Car): boolean => {
        if (clientFilters.fuel_id && car.fuel?.id.toString() !== clientFilters.fuel_id) return false;
        if (clientFilters.transmission_id && car.transmission?.id.toString() !== clientFilters.transmission_id) return false;
        if (clientFilters.color_id && car.color?.id.toString() !== clientFilters.color_id) return false;
        if (clientFilters.body_type_id && car.body_type?.id.toString() !== clientFilters.body_type_id) return false;

        if (clientFilters.yearFrom) {
            const yearFrom = parseInt(clientFilters.yearFrom);
            if (!isNaN(yearFrom) && car.year < yearFrom) return false;
        }
        if (clientFilters.yearTo) {
            const yearTo = parseInt(clientFilters.yearTo);
            if (!isNaN(yearTo) && car.year > yearTo) return false;
        }

        const price = car.lots?.[0]?.buy_now || 0;
        if (clientFilters.priceFrom) {
            const priceFrom = parseInt(clientFilters.priceFrom);
            if (!isNaN(priceFrom) && price < priceFrom) return false;
        }
        if (clientFilters.priceTo) {
            const priceTo = parseInt(clientFilters.priceTo);
            if (!isNaN(priceTo) && price > priceTo) return false;
        }

        return true;
    }, [clientFilters]);

    // Client-side filtering with early bail for no results
    const searchWithClientFilters = useCallback(async () => {
        try {
            const firstResponse = await fetchCars({
                page: 1,
                per_page: API_PAGE_SIZE,
                vehicle_type: '1',
                ...JSON.parse(serverFiltersStr)
            });

            if (abortControllerRef.current?.signal.aborted) return;

            const totalApiPages = firstResponse.meta?.total
                ? Math.ceil(firstResponse.meta.total / API_PAGE_SIZE)
                : 100;

            setState(prev => ({
                ...prev,
                totalSearchPages: totalApiPages
            }));

            let allMatches: Car[] = [];

            // Check first page for matches - if none, maybe bail early
            const firstPageMatches = (firstResponse.data || []).filter(matchesFilters);
            if (firstPageMatches.length > 0) {
                allMatches = [...firstPageMatches];
            }

            // Fetch next 4 pages (total 5)
            const initialBatch = [];
            for (let i = 2; i <= 5; i++) {
                initialBatch.push(fetchCars({
                    page: i,
                    per_page: API_PAGE_SIZE,
                    vehicle_type: '1',
                    ...JSON.parse(serverFiltersStr)
                }));
            }

            const initialResults = await Promise.all(initialBatch);

            if (abortControllerRef.current?.signal.aborted) return;

            initialResults.forEach(response => {
                const matches = (response.data || []).filter(matchesFilters);
                if (matches.length > 0) {
                    allMatches = [...allMatches, ...matches];
                }
            });

            allMatchesRef.current = allMatches;

            // If no matches at all after 5 pages, show empty state quickly
            if (allMatches.length === 0) {
                setState(prev => ({
                    ...prev,
                    cars: [],
                    totalMatches: 0,
                    totalPages: 0,
                    searchProgress: 100,
                    currentSearchPage: 5,
                    loading: false,
                    showSkeleton: false
                }));
                return;
            }

            // Show first page of results
            setState(prev => ({
                ...prev,
                cars: allMatches.slice(0, PER_PAGE),
                totalMatches: allMatches.length,
                totalPages: Math.ceil(allMatches.length / PER_PAGE),
                searchProgress: Math.round((5 / totalApiPages) * 100),
                currentSearchPage: 5,
                loading: false,
                showSkeleton: false
            }));

            // Continue fetching in background only if there are matches
            if (allMatches.length > 0) {
                let pagesFetched = 5;
                for (let page = 6; page <= totalApiPages; page += BATCH_SIZE) {
                    if (abortControllerRef.current?.signal.aborted) break;

                    const batch = [];
                    for (let i = 0; i < BATCH_SIZE && page + i <= totalApiPages; i++) {
                        batch.push(fetchCars({
                            page: page + i,
                            per_page: API_PAGE_SIZE,
                            vehicle_type: '1',
                            ...JSON.parse(serverFiltersStr)
                        }));
                    }

                    const batchResults = await Promise.all(batch);

                    if (abortControllerRef.current?.signal.aborted) break;

                    batchResults.forEach(response => {
                        const matches = (response.data || []).filter(matchesFilters);
                        if (matches.length > 0) {
                            allMatches = [...allMatches, ...matches];
                            allMatchesRef.current = allMatches;
                        }
                    });

                    pagesFetched += BATCH_SIZE;
                    const lastPage = Math.min(page + BATCH_SIZE - 1, totalApiPages);

                    setState(prev => ({
                        ...prev,
                        totalMatches: allMatches.length,
                        totalPages: Math.ceil(allMatches.length / PER_PAGE),
                        searchProgress: Math.min(100, Math.round((pagesFetched / totalApiPages) * 100)),
                        currentSearchPage: lastPage
                    }));
                }
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Error in client search:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                showSkeleton: false,
                error: 'Search failed'
            }));
        }
    }, [serverFiltersStr, matchesFilters]);

    // Debounced filter change handler
    const debouncedFilterChange = useCallback(
        debounce(() => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();
            allMatchesRef.current = [];

            setState(prev => ({
                ...prev,
                loading: true,
                showSkeleton: true,
                currentPage: hasClientFilters ? 1 : urlPage,
                searchProgress: 0,
                error: null
            }));

            if (!hasClientFilters) {
                fetchServerPage(urlPage);
            } else {
                searchWithClientFilters();
            }
        }, DEBOUNCE_DELAY),
        [hasClientFilters, urlPage, fetchServerPage, searchWithClientFilters]
    );

    // Trigger search when filters change
    useEffect(() => {
        debouncedFilterChange();

        return () => {
            debouncedFilterChange.cancel();
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [serverFiltersStr, clientFiltersStr, urlPage, debouncedFilterChange]);

    // Optimized page change
    const goToPage = useCallback((page: number) => {
        if (!hasClientFilters) {
            setState(prev => ({ ...prev, loadingMore: true }));
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', page.toString());
            router.push(`/cars?${params.toString()}`);
        } else {
            setState(prev => ({ ...prev, loadingMore: true, showSkeleton: true }));

            requestAnimationFrame(() => {
                const start = (page - 1) * PER_PAGE;
                const end = start + PER_PAGE;
                const displayCars = allMatchesRef.current.slice(start, end);

                setState(prev => ({
                    ...prev,
                    cars: displayCars,
                    currentPage: page,
                    loadingMore: false,
                    showSkeleton: false
                }));
            });
        }

        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }, [hasClientFilters, router, searchParams]);

    return {
        cars: state.cars,
        loading: state.loading,
        loadingMore: state.loadingMore,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalMatches: state.totalMatches,
        searchProgress: state.searchProgress,
        currentSearchPage: state.currentSearchPage,
        totalSearchPages: state.totalSearchPages,
        hasClientFilters,
        error: state.error,
        showSkeleton: state.showSkeleton,
        goToPage
    };
}