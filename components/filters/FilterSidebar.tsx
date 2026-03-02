// components/filters/FilterSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import { useCarFilters } from '@/hooks/useCarFilters';
import FilterSection from './FilterSection';
import MobileSelect from '@/components/ui/MobileSelect';

interface FilterSidebarProps {
    onApply?: () => void;
}

// Define local filter type that matches what we use
interface LocalFilters {
    manufacturerId: string;
    modelId: string;
    fromYear: string;
    toYear: string;
    priceFrom: string;
    priceTo: string;
    odometerFrom: string;
    odometerTo: string;
    transmissionId: string;
    fuelId: string;
    colorId: string;
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
        transmissionId: filters.transmissionId,
        fuelId: filters.fuelId,
        colorId: filters.colorId,
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
            transmissionId: filters.transmissionId,
            fuelId: filters.fuelId,
            colorId: filters.colorId,
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

        // Clear model when manufacturer changes
        if (key === 'manufacturerId') {
            setLocalFilters(prev => ({ ...prev, modelId: '' }));
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Map local filter keys to API parameter names
        const filterMapping: Record<keyof LocalFilters, string> = {
            manufacturerId: 'manufacturer_id',
            modelId: 'model_id',
            fromYear: 'from_year',
            toYear: 'to_year',
            priceFrom: 'buy_now_price_from',
            priceTo: 'buy_now_price_to',
            odometerFrom: 'odometer_from_km',
            odometerTo: 'odometer_to_km',
            transmissionId: 'transmission_id',
            fuelId: 'fuel_id',
            colorId: 'color_id',
        };

        // First, remove all existing filter params
        Object.values(filterMapping).forEach(param => {
            params.delete(param);
        });

        // Then add all non-empty filters
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value !== '') {
                const paramName = filterMapping[key as keyof LocalFilters];
                params.set(paramName, value.toString());
            }
        });

        // Always set page to 1 when filters change
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
            transmissionId: '',
            fuelId: '',
            colorId: '',
        });

        // Also clear URL
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('per_page', '12');
        params.set('vehicle_type', '1');
        router.push(`/cars?${params.toString()}`);
    };

    // Prepare options
    const manufacturerOptions = filterData.manufacturers.map(m => ({
        value: m.id.toString(),
        label: m.name
    }));

    const modelOptions = filterData.models.map(m => ({
        value: m.id.toString(),
        label: m.name
    }));

    const transmissionOptions = filterData.transmissions.map(t => ({
        value: t.id.toString(),
        label: t.name === 'automatic' ? 'Automatik' : 'Manuel'
    }));

    const fuelOptions = filterData.fuelTypes.map(f => ({
        value: f.id.toString(),
        label: f.name === 'diesel' ? 'Naftë' :
            f.name === 'gasoline' ? 'Benzinë' :
                f.name === 'electric' ? 'Elektrik' :
                    f.name === 'hybrid' ? 'Hibrid' : f.name
    }));

    const colorOptions = filterData.colors.map(c => ({
        value: c.id.toString(),
        label: c.name
    }));

    const yearOptions = [
        { value: '', label: 'Viti' },
        ...filterData.years.map(year => ({
            value: year.toString(),
            label: year.toString()
        }))
    ];

    const priceOptions = [
        { value: '', label: 'Çmimi' },
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
        { value: '', label: 'km' },
        { value: '50000', label: '50,000 km' },
        { value: '100000', label: '100,000 km' },
        { value: '150000', label: '150,000 km' },
        { value: '200000', label: '200,000 km' },
        { value: '250000', label: '250,000 km' },
        { value: '300000', label: '300,000 km' },
    ];

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

            {/* Filter Sections - All using MobileSelect for push-down */}
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
                        options={manufacturerOptions}
                        placeholder="Zgjidh prodhuesin"
                        loading={loading.filters}
                        className="w-full"
                    />
                </FilterSection>

                {/* Model Filter - Shows only when manufacturer selected */}
                {localFilters.manufacturerId && (
                    <FilterSection
                        title="Modeli"
                        isExpanded={expandedSections.model}
                        onToggle={() => toggleSection('model')}
                    >
                        <MobileSelect
                            value={localFilters.modelId}
                            onChange={(value) => updateFilter('modelId', value)}
                            options={modelOptions}
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
                            options={yearOptions}
                            placeholder="Nga"
                            className="w-full"
                        />
                        <MobileSelect
                            value={localFilters.toYear}
                            onChange={(value) => updateFilter('toYear', value)}
                            options={yearOptions}
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
                            value={localFilters.priceFrom || ''}
                            onChange={(value) => updateFilter('priceFrom', value)}
                            options={priceOptions}
                            placeholder="Nga"
                            className="w-full"
                        />
                        <MobileSelect
                            value={localFilters.priceTo || ''}
                            onChange={(value) => updateFilter('priceTo', value)}
                            options={priceOptions}
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
                            value={localFilters.odometerFrom || ''}
                            onChange={(value) => updateFilter('odometerFrom', value)}
                            options={mileageOptions}
                            placeholder="Nga"
                            className="w-full"
                        />
                        <MobileSelect
                            value={localFilters.odometerTo || ''}
                            onChange={(value) => updateFilter('odometerTo', value)}
                            options={mileageOptions}
                            placeholder="Deri"
                            className="w-full"
                        />
                    </div>
                </FilterSection>

                {/* Transmission Filter */}
                <FilterSection
                    title="Transmisioni"
                    isExpanded={expandedSections.transmission}
                    onToggle={() => toggleSection('transmission')}
                >
                    <div className="space-y-2">
                        {transmissionOptions.map(option => (
                            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="transmission"
                                    value={option.value}
                                    checked={localFilters.transmissionId === option.value}
                                    onChange={(e) => updateFilter('transmissionId', e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`
                                    w-4 h-4 rounded-full border-2 transition-colors
                                    ${localFilters.transmissionId === option.value
                                        ? 'border-orange-primary bg-orange-primary'
                                        : 'border-light group-hover:border-orange-primary/50'
                                    }
                                `}>
                                    {localFilters.transmissionId === option.value && (
                                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                    )}
                                </div>
                                <span className="text-sm text-secondary group-hover:text-primary">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                        <button
                            onClick={() => updateFilter('transmissionId', '')}
                            className="text-xs text-muted hover:text-orange-primary mt-2"
                        >
                            Pastro
                        </button>
                    </div>
                </FilterSection>

                {/* Fuel Filter */}
                <FilterSection
                    title="Karburanti"
                    isExpanded={expandedSections.fuel}
                    onToggle={() => toggleSection('fuel')}
                >
                    <div className="space-y-2">
                        {fuelOptions.map(option => (
                            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="fuel"
                                    value={option.value}
                                    checked={localFilters.fuelId === option.value}
                                    onChange={(e) => updateFilter('fuelId', e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`
                                    w-4 h-4 rounded-full border-2 transition-colors
                                    ${localFilters.fuelId === option.value
                                        ? 'border-orange-primary bg-orange-primary'
                                        : 'border-light group-hover:border-orange-primary/50'
                                    }
                                `}>
                                    {localFilters.fuelId === option.value && (
                                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                    )}
                                </div>
                                <span className="text-sm text-secondary group-hover:text-primary">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                        <button
                            onClick={() => updateFilter('fuelId', '')}
                            className="text-xs text-muted hover:text-orange-primary mt-2"
                        >
                            Pastro
                        </button>
                    </div>
                </FilterSection>

                {/* Color Filter */}
                <FilterSection
                    title="Ngjyra"
                    isExpanded={expandedSections.color}
                    onToggle={() => toggleSection('color')}
                >
                    <MobileSelect
                        value={localFilters.colorId}
                        onChange={(value) => updateFilter('colorId', value)}
                        options={colorOptions}
                        placeholder="Zgjidh ngjyrën"
                        className="w-full"
                    />
                </FilterSection>
            </div>

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