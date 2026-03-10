'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchCars, type Car } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash/debounce';

const PER_PAGE = 12;
const API_PAGE_SIZE = 50;
const BATCH_SIZE = 5;

interface CarFiltersState {
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
}

export function useCarFilters(
    serverFilters: Record<string, any>,
    clientFilters: Record<string, string>
) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlPage = Number(searchParams.get('page')) || 1;

    // Check if ANY client-side filters are active
    const hasClientFilters = useMemo(() =>
        Object.values(clientFilters).some(v => v !== ''),
        [clientFilters]
    );

    const [state, setState] = useState<CarFiltersState>({
        cars: [],
        loading: true,
        loadingMore: false,
        currentPage: hasClientFilters ? 1 : urlPage,
        totalPages: 0,
        totalMatches: 0,
        searchProgress: 0,
        currentSearchPage: 0,
        totalSearchPages: 0,
        error: null
    });

    const allMatchesRef = useRef<Car[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);
    const hasMorePagesRef = useRef<boolean>(true);
    const currentApiPageRef = useRef<number>(1);

    // Server-only pagination - ONLY used when NO client filters
    const fetchServerPage = useCallback(async (page: number) => {
        try {
            const response = await fetchCars({
                page,
                per_page: PER_PAGE,
                vehicle_type: '1',
                ...serverFilters
            });

            if (abortControllerRef.current?.signal.aborted) return;

            const cars = response.data || [];
            const totalFromApi = response.meta?.total;

            // If we received fewer cars than requested, this is the last page
            const isLastPage = cars.length < PER_PAGE;

            setState({
                cars,
                loading: false,
                loadingMore: false,
                currentPage: page,
                // If total is known from API, use it; otherwise, use isLastPage to determine if there's a next page
                totalPages: totalFromApi
                    ? Math.ceil(totalFromApi / PER_PAGE)
                    : isLastPage ? page : page + 1,
                totalMatches: totalFromApi || cars.length,
                searchProgress: 100,
                currentSearchPage: 0,
                totalSearchPages: 0,
                error: null
            });
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to load cars'
            }));
        }
    }, [serverFilters]);

    // Filter function for client-side filtering
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

    // Client-side filtering - ALWAYS used when ANY client filter is active
    const searchWithClientFilters = useCallback(async () => {
        try {
            // Reset pagination tracking
            hasMorePagesRef.current = true;
            currentApiPageRef.current = 1;

            let allMatches: Car[] = [];
            let pagesFetched = 0;
            let totalApiPages = 100; // Start with assumption of 100 pages
            let reachedEnd = false;

            // Fetch pages in batches until we either:
            // 1. Find at least 12 matches (to show first page)
            // 2. Or reach the end of available pages
            while (!reachedEnd && allMatches.length < PER_PAGE && hasMorePagesRef.current) {
                if (abortControllerRef.current?.signal.aborted) return;

                const batch = [];
                const startPage = currentApiPageRef.current;

                for (let i = 0; i < BATCH_SIZE; i++) {
                    const page = startPage + i;
                    batch.push(fetchCars({
                        page,
                        per_page: API_PAGE_SIZE,
                        vehicle_type: '1',
                        ...serverFilters
                    }));
                }

                const batchResults = await Promise.all(batch);

                if (abortControllerRef.current?.signal.aborted) return;

                // Process each page in the batch
                for (let i = 0; i < batchResults.length; i++) {
                    const response = batchResults[i];
                    const cars = response.data || [];

                    // If we got fewer cars than requested, this is the last page
                    if (cars.length < API_PAGE_SIZE) {
                        hasMorePagesRef.current = false;
                        reachedEnd = true;
                    }

                    // Update total pages estimate if we got meta.total
                    if (response.meta?.total) {
                        totalApiPages = Math.ceil(response.meta.total / API_PAGE_SIZE);
                    }

                    // Filter and add matches
                    const matches = cars.filter(matchesFilters);
                    if (matches.length > 0) {
                        allMatches = [...allMatches, ...matches];
                        allMatchesRef.current = allMatches;
                    }

                    pagesFetched++;
                    currentApiPageRef.current = startPage + i + 1;

                    // Update progress after each page
                    const progress = totalApiPages > 0
                        ? Math.min(100, Math.round((pagesFetched / totalApiPages) * 100))
                        : Math.min(100, Math.round((pagesFetched / 50) * 100)); // Estimate if total unknown

                    // Show results as they come in, even if we haven't fetched all pages yet
                    if (allMatches.length > 0) {
                        setState(prev => ({
                            ...prev,
                            cars: allMatches.slice(0, PER_PAGE),
                            totalMatches: allMatches.length,
                            totalPages: Math.ceil(allMatches.length / PER_PAGE),
                            searchProgress: progress,
                            currentSearchPage: startPage + i,
                            totalSearchPages: totalApiPages,
                            loading: false
                        }));
                    }

                    // If we found enough matches for first page, we can stop searching
                    if (allMatches.length >= PER_PAGE) {
                        break;
                    }
                }

                // If we've fetched all available pages, stop
                if (!hasMorePagesRef.current) {
                    break;
                }
            }

            // If no matches found at all, show empty state
            if (allMatches.length === 0) {
                setState(prev => ({
                    ...prev,
                    cars: [],
                    totalMatches: 0,
                    totalPages: 0,
                    searchProgress: 100,
                    currentSearchPage: currentApiPageRef.current - 1,
                    totalSearchPages: totalApiPages,
                    loading: false
                }));
                return;
            }

            // Continue fetching remaining pages in background (for total count accuracy)
            if (hasMorePagesRef.current) {
                // Fetch remaining pages in background
                while (hasMorePagesRef.current) {
                    if (abortControllerRef.current?.signal.aborted) break;

                    const batch = [];
                    const startPage = currentApiPageRef.current;

                    for (let i = 0; i < BATCH_SIZE; i++) {
                        const page = startPage + i;
                        batch.push(fetchCars({
                            page,
                            per_page: API_PAGE_SIZE,
                            vehicle_type: '1',
                            ...serverFilters
                        }));
                    }

                    const batchResults = await Promise.all(batch);

                    if (abortControllerRef.current?.signal.aborted) break;

                    for (let i = 0; i < batchResults.length; i++) {
                        const response = batchResults[i];
                        const cars = response.data || [];

                        if (cars.length < API_PAGE_SIZE) {
                            hasMorePagesRef.current = false;
                        }

                        const matches = cars.filter(matchesFilters);
                        if (matches.length > 0) {
                            allMatches = [...allMatches, ...matches];
                            allMatchesRef.current = allMatches;
                        }

                        pagesFetched++;
                        currentApiPageRef.current = startPage + i + 1;

                        const progress = totalApiPages > 0
                            ? Math.min(100, Math.round((pagesFetched / totalApiPages) * 100))
                            : Math.min(100, Math.round((pagesFetched / 50) * 100));

                        setState(prev => ({
                            ...prev,
                            totalMatches: allMatches.length,
                            totalPages: Math.ceil(allMatches.length / PER_PAGE),
                            searchProgress: progress,
                            currentSearchPage: startPage + i,
                            // Don't update cars unless we're on page 1
                            cars: prev.currentPage === 1
                                ? allMatches.slice(0, PER_PAGE)
                                : prev.cars
                        }));
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Error in client search:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Search failed'
            }));
        }
    }, [serverFilters, matchesFilters]);

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
                currentPage: hasClientFilters ? 1 : urlPage,
                searchProgress: 0,
                error: null
            }));

            // ALWAYS use client filtering mode if ANY client filter is active
            if (hasClientFilters) {
                searchWithClientFilters();
            } else {
                fetchServerPage(urlPage);
            }
        }, 300),
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
    }, [
        JSON.stringify(serverFilters),
        JSON.stringify(clientFilters),
        urlPage,
        debouncedFilterChange
    ]);

    const goToPage = useCallback((page: number) => {
        if (!hasClientFilters) {
            setState(prev => ({ ...prev, loadingMore: true }));
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', page.toString());
            router.push(`/cars?${params.toString()}`);
        } else {
            setState(prev => ({ ...prev, loadingMore: true }));

            requestAnimationFrame(() => {
                const start = (page - 1) * PER_PAGE;
                const end = start + PER_PAGE;
                const displayCars = allMatchesRef.current.slice(start, end);

                setState(prev => ({
                    ...prev,
                    cars: displayCars,
                    currentPage: page,
                    loadingMore: false
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
        goToPage
    };
}