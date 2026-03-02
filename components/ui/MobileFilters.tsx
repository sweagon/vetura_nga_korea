// components/ui/MobileFilters.tsx
'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCarFilters, type FilterState } from '@/hooks/useCarFilters'; // Import type
import FilterSection from '@/components/filters/FilterSection';
import MobileSelect from '@/components/ui/MobileSelect';
import { fetchModels } from '@/lib/api';

interface MobileFiltersProps {
    isOpen: boolean;
    onClose: () => void;
}

// Define the local filter type that matches what we use
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

export default function MobileFilters({ isOpen, onClose }: MobileFiltersProps) {
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

    const [localModels, setLocalModels] = useState<Array<{ id: number; name: string }>>([]);
    const [loadingModels, setLoadingModels] = useState(false);
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

    // Load models when manufacturer changes
    useEffect(() => {
        const loadModels = async () => {
            if (!localFilters.manufacturerId) {
                setLocalModels([]);
                return;
            }

            try {
                setLoadingModels(true);
                const models = await fetchModels(parseInt(localFilters.manufacturerId), 'cars');
                setLocalModels(models);
                console.log('📱 Loaded models for manufacturer:', localFilters.manufacturerId, models);
            } catch (error) {
                console.error('Error loading models:', error);
                setLocalModels([]);
            } finally {
                setLoadingModels(false);
            }
        };

        loadModels();
    }, [localFilters.manufacturerId]);

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
        const params = new URLSearchParams();

        // Map local filter keys to API parameter names
        const filterMapping = {
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

        // Add all non-empty filters
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value !== '' && value !== 'false') {
                const paramName = filterMapping[key as keyof typeof filterMapping];
                if (paramName) {
                    params.set(paramName, value.toString());
                }
            }
        });

        // Always set page and per_page
        params.set('page', '1');
        params.set('per_page', '12');
        params.set('vehicle_type', '1');

        router.push(`/cars?${params.toString()}`);
        onClose();
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
        setLocalModels([]);
    };

    // Prepare options
    const manufacturerOptions = filterData.manufacturers.map(m => ({
        value: m.id.toString(),
        label: m.name
    }));

    const modelOptions = localModels.map(m => ({
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
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-hidden bg-primary border-l border-light/20">
                                        {/* Header - sticky */}
                                        <div className="sticky top-0 z-20 bg-primary/80 backdrop-blur-sm px-6 py-4 border-b border-light/20">
                                            <div className="flex items-center justify-between">
                                                <Dialog.Title className="text-lg font-semibold text-primary flex items-center gap-2">
                                                    Filtrat
                                                    {activeFilterCount > 0 && (
                                                        <span className="px-2 py-0.5 text-xs bg-orange-primary text-white rounded-full">
                                                            {activeFilterCount}
                                                        </span>
                                                    )}
                                                </Dialog.Title>
                                                <div className="flex items-center gap-2">
                                                    {activeFilterCount > 0 && (
                                                        <button
                                                            onClick={clearFilters}
                                                            className="text-sm text-muted hover:text-orange-primary transition-colors"
                                                        >
                                                            Pastro
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={onClose}
                                                        className="rounded-lg p-2 text-muted hover:text-primary hover:bg-surface-2 transition-colors"
                                                        aria-label="Mbyll"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Filter Content */}
                                        <div className="flex-1 overflow-y-auto px-6 py-4">
                                            <div className="space-y-4 divide-y divide-light/20">
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
                                                            loading={loadingModels}
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
                                        </div>

                                        {/* Bottom Button */}
                                        <div className="sticky bottom-0 bg-primary/80 backdrop-blur-sm border-t border-light/20 px-6 py-4">
                                            <button
                                                onClick={applyFilters}
                                                className="w-full btn-primary"
                                            >
                                                Shfaq rezultatet
                                                {activeFilterCount > 0 && (
                                                    <span className="ml-2 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                                                        {activeFilterCount}
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}