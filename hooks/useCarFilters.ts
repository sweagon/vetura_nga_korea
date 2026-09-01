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
    isSearching: boolean;
}

export function useCarFilters(
    serverFilters: Record<string, any>,
    clientFilters: Record<string, string>
) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlPage = Number(searchParams.get('page')) || 1;

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
        error: null,
        isSearching: true
    });

    const allMatchesRef = useRef<Car[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);
    const hasMorePagesRef = useRef<boolean>(true);
    const currentApiPageRef = useRef<number>(1);
    const filterVersionRef = useRef<number>(0);

    const fetchServerPage = useCallback(async (page: number) => {
        try {
            const response = await fetchCars({
                page,
                per_page: PER_PAGE,
                ...serverFilters
            });

            if (abortControllerRef.current?.signal.aborted) return;

            const cars = response.data || [];
            const totalFromApi = response.meta?.total;
            const isLastPage = cars.length < PER_PAGE;

            setState({
                cars,
                loading: false,
                loadingMore: false,
                currentPage: page,
                totalPages: totalFromApi
                    ? Math.ceil(totalFromApi / PER_PAGE)
                    : isLastPage ? page : page + 1,
                totalMatches: totalFromApi || cars.length,
                searchProgress: 100,
                currentSearchPage: 0,
                totalSearchPages: 0,
                error: null,
                isSearching: false
            });
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            setState(prev => ({
                ...prev,
                loading: false,
                isSearching: false,
                error: 'Failed to load cars'
            }));
        }
    }, [serverFilters]);

    const matchesFilters = useCallback((car: Car): boolean => {
        const normalize = (s: string | undefined | null) => (s || '').trim().toLowerCase();

        if (clientFilters.fuel_id && normalize(car.fuel?.name) !== clientFilters.fuel_id) return false;
        if (clientFilters.transmission_id && normalize(car.transmission?.name) !== clientFilters.transmission_id) return false;
        if (clientFilters.color_id && normalize(car.color?.name) !== clientFilters.color_id) return false;
        if (clientFilters.body_type_id && normalize(car.body_type?.name) !== clientFilters.body_type_id) return false;
        if (clientFilters.yearFrom) {
            const yearFrom = parseInt(clientFilters.yearFrom);
            if (!isNaN(yearFrom) && car.year < yearFrom) return false;
        }
        if (clientFilters.yearTo) {
            const yearTo = parseInt(clientFilters.yearTo);
            if (!isNaN(yearTo) && car.year > yearTo) return false;
        }

        const lot = car.lots?.[0];
        const basePrice = lot?.buy_now || 0;

        if (clientFilters.priceFrom) {
            const priceFrom = parseInt(clientFilters.priceFrom);
            if (!isNaN(priceFrom) && basePrice < priceFrom) return false;
        }
        if (clientFilters.priceTo) {
            const priceTo = parseInt(clientFilters.priceTo);
            if (!isNaN(priceTo) && basePrice > priceTo) return false;
        }
        return true;
    }, [clientFilters]);

    const searchWithClientFilters = useCallback(async (version: number) => {
        try {
            hasMorePagesRef.current = true;
            currentApiPageRef.current = 1;
            allMatchesRef.current = [];

            let allMatches: Car[] = [];
            let pagesFetched = 0;
            let totalApiPages = 100;

            const firstResponse = await fetchCars({
                page: 1,
                per_page: API_PAGE_SIZE,
                ...serverFilters
            });

            if (abortControllerRef.current?.signal.aborted || version !== filterVersionRef.current) return;

            if (firstResponse.meta?.total) {
                totalApiPages = Math.ceil(firstResponse.meta.total / API_PAGE_SIZE);
            }

            setState(prev => ({
                ...prev,
                isSearching: true,
                loading: false,
                searchProgress: 0,
                currentSearchPage: 0,
                totalSearchPages: totalApiPages,
                cars: [],
                totalMatches: 0,
                totalPages: 0
            }));

            const firstPageMatches = (firstResponse.data || []).filter(matchesFilters);
            if (firstPageMatches.length > 0) {
                allMatches = firstPageMatches;
                allMatchesRef.current = allMatches;

                setState(prev => ({
                    ...prev,
                    cars: allMatches.slice(0, PER_PAGE),
                    totalMatches: allMatches.length,
                    totalPages: Math.ceil(allMatches.length / PER_PAGE),
                    searchProgress: Math.round((1 / totalApiPages) * 100),
                    currentSearchPage: 1,
                }));
            }

            pagesFetched = 1;

            for (let page = 2; page <= totalApiPages && hasMorePagesRef.current; page += BATCH_SIZE) {
                if (abortControllerRef.current?.signal.aborted || version !== filterVersionRef.current) break;

                const batch = [];
                const batchEnd = Math.min(page + BATCH_SIZE - 1, totalApiPages);

                for (let i = page; i <= batchEnd; i++) {
                    batch.push(fetchCars({
                        page: i,
                        per_page: API_PAGE_SIZE,
                        ...serverFilters
                    }));
                }

                const batchResults = await Promise.all(batch);

                if (abortControllerRef.current?.signal.aborted || version !== filterVersionRef.current) break;

                for (let i = 0; i < batchResults.length; i++) {
                    const response = batchResults[i];
                    const currentPageNum = page + i;
                    const cars = response.data || [];

                    if (cars.length < API_PAGE_SIZE) {
                        hasMorePagesRef.current = false;
                    }

                    const matches = cars.filter(matchesFilters);
                    if (matches.length > 0) {
                        allMatches = [...allMatches, ...matches];
                        allMatchesRef.current = allMatches;

                        setState(prev => ({
                            ...prev,
                            totalMatches: allMatches.length,
                            totalPages: Math.ceil(allMatches.length / PER_PAGE),
                            cars: prev.currentPage === 1
                                ? allMatches.slice(0, PER_PAGE)
                                : prev.cars
                        }));
                    }

                    pagesFetched++;
                    const progress = Math.min(100, Math.round((pagesFetched / totalApiPages) * 100));

                    setState(prev => ({
                        ...prev,
                        searchProgress: progress,
                        currentSearchPage: currentPageNum
                    }));
                }
            }

            if (version === filterVersionRef.current) {
                setState(prev => ({
                    ...prev,
                    isSearching: false,
                    searchProgress: 100,
                    cars: prev.currentPage === 1
                        ? allMatchesRef.current.slice(0, PER_PAGE)
                        : prev.cars
                }));
            }

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Error in client search:', error);
            if (version === filterVersionRef.current) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    isSearching: false,
                    error: 'Search failed'
                }));
            }
        }
    }, [serverFilters, matchesFilters]);

    const debouncedFilterChange = useCallback(
        debounce(() => {
            filterVersionRef.current++;
            const currentVersion = filterVersionRef.current;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            allMatchesRef.current = [];

            setState(prev => ({
                ...prev,
                loading: true,
                isSearching: true,
                currentPage: hasClientFilters ? 1 : urlPage,
                searchProgress: 0,
                cars: [],
                totalMatches: 0,
                totalPages: 0,
                error: null
            }));

            if (hasClientFilters) {
                searchWithClientFilters(currentVersion);
            } else {
                fetchServerPage(urlPage);
            }
        }, 300),
        [hasClientFilters, urlPage, fetchServerPage, searchWithClientFilters]
    );

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
        isSearching: state.isSearching,
        goToPage
    };
}
