'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchFilterData } from '@/lib/api';
import {
    X,
    ChevronDown,
    ChevronUp,
    Fuel,
    Gauge,
    Calendar,
    Euro,
    Car,
    RotateCcw,
    Star,
    Check,
    Loader2,
    Search,
    Zap,
    Sliders,
    Filter,
    XCircle,
    TrendingUp,
    Clock,
    Battery,
    Cpu,
    Wind
} from 'lucide-react';

interface FilterSidebarProps {
    onFilterChange?: (filters: any) => void;
    className?: string;
}

// Quick filter presets with better icons
const QUICK_FILTERS = [
    { id: 'german', label: 'Gjermane', icon: '🇩🇪', filter: { make: ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen'].join(',') } },
    { id: 'french', label: 'Franceze', icon: '🇫🇷', filter: { make: ['Renault', 'Peugeot', 'Citroën'].join(',') } },
    { id: 'suv', label: 'SUV', icon: '🚙', filter: { bodyType: 'SUV' } },
    { id: 'diesel', label: 'Diesel', icon: '⛽', filter: { fuelType: 'Diesel' } },
    { id: 'electric', label: 'Elektrike', icon: '⚡', filter: { fuelType: 'Electric' } },
    { id: 'under-10k', label: 'Nën €10k', icon: '💰', filter: { maxPrice: 10000 } },
    { id: 'under-20k', label: 'Nën €20k', icon: '💰', filter: { maxPrice: 20000 } },
    { id: 'new', label: '2022+', icon: '🆕', filter: { minYear: 2022 } },
];

// Price ranges with better labels
const PRICE_RANGES = [
    { id: 'price-1', label: '€0 - €5k', min: 0, max: 5000, icon: '🟢' },
    { id: 'price-2', label: '€5k - €10k', min: 5000, max: 10000, icon: '🟡' },
    { id: 'price-3', label: '€10k - €15k', min: 10000, max: 15000, icon: '🟠' },
    { id: 'price-4', label: '€15k - €20k', min: 15000, max: 20000, icon: '🔴' },
    { id: 'price-5', label: '€20k - €30k', min: 20000, max: 30000, icon: '💎' },
    { id: 'price-6', label: '€30k+', min: 30000, max: 1000000, icon: '👑' },
];

// Year ranges with decades
const YEAR_RANGES = [
    { id: 'year-1', label: '2023+', min: 2023, max: 2026, icon: '🆕' },
    { id: 'year-2', label: '2020-2022', min: 2020, max: 2022, icon: '✨' },
    { id: 'year-3', label: '2015-2019', min: 2015, max: 2019, icon: '⭐' },
    { id: 'year-4', label: '2010-2014', min: 2010, max: 2014, icon: '🌟' },
    { id: 'year-5', label: '2005-2009', min: 2005, max: 2009, icon: '💫' },
    { id: 'year-6', label: 'Para 2005', min: 1900, max: 2004, icon: '📅' },
];

// Mileage ranges with better labels
const MILEAGE_RANGES = [
    { id: 'mileage-1', label: '0 - 20k km', min: 0, max: 20000, icon: '🆕' },
    { id: 'mileage-2', label: '20k - 50k', min: 20000, max: 50000, icon: '✨' },
    { id: 'mileage-3', label: '50k - 80k', min: 50000, max: 80000, icon: '⭐' },
    { id: 'mileage-4', label: '80k - 120k', min: 80000, max: 120000, icon: '🌟' },
    { id: 'mileage-5', label: '120k - 160k', min: 120000, max: 160000, icon: '💫' },
    { id: 'mileage-6', label: '160k - 200k', min: 160000, max: 200000, icon: '📊' },
    { id: 'mileage-7', label: '200k+ km', min: 200000, max: 1000000, icon: '🏁' },
];

// Engine sizes
const ENGINE_SIZES = [
    { id: 'engine-1', label: '< 1.0L', min: 0, max: 1.0, icon: '💧' },
    { id: 'engine-2', label: '1.0L - 1.4L', min: 1.0, max: 1.4, icon: '💧💧' },
    { id: 'engine-3', label: '1.4L - 1.8L', min: 1.4, max: 1.8, icon: '💧💧💧' },
    { id: 'engine-4', label: '1.8L - 2.2L', min: 1.8, max: 2.2, icon: '🔥' },
    { id: 'engine-5', label: '2.2L - 3.0L', min: 2.2, max: 3.0, icon: '🔥🔥' },
    { id: 'engine-6', label: '3.0L+', min: 3.0, max: 10.0, icon: '⚡' },
];

// Power (HP) ranges
const POWER_RANGES = [
    { id: 'power-1', label: '< 75 HP', min: 0, max: 75, icon: '🐌' },
    { id: 'power-2', label: '75 - 110 HP', min: 75, max: 110, icon: '🚗' },
    { id: 'power-3', label: '110 - 150 HP', min: 110, max: 150, icon: '🚙' },
    { id: 'power-4', label: '150 - 200 HP', min: 150, max: 200, icon: '🏎️' },
    { id: 'power-5', label: '200 - 300 HP', min: 200, max: 300, icon: '🚀' },
    { id: 'power-6', label: '300+ HP', min: 300, max: 2000, icon: '⚡' },
];

// Body types
const BODY_TYPES = [
    { id: 'sedan', label: 'Sedan', icon: '🚗' },
    { id: 'suv', label: 'SUV', icon: '🚙' },
    { id: 'hatchback', label: 'Hatchback', icon: '🚘' },
    { id: 'wagon', label: 'Kombi', icon: '🚐' },
    { id: 'coupe', label: 'Coupe', icon: '🏎️' },
    { id: 'convertible', label: 'Cabrio', icon: '🛺' },
    { id: 'van', label: 'Van', icon: '🚐' },
    { id: 'pickup', label: 'Pickup', icon: '🛻' },
];

// Color options
const COLORS = [
    { id: 'black', label: 'E zezë', color: '#000000' },
    { id: 'white', label: 'E bardhë', color: '#FFFFFF' },
    { id: 'silver', label: 'Gri', color: '#C0C0C0' },
    { id: 'gray', label: 'Gri e errët', color: '#808080' },
    { id: 'red', label: 'E kuqe', color: '#FF0000' },
    { id: 'blue', label: 'Blu', color: '#0000FF' },
    { id: 'green', label: 'Gjelbër', color: '#00FF00' },
    { id: 'yellow', label: 'Ver dh', color: '#FFFF00' },
    { id: 'brown', label: 'Kafe', color: '#8B4513' },
    { id: 'beige', label: 'Bezh', color: '#F5F5DC' },
];

// Features
const FEATURES = [
    { id: 'bluetooth', label: 'Bluetooth', icon: '📱' },
    { id: 'navigation', label: 'Navigacion', icon: '🗺️' },
    { id: 'parking-sensors', label: 'Sensor parkimi', icon: '📡' },
    { id: 'rear-camera', label: 'Kamera mbrapa', icon: '📹' },
    { id: 'heated-seats', label: 'Vende ngrohëse', icon: '🔥' },
    { id: 'sunroof', label: 'Çati dielli', icon: '☀️' },
    { id: 'leather', label: 'Lëkurë', icon: '🪑' },
    { id: 'cruise-control', label: 'Cruise control', icon: '🎯' },
    { id: 'lane-assist', label: 'Lane assist', icon: '🛣️' },
    { id: 'apple-carplay', label: 'Apple CarPlay', icon: '📱' },
    { id: 'android-auto', label: 'Android Auto', icon: '🤖' },
    { id: 'keyless', label: 'Pa çelës', icon: '🔑' },
];

export default function FilterSidebar({ onFilterChange, className = '' }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, setIsPending] = useState(false);
    const updateTimeoutRef = useRef<NodeJS.Timeout>();
    const lastUpdateRef = useRef<string>('');

    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [fuelTypes, setFuelTypes] = useState<string[]>([]);
    const [transmissions, setTransmissions] = useState<string[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'quick' | 'detailed'>('quick');

    // Fix useState initialization - add proper initial values
    const [selectedMakes, setSelectedMakes] = useState<string[]>(() =>
        searchParams.get('make')?.split(',').filter(Boolean) || []
    );

    const [selectedModel, setSelectedModel] = useState<string>(
        searchParams.get('model') || ''
    );

    const [selectedFuel, setSelectedFuel] = useState<string[]>(() =>
        searchParams.get('fuelType')?.split(',').filter(Boolean) || []
    );

    const [selectedTransmission, setSelectedTransmission] = useState<string[]>(() =>
        searchParams.get('transmission')?.split(',').filter(Boolean) || []
    );

    const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>(() =>
        searchParams.get('bodyType')?.split(',').filter(Boolean) || []
    );

    const [selectedColors, setSelectedColors] = useState<string[]>(() =>
        searchParams.get('color')?.split(',').filter(Boolean) || []
    );

    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() =>
        searchParams.get('features')?.split(',').filter(Boolean) || []
    );

    // Fix number state with proper typing
    const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
        min: searchParams.get('minPrice') || '',
        max: searchParams.get('maxPrice') || ''
    });

    const [yearRange, setYearRange] = useState<{ min: string; max: string }>({
        min: searchParams.get('minYear') || '',
        max: searchParams.get('maxYear') || ''
    });

    const [mileageRange, setMileageRange] = useState<{ min: string; max: string }>({
        min: searchParams.get('minMileage') || '',
        max: searchParams.get('maxMileage') || ''
    });

    const [engineSize, setEngineSize] = useState<{ min: string; max: string }>({
        min: searchParams.get('minEngine') || '',
        max: searchParams.get('maxEngine') || ''
    });

    const [powerRange, setPowerRange] = useState<{ min: string; max: string }>({
        min: searchParams.get('minPower') || '',
        max: searchParams.get('maxPower') || ''
    });

    // Load filter data
    useEffect(() => {
        loadFilterData();
    }, []);

    // Load models when makes change
    useEffect(() => {
        if (selectedMakes.length === 1) {
            loadModelsForMake(selectedMakes[0]);
        } else {
            setModels([]);
        }
    }, [selectedMakes]);

    const loadFilterData = async () => {
        const data = await fetchFilterData();
        if (data) {
            setMakes(data.makes || []);
            setFuelTypes(data.fuelTypes || []);
            setTransmissions(data.transmissions || []);
            setYears(data.years || []);
        }
        setLoading(false);
    };

    const loadModelsForMake = async (make: string) => {
        try {
            const data = await fetchFilterData();
            if (data?.modelsByMake?.[make]) {
                setModels(data.modelsByMake[make]);
            } else {
                setModels([]);
            }
        } catch (error) {
            console.error('Error loading models:', error);
            setModels([]);
        }
    };

    // Build current filter state as string for comparison
    const getFilterString = useCallback(() => {
        const filters = {
            makes: [...selectedMakes].sort().join(','),
            model: selectedModel,
            fuel: [...selectedFuel].sort().join(','),
            transmission: [...selectedTransmission].sort().join(','),
            bodyTypes: [...selectedBodyTypes].sort().join(','),
            colors: [...selectedColors].sort().join(','),
            features: [...selectedFeatures].sort().join(','),
            priceMin: priceRange.min,
            priceMax: priceRange.max,
            yearMin: yearRange.min,
            yearMax: yearRange.max,
            mileageMin: mileageRange.min,
            mileageMax: mileageRange.max,
            engineMin: engineSize.min,
            engineMax: engineSize.max,
            powerMin: powerRange.min,
            powerMax: powerRange.max
        };
        return JSON.stringify(filters);
    }, [selectedMakes, selectedModel, selectedFuel, selectedTransmission, selectedBodyTypes, selectedColors, selectedFeatures, priceRange, yearRange, mileageRange, engineSize, powerRange]);

    // Update URL only when filters actually change
    const updateURL = useCallback(() => {
        const currentFilterString = getFilterString();

        if (currentFilterString === lastUpdateRef.current) return;

        if (updateTimeoutRef.current) {
            window.clearTimeout(updateTimeoutRef.current);
        }

        setIsPending(true);
        lastUpdateRef.current = currentFilterString;

        updateTimeoutRef.current = window.setTimeout(() => {
            const params = new URLSearchParams();

            const searchQuery = searchParams.get('search');
            if (searchQuery) params.set('search', searchQuery);

            if (selectedMakes.length > 0) params.set('make', selectedMakes.join(','));
            if (selectedModel) params.set('model', selectedModel);
            if (selectedFuel.length > 0) params.set('fuelType', selectedFuel.join(','));
            if (selectedTransmission.length > 0) params.set('transmission', selectedTransmission.join(','));
            if (selectedBodyTypes.length > 0) params.set('bodyType', selectedBodyTypes.join(','));
            if (selectedColors.length > 0) params.set('color', selectedColors.join(','));
            if (selectedFeatures.length > 0) params.set('features', selectedFeatures.join(','));

            if (priceRange.min) params.set('minPrice', priceRange.min);
            if (priceRange.max) params.set('maxPrice', priceRange.max);
            if (yearRange.min) params.set('minYear', yearRange.min);
            if (yearRange.max) params.set('maxYear', yearRange.max);
            if (mileageRange.min) params.set('minMileage', mileageRange.min);
            if (mileageRange.max) params.set('maxMileage', mileageRange.max);
            if (engineSize.min) params.set('minEngine', engineSize.min);
            if (engineSize.max) params.set('maxEngine', engineSize.max);
            if (powerRange.min) params.set('minPower', powerRange.min);
            if (powerRange.max) params.set('maxPower', powerRange.max);

            const sort = searchParams.get('sort');
            if (sort) params.set('sort', sort);

            params.set('page', '1');

            router.push(`/cars?${params.toString()}`, { scroll: false });

            if (onFilterChange) {
                onFilterChange(Object.fromEntries(params));
            }

            setIsPending(false);
            updateTimeoutRef.current = undefined;
        }, 600);
    }, [selectedMakes, selectedModel, selectedFuel, selectedTransmission, selectedBodyTypes, selectedColors, selectedFeatures, priceRange, yearRange, mileageRange, engineSize, powerRange, searchParams, router, onFilterChange, getFilterString]);

    // Trigger update when filters change
    useEffect(() => {
        updateURL();
        return () => {
            if (updateTimeoutRef.current) {
                window.clearTimeout(updateTimeoutRef.current);
            }
        };
    }, [updateURL]);

    const toggleMake = (make: string) => {
        setSelectedMakes(prev =>
            prev.includes(make)
                ? prev.filter(m => m !== make)
                : [...prev, make]
        );
        setSelectedModel('');
    };

    const toggleFuel = (fuel: string) => {
        setSelectedFuel(prev =>
            prev.includes(fuel)
                ? prev.filter(f => f !== fuel)
                : [...prev, fuel]
        );
    };

    const toggleTransmission = (trans: string) => {
        setSelectedTransmission(prev =>
            prev.includes(trans)
                ? prev.filter(t => t !== trans)
                : [...prev, trans]
        );
    };

    const toggleBodyType = (type: string) => {
        setSelectedBodyTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const toggleColor = (color: string) => {
        setSelectedColors(prev =>
            prev.includes(color)
                ? prev.filter(c => c !== color)
                : [...prev, color]
        );
    };

    const toggleFeature = (feature: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        );
    };

    const applyQuickFilter = (filterData: any) => {
        if (filterData.make) {
            setSelectedMakes(filterData.make.split(','));
        }
        if (filterData.fuelType) {
            setSelectedFuel([filterData.fuelType]);
        }
        if (filterData.bodyType) {
            setSelectedBodyTypes([filterData.bodyType]);
        }
        if (filterData.maxPrice) {
            setPriceRange({ min: '', max: filterData.maxPrice.toString() });
        }
        if (filterData.minYear) {
            setYearRange({ min: filterData.minYear.toString(), max: '' });
        }
        setSelectedModel('');
    };

    const clearFilters = () => {
        setSelectedMakes([]);
        setSelectedModel('');
        setSelectedFuel([]);
        setSelectedTransmission([]);
        setSelectedBodyTypes([]);
        setSelectedColors([]);
        setSelectedFeatures([]);
        setPriceRange({ min: '', max: '' });
        setYearRange({ min: '', max: '' });
        setMileageRange({ min: '', max: '' });
        setEngineSize({ min: '', max: '' });
        setPowerRange({ min: '', max: '' });
    };

    const getActiveFilterCount = () => {
        let count = 0;
        count += selectedMakes.length;
        if (selectedModel) count++;
        count += selectedFuel.length;
        count += selectedTransmission.length;
        count += selectedBodyTypes.length;
        count += selectedColors.length;
        count += selectedFeatures.length;
        if (priceRange.min || priceRange.max) count++;
        if (yearRange.min || yearRange.max) count++;
        if (mileageRange.min || mileageRange.max) count++;
        if (engineSize.min || engineSize.max) count++;
        if (powerRange.min || powerRange.max) count++;
        return count;
    };

    const filteredMakes = useMemo(() => {
        return makes
            .filter(make => make.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort();
    }, [makes, searchTerm]);

    if (loading) {
        return (
            <div className="bg-surface rounded-2xl shadow-lg p-6 border border-theme">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-tertiary rounded-xl w-2/3"></div>
                    <div className="h-12 bg-tertiary rounded-xl"></div>
                    <div className="h-12 bg-tertiary rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-surface rounded-2xl shadow-lg border border-theme overflow-hidden sticky top-24 ${className}`}>
            {/* Header */}
            <div className="bg-ferrari-red p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter size={18} />
                        <h3 className="font-semibold">Filtro makina</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPending && (
                            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
                                <Loader2 size={10} className="animate-spin" />
                                <span>Duke aplikuar...</span>
                            </div>
                        )}
                        {getActiveFilterCount() > 0 && (
                            <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                                {getActiveFilterCount()} aktive
                            </span>
                        )}
                        <button
                            onClick={clearFilters}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition"
                            title="Pastro të gjitha"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-theme">
                <button
                    onClick={() => setActiveTab('quick')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'quick'
                        ? 'text-ferrari-red'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-center gap-1">
                        <Zap size={14} />
                        <span>Filtro shpejt</span>
                    </div>
                    {activeTab === 'quick' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ferrari-red" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('detailed')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'detailed'
                        ? 'text-ferrari-red'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-center gap-1">
                        <Sliders size={14} />
                        <span>Detajet</span>
                    </div>
                    {activeTab === 'detailed' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ferrari-red" />
                    )}
                </button>
            </div>

            <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin">
                {/* QUICK FILTERS TAB */}
                {activeTab === 'quick' && (
                    <div className="space-y-6">
                        {/* Quick Filter Pills */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Filtro shpejt</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_FILTERS.map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => applyQuickFilter(filter.filter)}
                                        className="px-3 py-1.5 bg-secondary hover:bg-ferrari-red hover:text-white rounded-full text-xs font-medium transition-all flex items-center gap-1 border border-theme"
                                    >
                                        <span>{filter.icon}</span>
                                        <span>{filter.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Popular Brands */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Star size={12} className="text-ferrari-red" />
                                Markat popullore
                            </h4>
                            <div className="grid grid-cols-2 gap-1.5">
                                {makes.slice(0, 10).map((make) => (
                                    <button
                                        key={make}
                                        onClick={() => toggleMake(make)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${selectedMakes.includes(make)
                                            ? 'bg-ferrari-red text-white border-ferrari-red'
                                            : 'bg-secondary text-gray-700 hover:bg-tertiary border-theme'
                                            }`}
                                    >
                                        <span>{make}</span>
                                        {selectedMakes.includes(make) && <Check size={12} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Ranges */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Euro size={12} className="text-ferrari-red" />
                                Çmimi
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {PRICE_RANGES.map((range) => {
                                    const isActive = priceRange.min === range.min.toString() && priceRange.max === range.max.toString();
                                    return (
                                        <button
                                            key={range.id}
                                            onClick={() => setPriceRange(isActive ? { min: '', max: '' } : { min: range.min.toString(), max: range.max.toString() })}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${isActive
                                                ? 'bg-ferrari-red text-white'
                                                : 'bg-secondary text-gray-700 hover:bg-tertiary'
                                                }`}
                                        >
                                            <span>{range.icon}</span>
                                            <span>{range.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Year Ranges */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Calendar size={12} className="text-ferrari-red" />
                                Viti
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {YEAR_RANGES.map((range) => {
                                    const isActive = yearRange.min === range.min.toString() && yearRange.max === range.max.toString();
                                    return (
                                        <button
                                            key={range.id}
                                            onClick={() => setYearRange(isActive ? { min: '', max: '' } : { min: range.min.toString(), max: range.max.toString() })}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${isActive
                                                ? 'bg-ferrari-red text-white'
                                                : 'bg-secondary text-gray-700 hover:bg-tertiary'
                                                }`}
                                        >
                                            <span>{range.icon}</span>
                                            <span>{range.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Fuel Type */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Fuel size={12} className="text-ferrari-red" />
                                Karburanti
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {fuelTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => toggleFuel(type)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedFuel.includes(type)
                                            ? 'bg-ferrari-red text-white'
                                            : 'bg-secondary text-gray-700 hover:bg-tertiary'
                                            }`}
                                    >
                                        {type === 'Diesel' ? 'Naftë' :
                                            type === 'Gasoline' ? 'Benzinë' :
                                                type === 'Electric' ? 'Elektrik' :
                                                    type === 'Hybrid' ? 'Hibrid' : type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Transmission */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Transmisioni</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {transmissions.map((trans) => (
                                    <button
                                        key={trans}
                                        onClick={() => toggleTransmission(trans)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTransmission.includes(trans)
                                            ? 'bg-ferrari-red text-white'
                                            : 'bg-secondary text-gray-700 hover:bg-tertiary'
                                            }`}
                                    >
                                        {trans === 'Automatic' ? 'Automatik' : trans === 'Manual' ? 'Manuel' : trans}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Model selection - only show if a make is selected */}
                        {selectedMakes.length === 1 && models.length > 0 && (
                            <div>
                                <h4 className="text-xs font-medium text-gray-500 mb-2">Modeli</h4>
                                <select
                                    className="w-full px-3 py-2 bg-secondary border border-theme rounded-lg text-sm focus:outline-none focus:border-ferrari-red"
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                >
                                    <option value="">Të gjitha modelet</option>
                                    {models.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {/* DETAILED FILTERS TAB */}
                {activeTab === 'detailed' && (
                    <div className="space-y-5">
                        {/* Search makes */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Kërko markën</h4>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="P.sh. BMW, Audi..."
                                    className="w-full pl-8 pr-3 py-2 bg-secondary border border-theme rounded-lg text-sm focus:outline-none focus:border-ferrari-red"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                                {filteredMakes.map((make) => (
                                    <button
                                        key={make}
                                        onClick={() => toggleMake(make)}
                                        className="w-full px-3 py-1.5 rounded-lg text-sm flex items-center justify-between hover:bg-secondary"
                                    >
                                        <span>{make}</span>
                                        {selectedMakes.includes(make) && (
                                            <Check size={14} className="text-ferrari-red" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Body Type */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Car size={12} className="text-ferrari-red" />
                                Tipi i karrocerisë
                            </h4>
                            <div className="grid grid-cols-2 gap-1.5">
                                {BODY_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => toggleBodyType(type.id)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${selectedBodyTypes.includes(type.id)
                                            ? 'bg-ferrari-red text-white'
                                            : 'bg-secondary text-gray-700 hover:bg-tertiary'
                                            }`}
                                    >
                                        <span>{type.icon}</span>
                                        <span className="truncate">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Colors */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Ngjyra</h4>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => toggleColor(color.id)}
                                        className="relative group"
                                        title={color.label}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(color.id)
                                                ? 'border-ferrari-red scale-110'
                                                : 'border-transparent group-hover:border-gray-300'
                                                }`}
                                            style={{ backgroundColor: color.color }}
                                        />
                                        {selectedColors.includes(color.id) && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-ferrari-red rounded-full flex items-center justify-center">
                                                <Check size={8} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mileage Ranges */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Gauge size={12} className="text-ferrari-red" />
                                Kilometrazha
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {MILEAGE_RANGES.map((range) => {
                                    const isActive = mileageRange.min === range.min.toString() && mileageRange.max === range.max.toString();
                                    return (
                                        <button
                                            key={range.id}
                                            onClick={() => setMileageRange(isActive ? { min: '', max: '' } : { min: range.min.toString(), max: range.max.toString() })}
                                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${isActive
                                                ? 'bg-ferrari-red text-white'
                                                : 'bg-secondary text-gray-700 hover:bg-tertiary'
                                                }`}
                                        >
                                            <span>{range.icon}</span>
                                            <span>{range.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <input
                                    type="number"
                                    placeholder="Min km"
                                    className="w-full px-2 py-1 bg-secondary border border-theme rounded-lg text-xs"
                                    value={mileageRange.min}
                                    onChange={(e) => setMileageRange({ ...mileageRange, min: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max km"
                                    className="w-full px-2 py-1 bg-secondary border border-theme rounded-lg text-xs"
                                    value={mileageRange.max}
                                    onChange={(e) => setMileageRange({ ...mileageRange, max: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Engine Size */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Cpu size={12} className="text-ferrari-red" />
                                Motorri
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {ENGINE_SIZES.map((range) => {
                                    const isActive = engineSize.min === range.min.toString() && engineSize.max === range.max.toString();
                                    return (
                                        <button
                                            key={range.id}
                                            onClick={() => setEngineSize(isActive ? { min: '', max: '' } : { min: range.min.toString(), max: range.max.toString() })}
                                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${isActive
                                                ? 'bg-ferrari-red text-white'
                                                : 'bg-secondary text-gray-700 hover:bg-tertiary'
                                                }`}
                                        >
                                            <span>{range.icon}</span>
                                            <span>{range.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Power */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Wind size={12} className="text-ferrari-red" />
                                Fuqia (HP)
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {POWER_RANGES.map((range) => {
                                    const isActive = powerRange.min === range.min.toString() && powerRange.max === range.max.toString();
                                    return (
                                        <button
                                            key={range.id}
                                            onClick={() => setPowerRange(isActive ? { min: '', max: '' } : { min: range.min.toString(), max: range.max.toString() })}
                                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${isActive
                                                ? 'bg-ferrari-red text-white'
                                                : 'bg-secondary text-gray-700 hover:bg-tertiary'
                                                }`}
                                        >
                                            <span>{range.icon}</span>
                                            <span>{range.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Pajisjet</h4>
                            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                                {FEATURES.map((feature) => (
                                    <button
                                        key={feature.id}
                                        onClick={() => toggleFeature(feature.id)}
                                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${selectedFeatures.includes(feature.id)
                                            ? 'bg-ferrari-red text-white'
                                            : 'bg-secondary text-gray-700 hover:bg-tertiary'
                                            }`}
                                    >
                                        <span>{feature.icon}</span>
                                        <span className="truncate">{feature.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Active Filters Summary */}
            {getActiveFilterCount() > 0 && (
                <div className="p-3 border-t border-theme bg-secondary/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Filtrat aktive:</span>
                        <button
                            onClick={clearFilters}
                            className="text-xs text-ferrari-red hover:underline flex items-center gap-0.5"
                        >
                            <XCircle size={12} />
                            <span>Pastro të gjitha</span>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-thin">
                        {selectedMakes.slice(0, 3).map(make => (
                            <span key={make} className="inline-flex items-center gap-1 px-2 py-0.5 bg-ferrari-red/10 text-ferrari-red rounded-full text-xs">
                                {make}
                                <button onClick={() => toggleMake(make)} className="hover:text-ferrari-dark">
                                    <X size={10} />
                                </button>
                            </span>
                        ))}
                        {selectedMakes.length > 3 && (
                            <span className="px-2 py-0.5 bg-tertiary text-gray-600 rounded-full text-xs">
                                +{selectedMakes.length - 3}
                            </span>
                        )}
                        {selectedFuel.map(fuel => (
                            <span key={fuel} className="inline-flex items-center gap-1 px-2 py-0.5 bg-ferrari-red/10 text-ferrari-red rounded-full text-xs">
                                {fuel === 'Diesel' ? 'Naftë' : fuel === 'Gasoline' ? 'Benzinë' : fuel}
                                <button onClick={() => toggleFuel(fuel)}>
                                    <X size={10} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}