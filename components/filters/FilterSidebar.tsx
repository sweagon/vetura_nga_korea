// components/filters/FilterSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import { useCarFilters } from '@/hooks/useCarFilters';
import FilterSection from './FilterSection';
import MobileSelect from '@/components/ui/MobileSelect';
import RangeFilter from './RangeFilter';
import {
    translateFuel,
    translateTransmission,
    translateColor,
    getTranslatedManufacturers
} from '@/lib/translations';

interface FilterSidebarProps {
    onApply?: () => void;
}

interface LocalFilters {
    manufacturerId: string;
    modelId: string;
    fromYear: string;
    toYear: string;
    priceFrom: string;
    priceTo: string;
    odometerFrom: string;
    odometerTo: string;
}

export default function FilterSidebar({ onApply }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { filters, filterData, loading, activeFilterCount } = useCarFilters();

    const [localFilters, setLocalFilters] = useState<LocalFilters>({
        manufacturerId: filters.manufacturerId,
        modelId: filters.modelId,
        fromYear: filters.fromYear,
        toYear: filters.toYear,
        priceFrom: filters.priceFrom,
        priceTo: filters.priceTo,
        odometerFrom: filters.odometerFrom,
        odometerTo: filters.odometerTo,
    });

    const [expandedSections, setExpandedSections] = useState({
        manufacturer: true,
        model: false,
        year: true,
        price: true,
        mileage: false,
        transmission: false,
        fuel: false,
        color: false,
    });

    // Update local filters when URL changes
    useEffect(() => {
        setLocalFilters({
            manufacturerId: filters.manufacturerId,
            modelId: filters.modelId,
            fromYear: filters.fromYear,
            toYear: filters.toYear,
            priceFrom: filters.priceFrom,
            priceTo: filters.priceTo,
            odometerFrom: filters.odometerFrom,
            odometerTo: filters.odometerTo,
        });
    }, [filters]);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const updateFilter = (key: keyof LocalFilters, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
        if (key === 'manufacturerId') {
            setLocalFilters(prev => ({ ...prev, modelId: '' }));
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();

        // Map local filter keys to URL parameter names
        // ALL filters are now applied via URL - API filters work server-side,
        // client-side filters work via CarGrid
        const filterMapping = {
            manufacturerId: 'manufacturer_id',
            modelId: 'model_id',
            fromYear: 'from_year',
            toYear: 'to_year',
            priceFrom: 'buy_now_price_from',
            priceTo: 'buy_now_price_to',
            odometerFrom: 'odometer_from_km',
            odometerTo: 'odometer_to_km',
            transmissionId: 'transmission_id', // Will be handled client-side
            fuelId: 'fuel_id',                  // Will be handled client-side
            colorId: 'color_id',                 // Will be handled client-side
        };

        // Add all non-empty filters to URL
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value !== '') {
                const paramName = filterMapping[key as keyof typeof filterMapping];
                params.set(paramName, value.toString());
            }
        });

        params.set('page', '1');
        params.set('per_page', '12');
        params.set('vehicle_type', '1');

        router.push(`/cars?${params.toString()}`);

        if (onApply) {
            onApply();
        }
    };

    const clearFilters = () => {
        setLocalFilters({
            manufacturerId: '',
            modelId: '',
            fromYear: '',
            toYear: '',
            priceFrom: '',
            priceTo: '',
            odometerFrom: '',
            odometerTo: '',
        });

        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('per_page', '12');
        params.set('vehicle_type', '1');
        router.push(`/cars?${params.toString()}`);
    };

    // Prepare options with translations
    const manufacturerOptions = getTranslatedManufacturers(filterData.manufacturers).map(({ id, translated }) => ({
        value: id.toString(),
        label: translated
    }));

    const modelOptions = filterData.models.map(m => ({
        value: m.id.toString(),
        label: m.name
    }));

    const transmissionOptions = filterData.transmissions.map(t => ({
        value: t.id.toString(),
        label: translateTransmission(t.name)
    }));

    const fuelOptions = filterData.fuelTypes.map(f => ({
        value: f.id.toString(),
        label: translateFuel(f.name)
    }));

    const colorOptions = filterData.colors.map(c => ({
        value: c.id.toString(),
        label: translateColor(c.name)
    }));

    const yearOptions = filterData.years.map(year => ({
        value: year.toString(),
        label: year.toString()
    }));

    const priceOptions = [
        { value: '5000', label: '€5,000' },
        { value: '10000', label: '€10,000' },
        { value: '15000', label: '€15,000' },
        { value: '20000', label: '€20,000' },
        { value: '25000', label: '€25,000' },
        { value: '30000', label: '€30,000' },
        { value: '35000', label: '€35,000' },
        { value: '40000', label: '€40,000' },
        { value: '45000', label: '€45,000' },
        { value: '50000', label: '€50,000' },
        { value: '60000', label: '€60,000' },
        { value: '70000', label: '€70,000' },
        { value: '80000', label: '€80,000' },
        { value: '90000', label: '€90,000' },
        { value: '100000', label: '€100,000' },
        { value: '125000', label: '€125,000' },
        { value: '150000', label: '€150,000' },
    ];

    const mileageOptions = [
        { value: '50000', label: '50,000 km' },
        { value: '100000', label: '100,000 km' },
        { value: '150000', label: '150,000 km' },
        { value: '200000', label: '200,000 km' },
        { value: '250000', label: '250,000 km' },
        { value: '300000', label: '300,000 km' },
    ];

    // Helper to get display label for active filters
    const getFilterDisplayLabel = (key: keyof LocalFilters, value: string): string => {
        switch (key) {
            case 'manufacturerId':
                return manufacturerOptions.find(o => o.value === value)?.label || value;
            case 'modelId':
                return modelOptions.find(o => o.value === value)?.label || value;
            default:
                return value;
        }
    };

    return (
        <div className="w-full bg-surface border border-light/20 rounded-xl p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-light/20">
                <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Filter size={18} className="text-orange-primary" />
                    Filtrat
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-orange-primary text-white rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </h2>
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-muted hover:text-orange-primary transition-colors"
                    >
                        Pastro të gjitha
                    </button>
                )}
            </div>

            {/* Info message about client-side filters */}
            <div className="mb-4 p-3 bg-orange-5 border border-orange-primary/20 rounded-lg">
                <p className="text-xs text-muted">
                    <span className="font-medium text-orange-primary">Informacion:</span> Disa filtra (transmisioni, karburanti, ngjyra) aplikohen pas ngarkimit të rezultateve.
                </p>
            </div>

            {/* Filter Sections */}
            <div className="space-y-4">
                {/* Manufacturer Filter */}
                <FilterSection
                    title="Prodhuesi"
                    isExpanded={expandedSections.manufacturer}
                    onToggle={() => toggleSection('manufacturer')}
                >
                    <MobileSelect
                        value={localFilters.manufacturerId}
                        onChange={(value) => updateFilter('manufacturerId', value)}
                        options={[{ value: '', label: 'Të gjithë prodhuesit' }, ...manufacturerOptions]}
                        placeholder="Zgjidh prodhuesin"
                        loading={loading.filters}
                        className="w-full"
                    />
                </FilterSection>

                {/* Model Filter */}
                {localFilters.manufacturerId && (
                    <FilterSection
                        title="Modeli"
                        isExpanded={expandedSections.model}
                        onToggle={() => toggleSection('model')}
                    >
                        <MobileSelect
                            value={localFilters.modelId}
                            onChange={(value) => updateFilter('modelId', value)}
                            options={[{ value: '', label: 'Të gjitha modelet' }, ...modelOptions]}
                            placeholder="Zgjidh modelin"
                            loading={loading.models}
                            className="w-full"
                        />
                    </FilterSection>
                )}

                {/* Year Filter */}
                <FilterSection
                    title="Viti"
                    isExpanded={expandedSections.year}
                    onToggle={() => toggleSection('year')}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <MobileSelect
                            value={localFilters.fromYear}
                            onChange={(value) => updateFilter('fromYear', value)}
                            options={[{ value: '', label: 'Nga' }, ...yearOptions.map(y => ({ value: y.value, label: y.label }))]}
                            placeholder="Nga"
                            className="w-full"
                        />
                        <MobileSelect
                            value={localFilters.toYear}
                            onChange={(value) => updateFilter('toYear', value)}
                            options={[{ value: '', label: 'Deri' }, ...yearOptions.map(y => ({ value: y.value, label: y.label }))]}
                            placeholder="Deri"
                            className="w-full"
                        />
                    </div>
                </FilterSection>

                {/* Price Filter */}
                <FilterSection
                    title="Çmimi (€)"
                    isExpanded={expandedSections.price}
                    onToggle={() => toggleSection('price')}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <MobileSelect
                            value={localFilters.priceFrom}
                            onChange={(value) => updateFilter('priceFrom', value)}
                            options={[{ value: '', label: 'Nga' }, ...priceOptions]}
                            placeholder="Nga"
                            className="w-full"
                        />
                        <MobileSelect
                            value={localFilters.priceTo}
                            onChange={(value) => updateFilter('priceTo', value)}
                            options={[{ value: '', label: 'Deri' }, ...priceOptions]}
                            placeholder="Deri"
                            className="w-full"
                        />
                    </div>
                </FilterSection>

                {/* Mileage Filter */}
                <FilterSection
                    title="Kilometrazha"
                    isExpanded={expandedSections.mileage}
                    onToggle={() => toggleSection('mileage')}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <MobileSelect
                            value={localFilters.odometerFrom}
                            onChange={(value) => updateFilter('odometerFrom', value)}
                            options={[{ value: '', label: 'Nga' }, ...mileageOptions]}
                            placeholder="Nga"
                            className="w-full"
                        />
                        <MobileSelect
                            value={localFilters.odometerTo}
                            onChange={(value) => updateFilter('odometerTo', value)}
                            options={[{ value: '', label: 'Deri' }, ...mileageOptions]}
                            placeholder="Deri"
                            className="w-full"
                        />
                    </div>
                </FilterSection>
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
                <div className="mt-4 pt-4 border-t border-light/20">
                    <h3 className="text-xs font-medium text-muted mb-2">Filtrat aktivë:</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(localFilters).map(([key, value]) => {
                            if (!value) return null;
                            let label = '';
                            switch (key) {
                                case 'manufacturerId': label = 'Prodhuesi'; break;
                                case 'modelId': label = 'Modeli'; break;
                                case 'fromYear': label = 'Viti nga'; break;
                                case 'toYear': label = 'Viti deri'; break;
                                case 'priceFrom': label = 'Çmimi nga'; break;
                                case 'priceTo': label = 'Çmimi deri'; break;
                                case 'odometerFrom': label = 'Km nga'; break;
                                case 'odometerTo': label = 'Km deri'; break;
                                case 'transmissionId': label = 'Transmisioni'; break;
                                case 'fuelId': label = 'Karburanti'; break;
                                case 'colorId': label = 'Ngjyra'; break;
                                default: return null;
                            }
                            return (
                                <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-surface-2 rounded-lg text-xs">
                                    <span className="text-muted">{label}:</span>
                                    <span className="text-primary font-medium">{getFilterDisplayLabel(key as keyof LocalFilters, value)}</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Apply Button */}
            <button
                onClick={applyFilters}
                className="w-full btn-primary mt-6"
            >
                Apliko filtrat
                {activeFilterCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </button>
        </div>
    );
}