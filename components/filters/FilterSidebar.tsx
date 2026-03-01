// components/filters/FilterSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarFilters } from '@/hooks/useCarFilters';
import FilterSection from './FilterSection';
import RangeFilter from './RangeFilter';
import CustomSelect from '@/components/ui/CustomSelect';

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { filters, filterData, loading, activeFilterCount } = useCarFilters();

    const [localFilters, setLocalFilters] = useState(filters);
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
        setLocalFilters(filters);
    }, [filters]);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const updateFilter = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Update params with local filters
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value !== '') {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });

        params.set('page', '1'); // Reset to first page
        router.push(`/cars?${params.toString()}`);
    };

    const clearFilters = () => {
        const newFilters = {
            manufacturerId: '',
            modelId: '',
            generationId: '',
            fromYear: '',
            toYear: '',
            odometerFrom: '',
            odometerTo: '',
            priceFrom: '',
            priceTo: '',
            transmissionId: '',
            fuelId: '',
            bodyTypeId: '',
            colorId: '',
            inStock: false,
        };
        setLocalFilters(newFilters);

        // Clear URL params
        router.push('/cars');
    };

    // Prepare options
    const manufacturerOptions = filterData.manufacturers.map(m => ({
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

    return (
        <div className="w-full shrink-0">
            <div className="sticky top-24 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
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

                {/* Filter Sections */}
                <div className="bg-surface border border-light rounded-xl divide-y divide-light/20">

                    {/* Manufacturer Filter */}
                    <FilterSection
                        title="Prodhuesi"
                        isExpanded={expandedSections.manufacturer}
                        onToggle={() => toggleSection('manufacturer')}
                    >
                        <CustomSelect
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
                            <CustomSelect
                                value={localFilters.modelId}
                                onChange={(value) => updateFilter('modelId', value)}
                                options={filterData.models.map(m => ({
                                    value: m.id.toString(),
                                    label: m.name
                                }))}
                                placeholder="Zgjidh modelin"
                                loading={loading.models}
                                className="w-full"
                            />
                        </FilterSection>
                    )}

                    {/* Year Range Filter */}
                    <FilterSection
                        title="Viti"
                        isExpanded={expandedSections.year}
                        onToggle={() => toggleSection('year')}
                    >
                        <RangeFilter
                            min={1990}
                            max={new Date().getFullYear()}
                            fromValue={localFilters.fromYear}
                            toValue={localFilters.toYear}
                            onFromChange={(value) => updateFilter('fromYear', value)}
                            onToChange={(value) => updateFilter('toYear', value)}
                            fromPlaceholder="Nga"
                            toPlaceholder="Deri"
                        />
                    </FilterSection>

                    {/* Price Range Filter */}
                    <FilterSection
                        title="Çmimi (€)"
                        isExpanded={expandedSections.price}
                        onToggle={() => toggleSection('price')}
                    >
                        <RangeFilter
                            min={0}
                            max={100000}
                            fromValue={localFilters.priceFrom}
                            toValue={localFilters.priceTo}
                            onFromChange={(value) => updateFilter('priceFrom', value)}
                            onToChange={(value) => updateFilter('priceTo', value)}
                            fromPlaceholder="Nga €"
                            toPlaceholder="Deri €"
                            step={1000}
                        />
                    </FilterSection>

                    {/* Mileage Range Filter */}
                    <FilterSection
                        title="Kilometrazha"
                        isExpanded={expandedSections.mileage}
                        onToggle={() => toggleSection('mileage')}
                    >
                        <RangeFilter
                            min={0}
                            max={300000}
                            fromValue={localFilters.odometerFrom}
                            toValue={localFilters.odometerTo}
                            onFromChange={(value) => updateFilter('odometerFrom', value)}
                            onToChange={(value) => updateFilter('odometerTo', value)}
                            fromPlaceholder="Nga km"
                            toPlaceholder="Deri km"
                            step={5000}
                        />
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

                    {/* Fuel Type Filter */}
                    <FilterSection
                        title="Karburanti"
                        isExpanded={expandedSections.fuel}
                        onToggle={() => toggleSection('fuel')}
                    >
                        <div className="space-y-2">
                            {fuelOptions.map(option => (
                                <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        value={option.value}
                                        checked={localFilters.fuelId === option.value}
                                        onChange={(e) => updateFilter('fuelId', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`
                                        w-4 h-4 rounded border-2 transition-colors flex items-center justify-center
                                        ${localFilters.fuelId === option.value
                                            ? 'border-orange-primary bg-orange-primary'
                                            : 'border-light group-hover:border-orange-primary/50'
                                        }
                                    `}>
                                        {localFilters.fuelId === option.value && (
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
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
                        <CustomSelect
                            value={localFilters.colorId}
                            onChange={(value) => updateFilter('colorId', value)}
                            options={colorOptions}
                            placeholder="Zgjidh ngjyrën"
                            className="w-full"
                        />
                    </FilterSection>
                </div>
            </div>
        </div>
    );
}