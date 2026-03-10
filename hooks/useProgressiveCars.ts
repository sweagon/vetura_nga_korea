// hooks/useProgressiveCars.ts
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchCars, type Car } from '@/lib/api';

interface ProgressiveCarsState {
    allCars: Car[];
    displayedCars: Car[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    totalAvailable: number;
    currentPage: number;
    error: string | null;
    filters: Record<string, string>;
}

export function useProgressiveCars(
    serverFilters: Record<string, any>,
    clientFilters: Record<string, string>,
    itemsPerPage: number = 12
) {
    const [state, setState] = useState<ProgressiveCarsState>({
        allCars: [],
        displayedCars: [],
        loading: true,
        loadingMore: false,
        hasMore: true,
        totalAvailable: 0,
        currentPage: 1,
        error: null,
        filters: clientFilters
    });

    const workerRef = useRef<Worker | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const currentPageRef = useRef(1);
    const fetchedPagesRef = useRef<Set<number>>(new Set());
    const totalPagesRef = useRef<number>(0);
    const mountedRef = useRef(true);

    // Initialize worker
    useEffect(() => {
        mountedRef.current = true;

        if (typeof window !== 'undefined' && !workerRef.current) {
            try {
                workerRef.current = new Worker(new URL('@/workers/filterWorker.ts', import.meta.url));

                workerRef.current.onmessage = (e) => {
                    if (!mountedRef.current) return;

                    const { pageResults, filtered, totalFiltered, currentPage, hasMore } = e.data;

                    setState(prev => {
                        const newState = {
                            ...prev,
                            allCars: filtered,
                            displayedCars: pageResults,
                            totalAvailable: totalFiltered,
                            hasMore: hasMore,
                            loading: false,
                            loadingMore: false,
                            currentPage: currentPage
                        };

                        console.log('🔍 State update:', {
                            displayedCars: newState.displayedCars.length,
                            totalAvailable: newState.totalAvailable,
                            hasMore: newState.hasMore,
                            allCars: newState.allCars.length,
                            currentPage: newState.currentPage
                        });

                        return newState;
                    });
                };
            } catch (error) {
                console.error('Failed to create worker:', error);
            }
        }

        return () => {
            mountedRef.current = false;
            if (workerRef.current) {
                workerRef.current.terminate();
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Fetch multiple pages in parallel
    const fetchPagesParallel = useCallback(async (startPage: number, numberOfPages: number = 3) => {
        const fetchPromises = [];
        const pagesToFetch = [];

        // Create array of pages to fetch
        for (let i = 0; i < numberOfPages; i++) {
            const page = startPage + i;
            if (!fetchedPagesRef.current.has(page)) {
                pagesToFetch.push(page);
                fetchPromises.push(
                    fetchCars({
                        page,
                        per_page: itemsPerPage,
                        vehicle_type: '1',
                        ...serverFilters
                    })
                );
            }
        }

        if (pagesToFetch.length === 0) return [];

        console.log(`🚀 Fetching pages ${pagesToFetch.join(', ')} in parallel`);

        try {
            // Fetch all pages in parallel
            const results = await Promise.all(fetchPromises);

            // Mark pages as fetched
            pagesToFetch.forEach(page => fetchedPagesRef.current.add(page));

            // Combine results
            const allCars: Car[] = [];
            results.forEach(response => {
                if (response.data?.length) {
                    allCars.push(...response.data);
                }
            });

            // Update total pages if we have meta data
            if (results[0]?.meta?.total) {
                totalPagesRef.current = Math.ceil(results[0].meta.total / itemsPerPage);
            }

            return allCars;
        } catch (error) {
            console.error('Error fetching pages:', error);
            return [];
        }
    }, [serverFilters, itemsPerPage]);

    // Initial load - fetch first 3 pages in parallel
    useEffect(() => {
        let mounted = true;

        const loadInitial = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                // Fetch first 3 pages in parallel
                const batch = await fetchPagesParallel(1, 3);

                if (!mounted || !mountedRef.current) return;

                if (batch.length === 0) {
                    setState(prev => ({ ...prev, loading: false, hasMore: false }));
                    return;
                }

                // Send to worker for filtering
                if (workerRef.current) {
                    workerRef.current.postMessage({
                        cars: batch,
                        filters: clientFilters,
                        itemsPerPage,
                        currentPage: 1
                    });
                } else {
                    // Fallback if worker not available
                    const start = 0;
                    const displayed = batch.slice(0, itemsPerPage);

                    setState(prev => ({
                        ...prev,
                        allCars: batch,
                        displayedCars: displayed,
                        totalAvailable: batch.length,
                        hasMore: batch.length > itemsPerPage,
                        loading: false
                    }));
                }

            } catch (error) {
                if (!mounted || !mountedRef.current) return;
                console.error('Error loading cars:', error);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Nuk u mumë të ngarkojmë makinat.'
                }));
            }
        };

        loadInitial();

        return () => {
            mounted = false;
        };
    }, [JSON.stringify(serverFilters)]);

    // Handle filter changes
    useEffect(() => {
        if (state.allCars.length > 0 && workerRef.current) {
            // Reset to page 1 when filters change
            currentPageRef.current = 1;

            workerRef.current.postMessage({
                cars: state.allCars,
                filters: clientFilters,
                itemsPerPage,
                currentPage: 1
            });
        }
    }, [JSON.stringify(clientFilters)]);

    const loadMore = useCallback(async () => {
        if (state.loadingMore || !state.hasMore) return;

        setState(prev => ({ ...prev, loadingMore: true }));

        const nextPage = currentPageRef.current + 1;

        // Check if we already have this page in allCars
        const startIdx = nextPage * itemsPerPage;

        if (state.allCars.length >= startIdx + itemsPerPage) {
            // We already have the data, just update displayed cars
            const displayed = state.allCars.slice(
                (nextPage - 1) * itemsPerPage,
                nextPage * itemsPerPage
            );

            currentPageRef.current = nextPage;

            setState(prev => ({
                ...prev,
                displayedCars: displayed,
                currentPage: nextPage,
                loadingMore: false,
                hasMore: prev.allCars.length > nextPage * itemsPerPage
            }));

            return;
        }

        // Need to fetch more pages
        const nextPagesToFetch = Math.ceil((startIdx + itemsPerPage - state.allCars.length) / itemsPerPage);
        const newBatch = await fetchPagesParallel(nextPage, nextPagesToFetch);

        if (newBatch.length === 0) {
            setState(prev => ({ ...prev, loadingMore: false, hasMore: false }));
            return;
        }

        const allCars = [...state.allCars, ...newBatch];

        // Re-filter with worker
        if (workerRef.current) {
            workerRef.current.postMessage({
                cars: allCars,
                filters: clientFilters,
                itemsPerPage,
                currentPage: nextPage
            });
        } else {
            // Fallback
            const displayed = allCars.slice(
                (nextPage - 1) * itemsPerPage,
                nextPage * itemsPerPage
            );

            currentPageRef.current = nextPage;

            setState(prev => ({
                ...prev,
                allCars,
                displayedCars: displayed,
                totalAvailable: allCars.length,
                hasMore: allCars.length > nextPage * itemsPerPage,
                currentPage: nextPage,
                loadingMore: false
            }));
        }
    }, [state, clientFilters, itemsPerPage, fetchPagesParallel]);

    return {
        cars: state.displayedCars,
        loading: state.loading,
        loadingMore: state.loadingMore,
        hasMore: state.hasMore,
        totalCount: state.totalAvailable,
        currentPage: currentPageRef.current,
        error: state.error,
        loadMore
    };
}