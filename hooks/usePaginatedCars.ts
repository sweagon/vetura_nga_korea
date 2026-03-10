// hooks/usePaginatedCars.ts
'use client';

import { useState, useEffect, useMemo } from 'react';
import { type Car } from '@/lib/api';
import { useCachedCars } from './useCachedCars';

const CARS_PER_PAGE = 12;

interface UsePaginatedCarsReturn {
    cars: Car[];
    loading: boolean;
    error: string | null;
    totalPages: number;
    totalCars: number;
}

export function usePaginatedCars(
    serverFilters: Record<string, any>,
    clientFilters: Record<string, string>,
    currentPage: number // Accept from URL
): UsePaginatedCarsReturn {
    const {
        allCars,
        loading,
        error,
        totalAvailable,
        loadMoreChunks
    } = useCachedCars(serverFilters);

    // Apply client-side filters
    const filteredCars = useMemo(() => {
        return allCars.filter((car: Car) => {
            // Fuel filter
            if (clientFilters.fuel_id && car.fuel?.id.toString() !== clientFilters.fuel_id) {
                return false;
            }
            // Transmission filter
            if (clientFilters.transmission_id && car.transmission?.id.toString() !== clientFilters.transmission_id) {
                return false;
            }
            // Color filter
            if (clientFilters.color_id && car.color?.id.toString() !== clientFilters.color_id) {
                return false;
            }
            // Body type filter
            if (clientFilters.body_type_id && car.body_type?.id.toString() !== clientFilters.body_type_id) {
                return false;
            }
            // Year from
            if (clientFilters.yearFrom && car.year < parseInt(clientFilters.yearFrom)) {
                return false;
            }
            // Year to
            if (clientFilters.yearTo && car.year > parseInt(clientFilters.yearTo)) {
                return false;
            }
            // Price from
            if (clientFilters.priceFrom) {
                const price = car.lots?.[0]?.buy_now || 0;
                if (price < parseInt(clientFilters.priceFrom)) return false;
            }
            // Price to
            if (clientFilters.priceTo) {
                const price = car.lots?.[0]?.buy_now || 0;
                if (price > parseInt(clientFilters.priceTo)) return false;
            }
            return true;
        });
    }, [allCars, clientFilters]);

    const totalFiltered = filteredCars.length;
    const totalPages = Math.ceil(totalFiltered / CARS_PER_PAGE);

    // Load more chunks if needed for current page
    useEffect(() => {
        const neededCars = currentPage * CARS_PER_PAGE;
        if (filteredCars.length < neededCars) {
            loadMoreChunks(currentPage);
        }
    }, [currentPage, filteredCars.length, loadMoreChunks]);

    return {
        cars: filteredCars, // Return all filtered cars, not just current page
        loading,
        error,
        totalPages,
        totalCars: totalFiltered
    };
}