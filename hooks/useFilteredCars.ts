// hooks/useFilteredCars.ts
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchCars, type Car } from '@/lib/api';

// Configuration
const CARS_PER_PAGE = 50;
const DISPLAY_PER_PAGE = 12;
const BATCH_SIZE = 5;
const INITIAL_BATCHES = 10; // Fetch first 50 pages (10 batches of 5)
const PRELOAD_THRESHOLD = 4; // Start loading more when user reaches page 4

interface FilteredCarsState {
    cars: Car[];
    loading: boolean;
    loadingMore: boolean;
    currentPage: number;
    totalPages: number;
    totalMatches: number;
    searchProgress: number;
    currentSearchPage: number;
    totalSearchPages: number;
    hasMoreToLoad: boolean;
    error: string | null;
}

export function useFilteredCars(
    serverFilters: Record<string, any>,
    clientFilters: Record<string, string>
) {
    const [state, setState] = useState<FilteredCarsState>({
        cars: [],
        loading: true,
        loadingMore: false,
        currentPage: 1,
        totalPages: 0,
        totalMatches: 0,
        searchProgress: 0,
        currentSearchPage: 0,
        totalSearchPages: 0,
        hasMoreToLoad: true,
        error: null
    });

    // Store all matches and track fetched pages
    const allMatchesRef = useRef<Car[]>([]);
    const fetchedPagesRef = useRef<Set<number>>(new Set());
    const isLoadingRef = useRef(false);
    const filtersRef = useRef({ serverFilters, clientFilters });
    const abortControllerRef = useRef<AbortController | null>(null);
    const totalApiPagesRef = useRef(0);
    const hasMoreToLoadRef = useRef(true);

    // Update filters ref when they change
    useEffect(() => {
        filtersRef.current = { serverFilters, clientFilters };
    }, [serverFilters, clientFilters]);

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

    // Fetch a single page
    const fetchPage = useCallback(async (page: number): Promise<Car[]> => {
        // Skip if already fetched
        if (fetchedPagesRef.current.has(page)) {
            return [];
        }

        try {
            const response = await fetchCars({
                page,
                per_page: CARS_PER_PAGE,
                vehicle_type: '1',
                ...filtersRef.current.serverFilters
            });

            fetchedPagesRef.current.add(page);
            return response.data || [];
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
            return [];
        }
    }, []);

    // Update UI with current matches
    const updateUI = useCallback((allMatches: Car[]) => {
        const start = (state.currentPage - 1) * DISPLAY_PER_PAGE;
        const end = start + DISPLAY_PER_PAGE;
        const displayCars = allMatches.slice(start, end);

        setState(prev => ({
            ...prev,
            cars: displayCars,
            totalMatches: allMatches.length,
            totalPages: Math.ceil(allMatches.length / DISPLAY_PER_PAGE)
        }));
    }, [state.currentPage]);

    // Load initial batches (first 50 pages)
    const loadInitialBatches = useCallback(async () => {
        const totalBatches = Math.min(INITIAL_BATCHES, Math.ceil(totalApiPagesRef.current / BATCH_SIZE));

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            if (abortControllerRef.current?.signal.aborted) break;

            const startPage = batchIndex * BATCH_SIZE + 1;
            const batchPages = [];
            for (let i = 0; i < BATCH_SIZE; i++) {
                const page = startPage + i;
                if (page <= totalApiPagesRef.current) {
                    batchPages.push(page);
                }
            }

            if (batchPages.length === 0) break;

            const batchResults = await Promise.all(
                batchPages.map(page => fetchPage(page))
            );

            let newMatches: Car[] = [];
            batchResults.forEach((cars) => {
                if (cars.length > 0) {
                    const matches = cars.filter((car: Car) => matchesFilters(car));
                    if (matches.length > 0) {
                        newMatches = [...newMatches, ...matches];
                    }
                }
            });

            if (newMatches.length > 0) {
                allMatchesRef.current = [...allMatchesRef.current, ...newMatches];
                updateUI(allMatchesRef.current);
            }

            const lastPageInBatch = batchPages[batchPages.length - 1];
            setState(prev => ({
                ...prev,
                searchProgress: Math.round((lastPageInBatch / totalApiPagesRef.current) * 100),
                currentSearchPage: lastPageInBatch
            }));
        }

        // Check if there are more pages to load
        hasMoreToLoadRef.current = fetchedPagesRef.current.size < totalApiPagesRef.current;
        setState(prev => ({
            ...prev,
            hasMoreToLoad: hasMoreToLoadRef.current,
            loading: false
        }));
    }, [fetchPage, matchesFilters, updateUI]);

    // Load more pages (triggered when user approaches end)
    const loadMorePages = useCallback(async () => {
        if (isLoadingRef.current || !hasMoreToLoadRef.current) return;

        isLoadingRef.current = true;
        setState(prev => ({ ...prev, loadingMore: true }));

        const nextBatchStart = fetchedPagesRef.current.size + 1;
        const batchPages = [];

        for (let i = 0; i < BATCH_SIZE; i++) {
            const page = nextBatchStart + i;
            if (page <= totalApiPagesRef.current) {
                batchPages.push(page);
            }
        }

        if (batchPages.length > 0) {
            const batchResults = await Promise.all(
                batchPages.map(page => fetchPage(page))
            );

            let newMatches: Car[] = [];
            batchResults.forEach((cars) => {
                if (cars.length > 0) {
                    const matches = cars.filter((car: Car) => matchesFilters(car));
                    if (matches.length > 0) {
                        newMatches = [...newMatches, ...matches];
                    }
                }
            });

            if (newMatches.length > 0) {
                allMatchesRef.current = [...allMatchesRef.current, ...newMatches];
                updateUI(allMatchesRef.current);
            }
        }

        hasMoreToLoadRef.current = fetchedPagesRef.current.size < totalApiPagesRef.current;

        setState(prev => ({
            ...prev,
            hasMoreToLoad: hasMoreToLoadRef.current,
            loadingMore: false
        }));

        isLoadingRef.current = false;
    }, [fetchPage, matchesFilters, updateUI]);

    // Reset everything and start new search
    const resetAndSearch = useCallback(async () => {
        // Cancel any ongoing search
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Reset all refs
        allMatchesRef.current = [];
        fetchedPagesRef.current.clear();
        isLoadingRef.current = false;
        totalApiPagesRef.current = 0;
        hasMoreToLoadRef.current = true;

        // Reset state
        setState(prev => ({
            ...prev,
            loading: true,
            cars: [],
            currentPage: 1,
            totalPages: 0,
            totalMatches: 0,
            searchProgress: 0,
            currentSearchPage: 0,
            totalSearchPages: 0,
            hasMoreToLoad: true
        }));

        abortControllerRef.current = new AbortController();

        // First, get total pages from page 1
        const firstPageCars = await fetchPage(1);

        // Estimate total pages (you might want to get this from API meta)
        totalApiPagesRef.current = 100; // This should come from API

        setState(prev => ({
            ...prev,
            totalSearchPages: totalApiPagesRef.current,
            currentSearchPage: 1
        }));

        // Process first page
        const firstPageMatches = firstPageCars.filter((car: Car) => matchesFilters(car));
        allMatchesRef.current = [...firstPageMatches];

        // Update UI with first page results
        updateUI(allMatchesRef.current);

        // Load initial batches
        await loadInitialBatches();

    }, [fetchPage, matchesFilters, updateUI, loadInitialBatches]);

    // Watch for filter changes and trigger reset
    useEffect(() => {
        resetAndSearch();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [JSON.stringify(serverFilters), JSON.stringify(clientFilters)]);

    // Watch for page changes to load more if needed
    useEffect(() => {
        // If user is approaching the end of loaded data, load more
        const pagesLoaded = Math.ceil(allMatchesRef.current.length / DISPLAY_PER_PAGE);
        if (state.currentPage >= pagesLoaded - 1 && hasMoreToLoadRef.current && !state.loadingMore) {
            loadMorePages();
        }
    }, [state.currentPage, state.loadingMore, loadMorePages]);

    // Go to UI page
    const goToPage = useCallback((page: number) => {
        setState(prev => ({ ...prev, loadingMore: true, currentPage: page }));

        setTimeout(() => {
            const start = (page - 1) * DISPLAY_PER_PAGE;
            const end = start + DISPLAY_PER_PAGE;
            const displayCars = allMatchesRef.current.slice(start, end);

            setState(prev => ({
                ...prev,
                cars: displayCars,
                loadingMore: false
            }));
        }, 100);
    }, []);

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
        hasMoreToLoad: state.hasMoreToLoad,
        goToPage,
        error: state.error
    };
}