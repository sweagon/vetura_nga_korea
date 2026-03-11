// components/filters/AdvancedFilterSidebar.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Fuel,
    Settings,
    X,
    ChevronDown,
    ChevronUp,
    Palette,
    Car as CarIcon,
    Calendar,
    DollarSign,
    Info,
    Filter
} from 'lucide-react';

interface AdvancedFilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdvancedFilterSidebar({ isOpen, onClose }: AdvancedFilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [expandedSections, setExpandedSections] = useState({
        fuel: true,
        transmission: true,
        color: false,
        bodyType: false,
        year: false,
        price: false
    });

    // Get current filter values from URL
    const selectedFilters = useMemo(() => ({
        fuel: searchParams.get('fuel_id') || '',
        transmission: searchParams.get('transmission_id') || '',
        color: searchParams.get('color_id') || '',
        bodyType: searchParams.get('body_type_id') || '',
        yearFrom: searchParams.get('filter_year_from') || '',
        yearTo: searchParams.get('filter_year_to') || '',
        priceFrom: searchParams.get('filter_price_from') || '',
        priceTo: searchParams.get('filter_price_to') || '',
    }), [searchParams]);

    const activeFilterCount = Object.values(selectedFilters).filter(Boolean).length;

    // Check if basic filters are selected (API-supported filters)
    const hasBasicFilters = !!(
        searchParams.get('manufacturer_id') ||
        searchParams.get('model_id') ||
        searchParams.get('from_year') ||
        searchParams.get('to_year') ||
        searchParams.get('buy_now_price_from') ||
        searchParams.get('buy_now_price_to')
    );

    // Pre-defined options
    const fuelOptions = [
        { id: '1', name: 'diesel', label: 'Naftë' },
        { id: '2', name: 'electric', label: 'Elektrik' },
        { id: '3', name: 'hybrid', label: 'Hibrid' },
        { id: '4', name: 'gasoline', label: 'Benzinë' },
    ];

    const transmissionOptions = [
        { id: '1', name: 'automatic', label: 'Automatik' },
        { id: '2', name: 'manual', label: 'Manuel' },
    ];

    const colorOptions = [
        { id: '1', name: 'silver', label: 'Argjend' },
        { id: '2', name: 'purple', label: 'Vjollcë' },
        { id: '3', name: 'orange', label: 'Portokalli' },
        { id: '4', name: 'green', label: 'Gjelbër' },
        { id: '5', name: 'red', label: 'Kuq' },
        { id: '6', name: 'gold', label: 'Arë' },
        { id: '8', name: 'brown', label: 'Kafe' },
        { id: '9', name: 'grey', label: 'Gri' },
        { id: '11', name: 'blue', label: 'Kaltër' },
        { id: '13', name: 'white', label: 'Bardhë' },
        { id: '15', name: 'black', label: 'Zi' },
        { id: '16', name: 'yellow', label: 'Verdhë' },
    ];

    const bodyTypeOptions = [
        { id: '1', name: 'sedan', label: 'Sedan' },
        { id: '2', name: 'wagon', label: 'Kombi' },
        { id: '3', name: 'coupe', label: 'Kupe' },
        { id: '5', name: 'suv', label: 'SUV' },
        { id: '7', name: 'van', label: 'Furgon' },
        { id: '11', name: 'hatchback', label: 'Hatchback' },
        { id: '27', name: 'sport_car', label: 'Makinë Sportive' },
    ];

    // Generate year options (last 30 years)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Reset to page 1 when filters change
        params.set('page', '1');

        router.push(`/cars?${params.toString()}`);
        onClose();
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        ['fuel_id', 'transmission_id', 'color_id', 'body_type_id', 'filter_year_from', 'filter_year_to', 'filter_price_from', 'filter_price_to'].forEach(key => {
            params.delete(key);
        });
        params.set('page', '1');
        router.push(`/cars?${params.toString()}`);
        onClose();
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // For desktop, always show the sidebar content
    // For mobile, only show when isOpen is true
    const showSidebar = typeof window !== 'undefined' && window.innerWidth >= 1024 ? true : isOpen;

    if (!showSidebar) return null;

    return (
        <>
            {/* Mobile Overlay - only show on mobile when open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 bottom-0 left-0 w-full sm:w-80 bg-surface border-r border-light/20 
                overflow-y-auto z-50 transition-transform duration-300 shadow-2xl
                lg:translate-x-0 lg:sticky lg:top-24 lg:h-[calc(100vh-96px)] lg:z-10
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header */}
                <div className="bg-[#0A1929]/10 bg-clip-padding backdrop-filter backdrop-blur-sm rounded sticky top-0 bg-surface border-b border-light/20 p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-orange-500" />
                        <h2 className="font-semibold text-primary">Filtro</h2>
                        {activeFilterCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-surface-2"
                            >
                                <X size={14} />
                                <span>Pastro</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-surface-2 rounded-lg"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Basic Filters Notice */}
                    {!hasBasicFilters && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                            <div className="flex items-start gap-2">
                                <Info size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-orange-700">
                                    Zgjidh fillimisht prodhuesin, modelin ose vitin për të aktivizuar filtrat e tjerë.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Fuel Type */}
                    <div className="border border-light/20 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleSection('fuel')}
                            className="w-full flex items-center justify-between p-3 bg-surface-2 hover:bg-surface-3 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Fuel size={16} className="text-orange-500" />
                                <span className="font-medium text-sm text-primary">Karburanti</span>
                            </div>
                            {expandedSections.fuel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {expandedSections.fuel && (
                            <div className="p-3 space-y-1 bg-surface">
                                <button
                                    onClick={() => updateFilter('fuel_id', '')}
                                    disabled={!hasBasicFilters}
                                    className={`
                                        w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                        ${!selectedFilters.fuel ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                        ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span className={!selectedFilters.fuel ? 'font-medium' : ''}>Të gjitha</span>
                                    {!selectedFilters.fuel && (
                                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                    )}
                                </button>
                                {fuelOptions.map(fuel => (
                                    <button
                                        key={fuel.id}
                                        onClick={() => updateFilter('fuel_id', fuel.id)}
                                        disabled={!hasBasicFilters}
                                        className={`
                                            w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                            ${selectedFilters.fuel === fuel.id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                            ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <span className={selectedFilters.fuel === fuel.id ? 'font-medium' : ''}>{fuel.label}</span>
                                        {selectedFilters.fuel === fuel.id && (
                                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Transmission */}
                    <div className="border border-light/20 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleSection('transmission')}
                            className="w-full flex items-center justify-between p-3 bg-surface-2 hover:bg-surface-3 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Settings size={16} className="text-orange-500" />
                                <span className="font-medium text-sm text-primary">Transmisioni</span>
                            </div>
                            {expandedSections.transmission ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {expandedSections.transmission && (
                            <div className="p-3 space-y-1 bg-surface">
                                <button
                                    onClick={() => updateFilter('transmission_id', '')}
                                    disabled={!hasBasicFilters}
                                    className={`
                                        w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                        ${!selectedFilters.transmission ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                        ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span className={!selectedFilters.transmission ? 'font-medium' : ''}>Të gjitha</span>
                                    {!selectedFilters.transmission && (
                                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                    )}
                                </button>
                                {transmissionOptions.map(trans => (
                                    <button
                                        key={trans.id}
                                        onClick={() => updateFilter('transmission_id', trans.id)}
                                        disabled={!hasBasicFilters}
                                        className={`
                                            w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                            ${selectedFilters.transmission === trans.id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                            ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <span className={selectedFilters.transmission === trans.id ? 'font-medium' : ''}>{trans.label}</span>
                                        {selectedFilters.transmission === trans.id && (
                                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Color */}
                    <div className="border border-light/20 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleSection('color')}
                            className="w-full flex items-center justify-between p-3 bg-surface-2 hover:bg-surface-3 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Palette size={16} className="text-orange-500" />
                                <span className="font-medium text-sm text-primary">Ngjyra</span>
                            </div>
                            {expandedSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {expandedSections.color && (
                            <div className="p-3 space-y-1 max-h-48 overflow-y-auto bg-surface">
                                <button
                                    onClick={() => updateFilter('color_id', '')}
                                    disabled={!hasBasicFilters}
                                    className={`
                                        w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                        ${!selectedFilters.color ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                        ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span className={!selectedFilters.color ? 'font-medium' : ''}>Të gjitha</span>
                                    {!selectedFilters.color && (
                                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                    )}
                                </button>
                                {colorOptions.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => updateFilter('color_id', color.id)}
                                        disabled={!hasBasicFilters}
                                        className={`
                                            w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                            ${selectedFilters.color === color.id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                            ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <span className={selectedFilters.color === color.id ? 'font-medium' : ''}>{color.label}</span>
                                        {selectedFilters.color === color.id && (
                                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Body Type */}
                    <div className="border border-light/20 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleSection('bodyType')}
                            className="w-full flex items-center justify-between p-3 bg-surface-2 hover:bg-surface-3 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <CarIcon size={16} className="text-orange-500" />
                                <span className="font-medium text-sm text-primary">Tipi</span>
                            </div>
                            {expandedSections.bodyType ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {expandedSections.bodyType && (
                            <div className="p-3 space-y-1 bg-surface">
                                <button
                                    onClick={() => updateFilter('body_type_id', '')}
                                    disabled={!hasBasicFilters}
                                    className={`
                                        w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                        ${!selectedFilters.bodyType ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                        ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span className={!selectedFilters.bodyType ? 'font-medium' : ''}>Të gjitha</span>
                                    {!selectedFilters.bodyType && (
                                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                    )}
                                </button>
                                {bodyTypeOptions.map(body => (
                                    <button
                                        key={body.id}
                                        onClick={() => updateFilter('body_type_id', body.id)}
                                        disabled={!hasBasicFilters}
                                        className={`
                                            w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                            ${selectedFilters.bodyType === body.id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                            ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <span className={selectedFilters.bodyType === body.id ? 'font-medium' : ''}>{body.label}</span>
                                        {selectedFilters.bodyType === body.id && (
                                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Year Range */}
                    <div className="border border-light/20 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleSection('year')}
                            className="w-full flex items-center justify-between p-3 bg-surface-2 hover:bg-surface-3 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-orange-500" />
                                <span className="font-medium text-sm text-primary">Viti</span>
                            </div>
                            {expandedSections.year ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {expandedSections.year && (
                            <div className="p-3 space-y-3 bg-surface">
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={selectedFilters.yearFrom}
                                        onChange={(e) => updateFilter('filter_year_from', e.target.value)}
                                        className="select text-sm w-full"
                                    >
                                        <option value="">Nga viti</option>
                                        {yearOptions.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedFilters.yearTo}
                                        onChange={(e) => updateFilter('filter_year_to', e.target.value)}
                                        className="select text-sm w-full"
                                    >
                                        <option value="">Deri viti</option>
                                        {yearOptions.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Price Range */}
                    <div className="border border-light/20 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleSection('price')}
                            className="w-full flex items-center justify-between p-3 bg-surface-2 hover:bg-surface-3 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-orange-500" />
                                <span className="font-medium text-sm text-primary">Çmimi</span>
                            </div>
                            {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {expandedSections.price && (
                            <div className="p-3 space-y-3 bg-surface">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min €"
                                        value={selectedFilters.priceFrom}
                                        onChange={(e) => updateFilter('filter_price_from', e.target.value)}
                                        className="input text-sm w-full"
                                        min="0"
                                        step="1000"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max €"
                                        value={selectedFilters.priceTo}
                                        onChange={(e) => updateFilter('filter_price_to', e.target.value)}
                                        className="input text-sm w-full"
                                        min="0"
                                        step="1000"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Filters Summary */}
                    {activeFilterCount > 0 && (
                        <div className="bg-orange-5 border border-orange-20 rounded-lg p-3 mt-4">
                            <p className="text-xs text-orange-500 font-medium mb-2">
                                Filtrat aktivë:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {selectedFilters.fuel && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Karburanti: {fuelOptions.find(f => f.id === selectedFilters.fuel)?.label}
                                    </span>
                                )}
                                {selectedFilters.transmission && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Transmisioni: {transmissionOptions.find(t => t.id === selectedFilters.transmission)?.label}
                                    </span>
                                )}
                                {selectedFilters.color && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Ngjyra: {colorOptions.find(c => c.id === selectedFilters.color)?.label}
                                    </span>
                                )}
                                {selectedFilters.bodyType && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Tipi: {bodyTypeOptions.find(b => b.id === selectedFilters.bodyType)?.label}
                                    </span>
                                )}
                                {selectedFilters.yearFrom && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Nga viti: {selectedFilters.yearFrom}
                                    </span>
                                )}
                                {selectedFilters.yearTo && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Deri viti: {selectedFilters.yearTo}
                                    </span>
                                )}
                                {selectedFilters.priceFrom && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Min: €{parseInt(selectedFilters.priceFrom).toLocaleString()}
                                    </span>
                                )}
                                {selectedFilters.priceTo && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Max: €{parseInt(selectedFilters.priceTo).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}