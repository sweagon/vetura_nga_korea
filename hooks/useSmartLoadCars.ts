// hooks/useFilteredPagination.ts
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchCars, type Car } from '@/lib/api';

interface FilteredState {
    cars: Car[];           // Currently displayed cars (filtered)
    loading: boolean;
    hasMore: boolean;       // Whether more filtered cars might exist
    currentPage: number;    // Current page being displayed (for UI)
    totalFiltered: number;  // Total filtered cars found so far
    error: string | null;
}

export function useFilteredPagination(
    serverFilters: Record<string, any>,
    clientFilters: Record<string, string>
) {
    const [state, setState] = useState<FilteredState>({
        cars: [],
        loading: true,
        hasMore: true,
        currentPage: 1,
        totalFiltered: 0,
        error: null
    });

    // Keep track of where we are in the API pages
    const nextApiPageRef = useRef(1);
    const totalApiPagesRef = useRef(0);
    const isFetchingRef = useRef(false);

    // Store all filtered cars we've found
    const allFilteredCarsRef = useRef<Car[]>([]);

    // Filter function
    const matchesFilters = useCallback((car: Car): boolean => {
        if (clientFilters.fuel_id && car.fuel?.id.toString() !== clientFilters.fuel_id) return false;
        if (clientFilters.transmission_id && car.transmission?.id.toString() !== clientFilters.transmission_id) return false;
        if (clientFilters.color_id && car.color?.id.toString() !== clientFilters.color_id) return false;
        if (clientFilters.body_type_id && car.body_type?.id.toString() !== clientFilters.body_type_id) return false;
        if (clientFilters.yearFrom && car.year < parseInt(clientFilters.yearFrom)) return false;
        if (clientFilters.yearTo && car.year > parseInt(clientFilters.yearTo)) return false;
        if (clientFilters.priceFrom) {
            const price = car.lots?.[0]?.buy_now || 0;
            if (price < parseInt(clientFilters.priceFrom)) return false;
        }
        if (clientFilters.priceTo) {
            const price = car.lots?.[0]?.buy_now || 0;
            if (price > parseInt(clientFilters.priceTo)) return false;
        }
        return true;
    }, [clientFilters]);

    // Fetch a single API page
    const fetchApiPage = useCallback(async (page: number) => {
        console.log(`📡 Fetching API page ${page}...`);
        try {
            const response = await fetchCars({
                page,
                per_page: 12,
                vehicle_type: '1',
                ...serverFilters
            });

            if (page === 1 && response.meta?.total) {
                totalApiPagesRef.current = Math.ceil(response.meta.total / 12);
                console.log(`📊 Total API pages available: ${totalApiPagesRef.current}`);
            }

            return response.data || [];
        } catch (err) {
            console.error(`❌ Error fetching page ${page}:`, err);
            return [];
        }
    }, [serverFilters]);

    // Load more filtered cars
    const loadMoreFiltered = useCallback(async () => {
        if (isFetchingRef.current || !state.hasMore) return;

        isFetchingRef.current = true;
        setState(prev => ({ ...prev, loading: true }));

        let newFilteredCars: Car[] = [];
        let pagesFetched = 0;

        // Keep fetching pages until we find 12 new filtered cars or run out
        while (newFilteredCars.length < 12 && nextApiPageRef.current <= totalApiPagesRef.current) {
            const cars = await fetchApiPage(nextApiPageRef.current);

            if (cars.length === 0) break;

            const filtered = cars.filter(matchesFilters);
            newFilteredCars = [...newFilteredCars, ...filtered];

            console.log(`📄 API page ${nextApiPageRef.current}: found ${filtered.length} filtered cars`);
            nextApiPageRef.current++;
            pagesFetched++;
        }

        if (newFilteredCars.length === 0) {
            // No more filtered cars found
            setState(prev => ({
                ...prev,
                loading: false,
                hasMore: false
            }));
            isFetchingRef.current = false;
            return;
        }

        // Add to our collection
        allFilteredCarsRef.current = [...allFilteredCarsRef.current, ...newFilteredCars];

        // Calculate how many pages of filtered cars we now have
        const totalFilteredPages = Math.ceil(allFilteredCarsRef.current.length / 12);

        setState({
            cars: allFilteredCarsRef.current.slice(0, 12), // Show first 12
            loading: false,
            hasMore: nextApiPageRef.current <= totalApiPagesRef.current || allFilteredCarsRef.current.length > 12,
            currentPage: 1,
            totalFiltered: allFilteredCarsRef.current.length,
            error: null
        });

        isFetchingRef.current = false;
    }, [fetchApiPage, matchesFilters, state.hasMore]);

    // Load next page of filtered cars (for pagination UI)
    const goToFilteredPage = useCallback((page: number) => {
        const start = (page - 1) * 12;
        const end = start + 12;

        if (allFilteredCarsRef.current.length >= end) {
            // We have this page cached
            setState(prev => ({
                ...prev,
                cars: allFilteredCarsRef.current.slice(start, end),
                currentPage: page
            }));
        } else {
            // Need to fetch more
            loadMoreFiltered();
        }
    }, [loadMoreFiltered]);

    // Initial load
    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            // Reset all state
            nextApiPageRef.current = 1;
            allFilteredCarsRef.current = [];
            isFetchingRef.current = false;

            // Load first batch
            await loadMoreFiltered();
        };

        initialize();

        return () => { mounted = false; };
    }, [loadMoreFiltered, JSON.stringify(clientFilters)]); // Re-run when filters change

    return {
        cars: state.cars,
        loading: state.loading,
        hasMore: state.hasMore,
        currentPage: state.currentPage,
        totalFiltered: state.totalFiltered,
        totalPages: Math.ceil(state.totalFiltered / 12),
        error: state.error,
        loadMore: loadMoreFiltered,
        goToPage: goToFilteredPage
    };
}