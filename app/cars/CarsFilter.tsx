// app/cars/CarsFilter.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Car, Calendar, DollarSign, X } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import { fetchFilterData, fetchModels } from '@/lib/api';
import { getTranslatedManufacturers } from '@/lib/translations';

interface FilterState {
    manufacturerId: string;
    modelId: string;
    fromYear: string;
    toYear: string;
    priceTo: string;
}

export default function CarsFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState({
        manufacturers: false,
        models: false
    });
    const [filterData, setFilterData] = useState({
        manufacturers: [] as Array<{ id: number; original: string; translated: string }>,
        models: [] as Array<{ id: number; name: string; manufacturer_id: number }>,
        years: [] as number[]
    });

    const [filters, setFilters] = useState<FilterState>({
        manufacturerId: searchParams.get('manufacturer_id') || '',
        modelId: searchParams.get('model_id') || '',
        fromYear: searchParams.get('from_year') || '',
        toYear: searchParams.get('to_year') || '',
        priceTo: searchParams.get('buy_now_price_to') || '',
    });

    // Load manufacturers and years
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(prev => ({ ...prev, manufacturers: true }));
                const data = await fetchFilterData();
                setFilterData({
                    manufacturers: getTranslatedManufacturers(data.manufacturers),
                    models: [],
                    years: data.years
                });
            } catch (error) {
                console.error('Error loading filters:', error);
            } finally {
                setLoading(prev => ({ ...prev, manufacturers: false }));
            }
        };
        loadInitialData();
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

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key === 'manufacturerId') {
            setFilters(prev => ({ ...prev, modelId: '' }));
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (filters.manufacturerId) params.set('manufacturer_id', filters.manufacturerId);
        if (filters.modelId) params.set('model_id', filters.modelId);
        if (filters.fromYear) params.set('from_year', filters.fromYear);
        if (filters.toYear) params.set('to_year', filters.toYear);
        if (filters.priceTo) params.set('buy_now_price_to', filters.priceTo);

        params.set('page', '1');
        params.set('per_page', '12');
        params.set('vehicle_type', '1');

        router.push(`/cars?${params.toString()}`);
    };

    const clearFilters = () => {
        setFilters({
            manufacturerId: '',
            modelId: '',
            fromYear: '',
            toYear: '',
            priceTo: ''
        });
        router.push('/cars');
    };

    const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

    // Prepare options
    const manufacturerOptions = filterData.manufacturers.map(({ id, translated }) => ({
        value: id.toString(),
        label: translated
    }));

    const modelOptions = filterData.models.map(model => ({
        value: model.id.toString(),
        label: model.name
    }));

    const yearOptions = [
        { value: '', label: 'Viti' },
        ...filterData.years.map(year => ({
            value: year.toString(),
            label: year.toString()
        }))
    ];

    const priceOptions = [
        { value: '', label: 'Çmimi max' },
        { value: '5000', label: '€5,000' },
        { value: '10000', label: '€10,000' },
        { value: '15000', label: '€15,000' },
        { value: '20000', label: '€20,000' },
        { value: '25000', label: '€25,000' },
        { value: '30000', label: '€30,000' },
        { value: '40000', label: '€40,000' },
        { value: '50000', label: '€50,000' },
        { value: '75000', label: '€75,000' },
        { value: '100000', label: '€100,000' },
    ];

    return (
        <div className="bg-surface rounded-xl border border-light/20 p-4 mb-8">
            <div className="flex flex-wrap items-center gap-3">
                {/* Manufacturer */}
                <div className="flex-1 min-w-[150px]">
                    <CustomSelect
                        value={filters.manufacturerId}
                        onChange={(value) => updateFilter('manufacturerId', value)}
                        options={manufacturerOptions}
                        placeholder="Prodhuesi"
                        icon={<Car size={16} />}
                        loading={loading.manufacturers}
                        fullWidth
                    />
                </div>

                {/* Model */}
                {filters.manufacturerId && (
                    <div className="flex-1 min-w-[150px]">
                        <CustomSelect
                            value={filters.modelId}
                            onChange={(value) => updateFilter('modelId', value)}
                            options={modelOptions}
                            placeholder="Modeli"
                            icon={<Car size={16} />}
                            loading={loading.models}
                            fullWidth
                        />
                    </div>
                )}

                {/* From Year */}
                <div className="w-[100px]">
                    <CustomSelect
                        value={filters.fromYear}
                        onChange={(value) => updateFilter('fromYear', value)}
                        options={yearOptions}
                        placeholder="Nga viti"
                        icon={<Calendar size={16} />}
                        fullWidth
                    />
                </div>

                {/* To Year */}
                <div className="w-[100px]">
                    <CustomSelect
                        value={filters.toYear}
                        onChange={(value) => updateFilter('toYear', value)}
                        options={yearOptions}
                        placeholder="Deri viti"
                        icon={<Calendar size={16} />}
                        fullWidth
                    />
                </div>

                {/* Price */}
                <div className="w-[130px]">
                    <CustomSelect
                        value={filters.priceTo}
                        onChange={(value) => updateFilter('priceTo', value)}
                        options={priceOptions}
                        placeholder="Çmimi max"
                        icon={<DollarSign size={16} />}
                        fullWidth
                    />
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="h-10 px-6 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
                >
                    <Search size={16} />
                    Kërko
                    {activeFilterCount > 0 && (
                        <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Clear Button */}
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="h-10 px-4 text-muted hover:text-orange-primary transition-colors flex items-center gap-1"
                    >
                        <X size={16} />
                        <span className="text-sm">Pastro</span>
                    </button>
                )}
            </div>
        </div>
    );
}