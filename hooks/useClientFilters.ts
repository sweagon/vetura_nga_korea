// hooks/useClientFilters.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchCars, type Car } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

const API_PAGE_SIZE = 50;
const DISPLAY_PAGE_SIZE = 12;
const BATCH_SIZE = 5;

interface ClientFiltersState {
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

export function useClientFilters(
    serverFilters: Record<string, any>,
    clientFilters: Record<string, string>
) {
    const searchParams = useSearchParams();
    const urlPage = Number(searchParams.get('page')) || 1;

    const [state, setState] = useState<ClientFiltersState>({
        cars: [],
        loading: true,
        loadingMore: false,
        currentPage: urlPage,
        totalPages: 0,
        totalMatches: 0,
        searchProgress: 0,
        currentSearchPage: 0,
        totalSearchPages: 0,
        error: null
    });

    const allMatchesRef = useRef<Car[]>([]);
    const totalApiPagesRef = useRef(0);
    const isLoadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Filter function
    const matchesFilters = (car: Car): boolean => {
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
    };

    // Reset and start search
    useEffect(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        allMatchesRef.current = [];
        isLoadingRef.current = false;

        setState(prev => ({
            ...prev,
            loading: true,
            currentPage: 1,
            searchProgress: 0,
            currentSearchPage: 0,
            totalSearchPages: 0
        }));

        const searchAllPages = async () => {
            if (isLoadingRef.current) return;
            isLoadingRef.current = true;

            try {
                // First, get total pages
                const firstResponse = await fetchCars({
                    page: 1,
                    per_page: API_PAGE_SIZE,
                    vehicle_type: '1',
                    ...serverFilters
                });

                totalApiPagesRef.current = firstResponse.meta?.total
                    ? Math.ceil(firstResponse.meta.total / API_PAGE_SIZE)
                    : 100;

                setState(prev => ({
                    ...prev,
                    totalSearchPages: totalApiPagesRef.current
                }));

                let allMatches: Car[] = [];

                // Fetch first 5 pages immediately
                const initialBatch = [];
                for (let i = 1; i <= 5; i++) {
                    initialBatch.push(fetchCars({
                        page: i,
                        per_page: API_PAGE_SIZE,
                        vehicle_type: '1',
                        ...serverFilters
                    }));
                }

                const initialResults = await Promise.all(initialBatch);

                initialResults.forEach(response => {
                    const matches = (response.data || []).filter(matchesFilters);
                    if (matches.length > 0) {
                        allMatches = [...allMatches, ...matches];
                        allMatchesRef.current = allMatches;
                    }
                });

                const progress = Math.round((5 / totalApiPagesRef.current) * 100);

                setState(prev => ({
                    ...prev,
                    cars: allMatches.slice(0, DISPLAY_PAGE_SIZE),
                    totalMatches: allMatches.length,
                    totalPages: Math.ceil(allMatches.length / DISPLAY_PAGE_SIZE),
                    searchProgress: progress,
                    currentSearchPage: 5,
                    loading: false
                }));

                // Continue fetching remaining pages in background
                let pagesFetched = 5;
                for (let page = 6; page <= totalApiPagesRef.current; page += BATCH_SIZE) {
                    if (abortControllerRef.current?.signal.aborted) break;

                    const batch = [];
                    for (let i = 0; i < BATCH_SIZE && page + i <= totalApiPagesRef.current; i++) {
                        batch.push(fetchCars({
                            page: page + i,
                            per_page: API_PAGE_SIZE,
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
                    const newProgress = Math.min(100, Math.round((pagesFetched / totalApiPagesRef.current) * 100));
                    const lastPage = Math.min(page + BATCH_SIZE - 1, totalApiPagesRef.current);

                    setState(prev => ({
                        ...prev,
                        totalMatches: allMatches.length,
                        totalPages: Math.ceil(allMatches.length / DISPLAY_PAGE_SIZE),
                        searchProgress: newProgress,
                        currentSearchPage: lastPage,
                        cars: prev.currentPage === 1
                            ? allMatches.slice(0, DISPLAY_PAGE_SIZE)
                            : prev.cars
                    }));
                }

            } catch (error) {
                console.error('Search error:', error);
                setState(prev => ({ ...prev, loading: false, error: 'Search failed' }));
            }

            isLoadingRef.current = false;
        };

        searchAllPages();

        return () => {
            abortControllerRef.current?.abort();
        };
    }, [JSON.stringify(serverFilters), JSON.stringify(clientFilters)]);

    const goToPage = (page: number) => {
        setState(prev => ({ ...prev, loadingMore: true, currentPage: page }));

        setTimeout(() => {
            const start = (page - 1) * DISPLAY_PAGE_SIZE;
            const end = start + DISPLAY_PAGE_SIZE;
            const displayCars = allMatchesRef.current.slice(start, end);

            setState(prev => ({
                ...prev,
                cars: displayCars,
                loadingMore: false
            }));

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

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
        error: state.error,
        goToPage
    };
}