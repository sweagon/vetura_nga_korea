// components/ui/CompactSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';
import {
    Search,
    Car,
    Calendar,
    DollarSign,
    X
} from 'lucide-react';
import { fetchFilterData, fetchModels } from '@/lib/api';
import { getTranslatedManufacturers } from '@/lib/translations';
import CustomSelect from './CustomSelect';
import { filterManufacturers } from '@/lib/staticManufacturers';

interface CompactSearchProps {
    variant?: 'header' | 'hero';
    onSearch?: () => void;
}

interface SearchFilters {
    manufacturerId: string;
    modelId: string;
    fromYear: string;
    toYear: string;
    priceTo: string;
}

// Inner component that uses searchParams
function CompactSearchContent({ searchParams, variant, onSearch }: any) {
    const router = useRouter();
    const [loading, setLoading] = useState({
        manufacturers: false,
        models: false
    });
    const [filterData, setFilterData] = useState({
        manufacturers: [] as Array<{ id: number; original: string; translated: string }>,
        models: [] as Array<{ id: number; name: string; manufacturer_id: number }>,
        years: [] as number[]
    });

    const [filters, setFilters] = useState<SearchFilters>({
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
                const data = await fetchFilterData();  // <-- Fetches manufacturers here
                setFilterData({
                    manufacturers: getTranslatedManufacturers(data.manufacturers),  // <-- Stores them
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

    const updateFilter = (key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key === 'manufacturerId') {
            setFilters(prev => ({ ...prev, modelId: '' }));
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();

        // Add all filters
        if (filters.manufacturerId) params.set('manufacturer_id', filters.manufacturerId);
        if (filters.modelId) params.set('model_id', filters.modelId);
        if (filters.fromYear) params.set('from_year', filters.fromYear);
        if (filters.toYear) params.set('to_year', filters.toYear);
        if (filters.priceTo) params.set('buy_now_price_to', filters.priceTo);

        params.set('page', '1');
        params.set('per_page', '12');
        params.set('vehicle_type', '1');

        router.push(`/cars?${params.toString()}`);
        onSearch?.();
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
        label: translated  // <-- Shows translated manufacturer names
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

    const isHero = variant === 'hero';

    return (
        <>
            {/* Desktop Version - Hidden on mobile */}
            <div className="hidden md:block w-full md:w-fit">
                <div className={`
                    flex items-center gap-2 
                    ${isHero
                        ? 'bg-orange-500 backdrop-blur-md border border-white/20'
                        : 'bg-orange-500 border border-light/20'
                    } 
                    rounded-xl p-1.5 shadow-lg
                `}>
                    {/* Search Icon */}
                    <div className="flex items-center justify-center w-9 h-9 shrink-0">
                        <Search size={16} className={isHero ? 'text-white/70' : 'text-muted'} />
                    </div>

                    {/* Filters */}
                    <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
                        <CustomSelect
                            value={filters.manufacturerId}
                            onChange={(value) => updateFilter('manufacturerId', value)}
                            options={manufacturerOptions}
                            placeholder="Prodhuesi"
                            icon={<Car size={14} />}
                            loading={loading.manufacturers}
                            variant={isHero ? 'hero' : 'default'}
                            className="w-[130px]"
                        />

                        {filters.manufacturerId && (
                            <CustomSelect
                                value={filters.modelId}
                                onChange={(value) => updateFilter('modelId', value)}
                                options={modelOptions}
                                placeholder="Modeli"
                                icon={<Car size={14} />}
                                loading={loading.models}
                                variant={isHero ? 'hero' : 'default'}
                                className="w-[120px]"
                            />
                        )}

                        <CustomSelect
                            value={filters.fromYear}
                            onChange={(value) => updateFilter('fromYear', value)}
                            options={yearOptions}
                            placeholder="Nga"
                            icon={<Calendar size={14} />}
                            variant={isHero ? 'hero' : 'default'}
                            className="w-[85px]"
                        />

                        <CustomSelect
                            value={filters.toYear}
                            onChange={(value) => updateFilter('toYear', value)}
                            options={yearOptions}
                            placeholder="Deri"
                            icon={<Calendar size={14} />}
                            variant={isHero ? 'hero' : 'default'}
                            className="w-[85px]"
                        />

                        <CustomSelect
                            value={filters.priceTo}
                            onChange={(value) => updateFilter('priceTo', value)}
                            options={priceOptions}
                            placeholder="Max"
                            icon={<DollarSign size={14} />}
                            variant={isHero ? 'hero' : 'default'}
                            className="w-[100px]"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className={`
                                    w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200
                                    ${isHero
                                        ? 'text-white/70 hover:text-white hover:bg-white/10'
                                        : 'text-muted hover:text-orange-primary hover:bg-surface-2'
                                    }
                                `}
                                title="Pastro filtrat"
                                aria-label="Pastro filtrat"
                            >
                                <X size={16} />
                            </button>
                        )}

                        <button
                            onClick={handleSearch}
                            className={`
                                h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200 
                                flex items-center gap-1.5 whitespace-nowrap
                                ${isHero
                                    ? 'bg-white text-orange-600 hover:bg-gray-100'
                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                }
                            `}
                            aria-label="Kërko"
                        >
                            <Search size={14} />
                            <span className="hidden sm:inline">Kërko</span>
                            {activeFilterCount > 0 && (
                                <span className={`
                                    ml-0.5 px-1.5 py-0.5 text-xs rounded-full font-medium
                                    ${isHero ? 'bg-orange-100 text-orange-600' : 'bg-white/20 text-white'}
                                `}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Version - Visible only on mobile */}
            <div className="md:hidden w-full">
                <div className={`
                    rounded-xl p-3 shadow-lg space-y-3
                    ${isHero
                        ? 'bg-orange-500/95 backdrop-blur-md border border-white/20'
                        : 'bg-surface border border-light/20'
                    }
                `}>
                    {/* Filter Row */}
                    <div className="grid grid-cols-2 gap-2">
                        <CustomSelect
                            value={filters.manufacturerId}
                            onChange={(value) => updateFilter('manufacturerId', value)}
                            options={manufacturerOptions}
                            placeholder="Prodhuesi"
                            icon={<Car size={16} />}
                            loading={loading.manufacturers}
                            variant={isHero ? 'hero' : 'default'}
                            fullWidth
                        />

                        {filters.manufacturerId && (
                            <CustomSelect
                                value={filters.modelId}
                                onChange={(value) => updateFilter('modelId', value)}
                                options={modelOptions}
                                placeholder="Modeli"
                                icon={<Car size={16} />}
                                loading={loading.models}
                                variant={isHero ? 'hero' : 'default'}
                                fullWidth
                            />
                        )}

                        {!filters.manufacturerId && (
                            <>
                                <CustomSelect
                                    value={filters.fromYear}
                                    onChange={(value) => updateFilter('fromYear', value)}
                                    options={yearOptions}
                                    placeholder="Nga viti"
                                    icon={<Calendar size={16} />}
                                    variant={isHero ? 'hero' : 'default'}
                                    fullWidth
                                />
                                <CustomSelect
                                    value={filters.toYear}
                                    onChange={(value) => updateFilter('toYear', value)}
                                    options={yearOptions}
                                    placeholder="Deri viti"
                                    icon={<Calendar size={16} />}
                                    variant={isHero ? 'hero' : 'default'}
                                    fullWidth
                                />
                            </>
                        )}
                    </div>

                    {/* Second Row - Only when manufacturer is selected */}
                    {filters.manufacturerId && (
                        <div className="grid grid-cols-2 gap-2">
                            <CustomSelect
                                value={filters.fromYear}
                                onChange={(value) => updateFilter('fromYear', value)}
                                options={yearOptions}
                                placeholder="Nga viti"
                                icon={<Calendar size={16} />}
                                variant={isHero ? 'hero' : 'default'}
                                fullWidth
                            />
                            <CustomSelect
                                value={filters.toYear}
                                onChange={(value) => updateFilter('toYear', value)}
                                options={yearOptions}
                                placeholder="Deri viti"
                                icon={<Calendar size={16} />}
                                variant={isHero ? 'hero' : 'default'}
                                fullWidth
                            />
                        </div>
                    )}

                    {/* Price and Search Row */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <CustomSelect
                                value={filters.priceTo}
                                onChange={(value) => updateFilter('priceTo', value)}
                                options={priceOptions}
                                placeholder="Çmimi max"
                                icon={<DollarSign size={16} />}
                                variant={isHero ? 'hero' : 'default'}
                                fullWidth
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            className={`
                                px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                flex items-center justify-center gap-2 min-w-[100px]
                                ${isHero
                                    ? 'bg-white text-orange-600 hover:bg-gray-100'
                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                }
                            `}
                        >
                            <Search size={16} />
                            <span>Kërko</span>
                            {activeFilterCount > 0 && (
                                <span className={`
                                    px-1.5 py-0.5 text-xs rounded-full
                                    ${isHero ? 'bg-orange-100 text-orange-600' : 'bg-white/20 text-white'}
                                `}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className={`
                                    p-2.5 rounded-lg transition-all duration-200
                                    ${isHero
                                        ? 'text-white/70 hover:text-white hover:bg-white/10'
                                        : 'text-muted hover:text-orange-primary hover:bg-surface-2'
                                    }
                                `}
                                aria-label="Pastro filtrat"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// Main export with Suspense wrapper
export default function CompactSearch(props: CompactSearchProps) {
    return (
        <SearchParamsWrapper fallback={
            <div className="h-11 bg-surface-2 rounded-xl animate-pulse w-full md:order-2 order-1" />
        }>
            {(searchParams) => <CompactSearchContent searchParams={searchParams} {...props} />}
        </SearchParamsWrapper>
    );
}