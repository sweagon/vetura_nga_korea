// hooks/useFilteredPagination.ts
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchCars, type Car } from '@/lib/api';

interface FilteredState {
    cars: Car[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    currentPage: number;
    totalFiltered: number;
    error: string | null;
    availablePages: number;
    isSearching: boolean;
    searchProgress: number;
    totalApiPages: number;
}

export function useFilteredPagination(
    serverFilters: Record<string, any>,
    clientFilters: Record<string, string>
) {
    const [state, setState] = useState<FilteredState>({
        cars: [],
        loading: true,
        loadingMore: false,
        hasMore: true,
        currentPage: 1,
        totalFiltered: 0,
        error: null,
        availablePages: 0,
        isSearching: false,
        searchProgress: 0,
        totalApiPages: 0
    });

    const currentServerFiltersRef = useRef(serverFilters);
    const currentClientFiltersRef = useRef(clientFilters);
    const currentApiPageRef = useRef(1);
    const hasMoreApiPagesRef = useRef(true);
    const isFetchingRef = useRef(false);
    const allFilteredCarsRef = useRef<Car[]>([]);
    const totalApiPagesRef = useRef(0);

    // Check if filters have changed
    const haveFiltersChanged = useCallback(() => {
        return JSON.stringify(currentServerFiltersRef.current) !== JSON.stringify(serverFilters) ||
            JSON.stringify(currentClientFiltersRef.current) !== JSON.stringify(clientFilters);
    }, [serverFilters, clientFilters]);

    // Reset everything when filters change
    useEffect(() => {
        if (haveFiltersChanged()) {
            console.log('🔄 Filters changed, resetting...');

            currentServerFiltersRef.current = serverFilters;
            currentClientFiltersRef.current = clientFilters;

            currentApiPageRef.current = 1;
            hasMoreApiPagesRef.current = true;
            allFilteredCarsRef.current = [];
            isFetchingRef.current = false;
            totalApiPagesRef.current = 0;

            setState({
                cars: [],
                loading: true,
                loadingMore: false,
                hasMore: true,
                currentPage: 1,
                totalFiltered: 0,
                error: null,
                availablePages: 0,
                isSearching: true,
                searchProgress: 0,
                totalApiPages: 0
            });

            // Start searching
            searchForCars();
        }
    }, [serverFilters, clientFilters]);

    // Filter function
    const matchesFilters = useCallback((car: Car): boolean => {
        const filters = currentClientFiltersRef.current;

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
    const fetchPage = useCallback(async (page: number) => {
        const filters = currentServerFiltersRef.current;

        try {
            const response = await fetchCars({
                page,
                per_page: 12,
                vehicle_type: '1',
                ...filters
            });

            if (page === 1 && response.meta?.total) {
                totalApiPagesRef.current = Math.ceil(response.meta.total / 12);
                console.log(`📊 Total API pages: ${totalApiPagesRef.current}`);
            }

            return response.data || [];
        } catch (err) {
            console.error(`Error fetching page ${page}:`, err);
            return [];
        }
    }, []);

    // Main search function - finds first 12 matches
    const searchForCars = useCallback(async () => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;

        let page = 1;
        let matches: Car[] = [];
        const MAX_PAGES = totalApiPagesRef.current || 200; // Safety limit

        while (matches.length < 12 && page <= MAX_PAGES && hasMoreApiPagesRef.current) {
            console.log(`🔍 Searching page ${page}...`);
            const cars = await fetchPage(page);

            if (cars.length === 0) {
                hasMoreApiPagesRef.current = false;
                break;
            }

            const pageMatches = cars.filter(matchesFilters);
            matches = [...matches, ...pageMatches];

            // Update progress
            const progress = totalApiPagesRef.current > 0
                ? Math.min(100, Math.round((page / totalApiPagesRef.current) * 100))
                : Math.min(100, Math.round((page / 50) * 100)); // Estimate if total unknown

            setState(prev => ({
                ...prev,
                searchProgress: progress,
                totalApiPages: totalApiPagesRef.current
            }));

            console.log(`📄 Page ${page}: found ${pageMatches.length} matches (total: ${matches.length})`);
            page++;
        }

        allFilteredCarsRef.current = matches;
        currentApiPageRef.current = page;

        const availablePages = Math.ceil(matches.length / 12);

        setState({
            cars: matches.slice(0, 12),
            loading: false,
            loadingMore: false,
            hasMore: matches.length > 12 || (page <= totalApiPagesRef.current && hasMoreApiPagesRef.current),
            currentPage: 1,
            totalFiltered: matches.length,
            error: null,
            availablePages: availablePages,
            isSearching: false,
            searchProgress: 100,
            totalApiPages: totalApiPagesRef.current
        });

        isFetchingRef.current = false;
    }, [fetchPage, matchesFilters]);

    // Load more matches (for next pages)
    const loadMoreMatches = useCallback(async (targetCount: number) => {
        if (isFetchingRef.current) return false;

        isFetchingRef.current = true;

        let page = currentApiPageRef.current;
        let allMatches = [...allFilteredCarsRef.current];

        while (allMatches.length < targetCount && page <= totalApiPagesRef.current && hasMoreApiPagesRef.current) {
            const cars = await fetchPage(page);

            if (cars.length === 0) {
                hasMoreApiPagesRef.current = false;
                break;
            }

            const pageMatches = cars.filter(matchesFilters);
            allMatches = [...allMatches, ...pageMatches];

            console.log(`📄 Loading more - page ${page}: found ${pageMatches.length} matches (total: ${allMatches.length})`);
            page++;
        }

        allFilteredCarsRef.current = allMatches;
        currentApiPageRef.current = page;

        isFetchingRef.current = false;
        return true;
    }, [fetchPage, matchesFilters]);

    // Go to specific page
    const goToPage = useCallback(async (page: number) => {
        const start = (page - 1) * 12;
        const end = start + 12;

        // If we have this page cached
        if (allFilteredCarsRef.current.length >= end) {
            setState(prev => ({
                ...prev,
                cars: allFilteredCarsRef.current.slice(start, end),
                currentPage: page,
                loadingMore: false
            }));
            return;
        }

        // Need to fetch more
        setState(prev => ({ ...prev, loadingMore: true }));

        await loadMoreMatches(end);

        const newAvailablePages = Math.ceil(allFilteredCarsRef.current.length / 12);

        setState({
            cars: allFilteredCarsRef.current.slice(start, end),
            loading: false,
            loadingMore: false,
            hasMore: currentApiPageRef.current <= totalApiPagesRef.current,
            currentPage: page,
            totalFiltered: allFilteredCarsRef.current.length,
            error: null,
            availablePages: newAvailablePages,
            isSearching: false,
            searchProgress: 100,
            totalApiPages: totalApiPagesRef.current
        });
    }, [loadMoreMatches]);

    const nextPage = useCallback(() => {
        if (state.currentPage < state.availablePages) {
            goToPage(state.currentPage + 1);
        }
    }, [state.currentPage, state.availablePages, goToPage]);

    const prevPage = useCallback(() => {
        if (state.currentPage > 1) {
            goToPage(state.currentPage - 1);
        }
    }, [state.currentPage, goToPage]);

    // Initial search on mount
    useEffect(() => {
        searchForCars();
    }, []);

    return {
        cars: state.cars,
        loading: state.loading,
        loadingMore: state.loadingMore,
        hasMore: state.hasMore,
        currentPage: state.currentPage,
        totalFiltered: state.totalFiltered,
        availablePages: state.availablePages,
        isSearching: state.isSearching,
        searchProgress: state.searchProgress,
        totalApiPages: state.totalApiPages,
        error: state.error,
        nextPage,
        prevPage,
        goToPage
    };
}