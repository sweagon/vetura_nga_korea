// hooks/useCachedCars.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCars, type Car } from '@/lib/api';

const CARS_PER_FETCH = 55; // Match API's max per_page

interface CacheChunk {
    page: number;
    cars: Car[];
    totalCount: number;
}

export function useCachedCars(serverFilters: Record<string, any>) {
    const [allCars, setAllCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [loadedChunks, setLoadedChunks] = useState<Set<number>>(new Set());

    const abortControllerRef = useRef<AbortController | null>(null);
    const mountedRef = useRef(true);

    // Fetch a chunk (55 cars)
    const fetchChunk = useCallback(async (chunkIndex: number): Promise<CacheChunk | null> => {
        if (loadedChunks.has(chunkIndex)) return null;

        const page = chunkIndex + 1;

        try {
            const response = await fetchCars({
                page,
                per_page: CARS_PER_FETCH,
                vehicle_type: '1',
                ...serverFilters
            });

            if (!response.data?.length) return null;

            return {
                page,
                cars: response.data,
                totalCount: response.meta?.total || 0
            };
        } catch (err) {
            console.error(`Error fetching chunk ${chunkIndex}:`, err);
            return null;
        }
    }, [serverFilters]);

    // Load initial chunks
    useEffect(() => {
        let mounted = true;
        mountedRef.current = true;

        const loadInitialChunks = async () => {
            setLoading(true);

            // Fetch first 3 chunks in parallel (165 cars)
            const chunksToFetch = [0, 1, 2];

            try {
                const results = await Promise.all(
                    chunksToFetch.map(chunk => fetchChunk(chunk))
                );

                if (!mounted) return;

                const validChunks = results.filter((r): r is CacheChunk => r !== null);
                const allFetchedCars = validChunks.flatMap(chunk => chunk.cars);

                setAllCars(allFetchedCars);
                setLoadedChunks(new Set(validChunks.map(ch => ch.page - 1)));

                if (validChunks.length > 0) {
                    setTotalAvailable(validChunks[0].totalCount);
                }

            } catch (err) {
                if (!mounted) return;
                setError('Failed to load cars');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadInitialChunks();

        return () => {
            mounted = false;
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchChunk]);

    // Load more chunks when needed
    const loadMoreChunks = useCallback(async (upToPage: number) => {
        const CARS_PER_PAGE = 12;
        const neededChunk = Math.ceil(upToPage * CARS_PER_PAGE / CARS_PER_FETCH) - 1;
        const chunksToLoad = [];

        for (let i = 0; i <= neededChunk; i++) {
            if (!loadedChunks.has(i)) {
                chunksToLoad.push(i);
            }
        }

        if (chunksToLoad.length === 0) return;

        setLoading(true);

        try {
            const results = await Promise.all(
                chunksToLoad.map(chunk => fetchChunk(chunk))
            );

            const validChunks = results.filter((r): r is CacheChunk => r !== null);
            const newCars = validChunks.flatMap(chunk => chunk.cars);

            setAllCars(prev => [...prev, ...newCars]);
            setLoadedChunks(prev => {
                const next = new Set(prev);
                validChunks.forEach(chunk => next.add(chunk.page - 1));
                return next;
            });

        } finally {
            setLoading(false);
        }
    }, [fetchChunk]);

    return {
        allCars,
        loading,
        error,
        totalAvailable,
        loadMoreChunks
    };
}