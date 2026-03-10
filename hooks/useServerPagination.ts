// hooks/useServerPagination.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchCars, type Car } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

const PER_PAGE = 12;

interface ServerPaginationState {
    cars: Car[];
    loading: boolean;
    loadingMore: boolean;
    currentPage: number;
    totalPages: number;
    totalMatches: number;
    error: string | null;
}

export function useServerPagination(serverFilters: Record<string, any>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlPage = Number(searchParams.get('page')) || 1;

    const [state, setState] = useState<ServerPaginationState>({
        cars: [],
        loading: true,
        loadingMore: false,
        currentPage: urlPage,
        totalPages: 0,
        totalMatches: 0,
        error: null
    });

    useEffect(() => {
        let mounted = true;

        const fetchPage = async () => {
            setState(prev => ({ ...prev, loading: true }));

            try {
                const response = await fetchCars({
                    page: urlPage,
                    per_page: PER_PAGE,
                    vehicle_type: '1',
                    ...serverFilters
                });

                if (!mounted) return;

                const cars = response.data || [];
                const currentPage = urlPage;

                // If we received 12 cars, there might be a next page
                // If we received less than 12, this is the last page
                const hasNextPage = cars.length === PER_PAGE;
                const hasPrevPage = currentPage > 1;

                console.log('📊 Server Pagination:', {
                    page: currentPage,
                    carsReceived: cars.length,
                    hasNextPage,
                    hasPrevPage
                });

                setState({
                    cars,
                    loading: false,
                    loadingMore: false,
                    currentPage,
                    // We don't know total pages, so we'll just enable next/prev based on what we know
                    totalPages: hasNextPage ? currentPage + 1 : currentPage,
                    totalMatches: cars.length, // We don't know total matches
                    error: null
                });

            } catch (error) {
                if (!mounted) return;
                console.error('Error fetching:', error);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    loadingMore: false,
                    error: 'Failed to load cars'
                }));
            }
        };

        fetchPage();

        return () => { mounted = false; };
    }, [urlPage, JSON.stringify(serverFilters)]);

    const goToPage = (page: number) => {
        // Only allow navigation if we think the page exists
        if (page < 1) return;
        if (page > state.totalPages && state.totalPages > 0) return;

        setState(prev => ({ ...prev, loadingMore: true }));
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`/cars?${params.toString()}`);

        setTimeout(() => {
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
        error: state.error,
        goToPage
    };
}