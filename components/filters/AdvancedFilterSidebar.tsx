'use client';

import { useState, useMemo, useEffect } from 'react';
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
    Filter,
    Search
} from 'lucide-react';

interface AdvancedFilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface TempFilters {
    fuel_id: string;
    transmission_id: string;
    color_id: string;
    body_type_id: string;
    filter_year_from: string;
    filter_year_to: string;
    filter_price_from: string;
    filter_price_to: string;
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

    // Temporary filters state
    const [tempFilters, setTempFilters] = useState<TempFilters>({
        fuel_id: '',
        transmission_id: '',
        color_id: '',
        body_type_id: '',
        filter_year_from: '',
        filter_year_to: '',
        filter_price_from: '',
        filter_price_to: ''
    });

    // Initialize temp filters from URL when sidebar opens
    useEffect(() => {
        if (isOpen) {
            setTempFilters({
                fuel_id: searchParams.get('fuel_id') || '',
                transmission_id: searchParams.get('transmission_id') || '',
                color_id: searchParams.get('color_id') || '',
                body_type_id: searchParams.get('body_type_id') || '',
                filter_year_from: searchParams.get('filter_year_from') || '',
                filter_year_to: searchParams.get('filter_year_to') || '',
                filter_price_from: searchParams.get('filter_price_from') || '',
                filter_price_to: searchParams.get('filter_price_to') || ''
            });
        }
    }, [isOpen, searchParams]);

    // Get current filter values from URL for active count
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

    // Temporary active count for UI feedback
    const tempActiveCount = Object.values(tempFilters).filter(Boolean).length;

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

    const updateTempFilter = (key: keyof TempFilters, value: string) => {
        setTempFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Update all filter parameters from temp state
        Object.entries(tempFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Reset to page 1 when filters change
        params.set('page', '1');

        router.push(`/cars?${params.toString()}`);
        onClose();
    };

    const clearFilters = () => {
        setTempFilters({
            fuel_id: '',
            transmission_id: '',
            color_id: '',
            body_type_id: '',
            filter_year_from: '',
            filter_year_to: '',
            filter_price_from: '',
            filter_price_to: ''
        });
    };

    const clearAllAndClose = () => {
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

    const isFilterSelected = (filterType: keyof TempFilters, value: string) => {
        return tempFilters[filterType] === value;
    };

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
                        {tempActiveCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                                {tempActiveCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {tempActiveCount > 0 && (
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
                                    onClick={() => updateTempFilter('fuel_id', '')}
                                    disabled={!hasBasicFilters}
                                    className={`
                                        w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                        ${!tempFilters.fuel_id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                        ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span className={!tempFilters.fuel_id ? 'font-medium' : ''}>Të gjitha</span>
                                    {!tempFilters.fuel_id && (
                                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                    )}
                                </button>
                                {fuelOptions.map(fuel => (
                                    <button
                                        key={fuel.id}
                                        onClick={() => updateTempFilter('fuel_id', fuel.id)}
                                        disabled={!hasBasicFilters}
                                        className={`
                                            w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                            ${tempFilters.fuel_id === fuel.id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                            ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <span className={tempFilters.fuel_id === fuel.id ? 'font-medium' : ''}>{fuel.label}</span>
                                        {tempFilters.fuel_id === fuel.id && (
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
                                    onClick={() => updateTempFilter('transmission_id', '')}
                                    disabled={!hasBasicFilters}
                                    className={`
                                        w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                        ${!tempFilters.transmission_id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                        ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span className={!tempFilters.transmission_id ? 'font-medium' : ''}>Të gjitha</span>
                                    {!tempFilters.transmission_id && (
                                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                    )}
                                </button>
                                {transmissionOptions.map(trans => (
                                    <button
                                        key={trans.id}
                                        onClick={() => updateTempFilter('transmission_id', trans.id)}
                                        disabled={!hasBasicFilters}
                                        className={`
                                            w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                            ${tempFilters.transmission_id === trans.id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                            ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <span className={tempFilters.transmission_id === trans.id ? 'font-medium' : ''}>{trans.label}</span>
                                        {tempFilters.transmission_id === trans.id && (
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
                                    onClick={() => updateTempFilter('color_id', '')}
                                    disabled={!hasBasicFilters}
                                    className={`
                                        w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                        ${!tempFilters.color_id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                        ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span className={!tempFilters.color_id ? 'font-medium' : ''}>Të gjitha</span>
                                    {!tempFilters.color_id && (
                                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                    )}
                                </button>
                                {colorOptions.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => updateTempFilter('color_id', color.id)}
                                        disabled={!hasBasicFilters}
                                        className={`
                                            w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                            ${tempFilters.color_id === color.id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                            ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <span className={tempFilters.color_id === color.id ? 'font-medium' : ''}>{color.label}</span>
                                        {tempFilters.color_id === color.id && (
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
                                    onClick={() => updateTempFilter('body_type_id', '')}
                                    disabled={!hasBasicFilters}
                                    className={`
                                        w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                        ${!tempFilters.body_type_id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                        ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span className={!tempFilters.body_type_id ? 'font-medium' : ''}>Të gjitha</span>
                                    {!tempFilters.body_type_id && (
                                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Aktiv</span>
                                    )}
                                </button>
                                {bodyTypeOptions.map(body => (
                                    <button
                                        key={body.id}
                                        onClick={() => updateTempFilter('body_type_id', body.id)}
                                        disabled={!hasBasicFilters}
                                        className={`
                                            w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all
                                            ${tempFilters.body_type_id === body.id ? 'bg-orange-500 text-white' : 'hover:bg-surface-2 text-secondary'}
                                            ${!hasBasicFilters ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <span className={tempFilters.body_type_id === body.id ? 'font-medium' : ''}>{body.label}</span>
                                        {tempFilters.body_type_id === body.id && (
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
                                        value={tempFilters.filter_year_from}
                                        onChange={(e) => updateTempFilter('filter_year_from', e.target.value)}
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
                                        value={tempFilters.filter_year_to}
                                        onChange={(e) => updateTempFilter('filter_year_to', e.target.value)}
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
                                        value={tempFilters.filter_price_from}
                                        onChange={(e) => updateTempFilter('filter_price_from', e.target.value)}
                                        className="input text-sm w-full"
                                        min="0"
                                        step="1000"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max €"
                                        value={tempFilters.filter_price_to}
                                        onChange={(e) => updateTempFilter('filter_price_to', e.target.value)}
                                        className="input text-sm w-full"
                                        min="0"
                                        step="1000"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Filters Summary */}
                    {tempActiveCount > 0 && (
                        <div className="bg-orange-5 border border-orange-20 rounded-lg p-3 mt-4">
                            <p className="text-xs text-orange-500 font-medium mb-2">
                                Filtrat e zgjedhur:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {tempFilters.fuel_id && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Karburanti: {fuelOptions.find(f => f.id === tempFilters.fuel_id)?.label}
                                    </span>
                                )}
                                {tempFilters.transmission_id && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Transmisioni: {transmissionOptions.find(t => t.id === tempFilters.transmission_id)?.label}
                                    </span>
                                )}
                                {tempFilters.color_id && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Ngjyra: {colorOptions.find(c => c.id === tempFilters.color_id)?.label}
                                    </span>
                                )}
                                {tempFilters.body_type_id && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Tipi: {bodyTypeOptions.find(b => b.id === tempFilters.body_type_id)?.label}
                                    </span>
                                )}
                                {tempFilters.filter_year_from && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Nga viti: {tempFilters.filter_year_from}
                                    </span>
                                )}
                                {tempFilters.filter_year_to && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Deri viti: {tempFilters.filter_year_to}
                                    </span>
                                )}
                                {tempFilters.filter_price_from && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Min: €{parseInt(tempFilters.filter_price_from).toLocaleString()}
                                    </span>
                                )}
                                {tempFilters.filter_price_to && (
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                        Max: €{parseInt(tempFilters.filter_price_to).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with Apply Button */}
                <div className="sticky bottom-0 bg-surface border-t border-light/20 p-4">
                    <div className="flex gap-2">
                        {tempActiveCount > 0 && (
                            <button
                                onClick={clearAllAndClose}
                                className="flex-1 px-4 py-2.5 border border-light/20 text-secondary rounded-lg hover:bg-surface-2 transition-colors text-sm font-medium"
                            >
                                Anulo
                            </button>
                        )}
                        <button
                            onClick={applyFilters}
                            disabled={!hasBasicFilters && tempActiveCount > 0}
                            className={`
                                flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg 
                                hover:bg-orange-600 transition-colors text-sm font-medium
                                flex items-center justify-center gap-2
                                ${(!hasBasicFilters && tempActiveCount > 0) ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <Search size={16} />
                            <span>Filtro</span>
                            {tempActiveCount > 0 && (
                                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                                    {tempActiveCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}