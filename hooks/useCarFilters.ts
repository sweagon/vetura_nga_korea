// hooks/useCarFilters.ts
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchFilterData, fetchModels, fetchGenerations, type FilterData } from '@/lib/api';

export interface FilterState {
    manufacturerId: string;
    modelId: string;
    generationId: string;
    fromYear: string;
    toYear: string;
    odometerFrom: string;
    odometerTo: string;
    priceFrom: string;
    priceTo: string;
}

export function useCarFilters() {
    const searchParams = useSearchParams();

    const [filterData, setFilterData] = useState<FilterData>({
        manufacturers: [],
        models: [],
        generations: [],
        fuelTypes: [],
        transmissions: [],
        years: [],
        bodyTypes: [],
        colors: []
    });

    const [loading, setLoading] = useState({
        filters: false,
        models: false,
        generations: false
    });

    // Initialize filters from URL - using ID parameters directly
    const [filters, setFilters] = useState<FilterState>(() => ({
        manufacturerId: searchParams.get('manufacturer_id') || '',
        modelId: searchParams.get('model_id') || '',
        generationId: searchParams.get('generation_id') || '',
        fromYear: searchParams.get('from_year') || '',
        toYear: searchParams.get('to_year') || '',
        odometerFrom: searchParams.get('odometer_from_km') || '',
        odometerTo: searchParams.get('odometer_to_km') || '',
        priceFrom: searchParams.get('buy_now_price_from') || '',
        priceTo: searchParams.get('buy_now_price_to') || '',
        transmissionId: searchParams.get('transmission_id') || '',
        fuelId: searchParams.get('fuel_id') || '',
        bodyTypeId: searchParams.get('body_type_id') || '',
        colorId: searchParams.get('color_id') || '',
    }));

    // Update filters when URL changes - using ID parameters directly
    useEffect(() => {
        setFilters({
            manufacturerId: searchParams.get('manufacturer_id') || '',
            modelId: searchParams.get('model_id') || '',
            generationId: searchParams.get('generation_id') || '',
            fromYear: searchParams.get('from_year') || '',
            toYear: searchParams.get('to_year') || '',
            odometerFrom: searchParams.get('odometer_from_km') || '',
            odometerTo: searchParams.get('odometer_to_km') || '',
            priceFrom: searchParams.get('buy_now_price_from') || '',
            priceTo: searchParams.get('buy_now_price_to') || '',
        });
    }, [searchParams]);

    // Load initial filter data
    useEffect(() => {
        const loadFilters = async () => {
            try {
                setLoading(prev => ({ ...prev, filters: true }));
                const data = await fetchFilterData();
                setFilterData(data);
            } catch (error) {
                console.error('Error loading filters:', error);
            } finally {
                setLoading(prev => ({ ...prev, filters: false }));
            }
        };
        loadFilters();
    }, []);

    // Load models when manufacturer changes
    useEffect(() => {
        const loadModels = async () => {
            if (!filters.manufacturerId) {
                setFilterData(prev => ({ ...prev, models: [] }));
                return;
            }

            try {
                setLoading(prev => ({ ...prev, models: true }));
                const models = await fetchModels(parseInt(filters.manufacturerId), 'cars');
                setFilterData(prev => ({ ...prev, models }));
            } catch (error) {
                console.error('Error loading models:', error);
            } finally {
                setLoading(prev => ({ ...prev, models: false }));
            }
        };
        loadModels();
    }, [filters.manufacturerId]);

    // Load generations when model changes
    useEffect(() => {
        const loadGenerations = async () => {
            if (!filters.modelId) {
                setFilterData(prev => ({ ...prev, generations: [] }));
                return;
            }

            try {
                setLoading(prev => ({ ...prev, generations: true }));
                const generations = await fetchGenerations(parseInt(filters.modelId), 'cars');
                setFilterData(prev => ({ ...prev, generations }));
            } catch (error) {
                console.error('Error loading generations:', error);
            } finally {
                setLoading(prev => ({ ...prev, generations: false }));
            }
        };
        loadGenerations();
    }, [filters.modelId]);

    const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

    return {
        filters,
        filterData,
        loading,
        activeFilterCount
    };
}