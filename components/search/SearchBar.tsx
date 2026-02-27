// components/search/SearchBar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchFilterData } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Simple state
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [selectedMake, setSelectedMake] = useState(searchParams.get('make') || '');
    const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '');
    const [yearFrom, setYearFrom] = useState(searchParams.get('minYear') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    // Dropdown states
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load makes on mount
    useEffect(() => {
        loadMakes();
    }, []);

    // Load models when make changes
    useEffect(() => {
        if (selectedMake) {
            loadModels(selectedMake);
        } else {
            setModels([]);
            setSelectedModel('');
        }
    }, [selectedMake]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
                setMobileFiltersOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadMakes = async () => {
        const data = await fetchFilterData();
        if (data?.makes) {
            setMakes(data.makes.sort());
        }
    };

    const loadModels = async (make: string) => {
        const data = await fetchFilterData();
        if (data?.modelsByMake?.[make] && Array.isArray(data.modelsByMake[make])) {
            setModels(data.modelsByMake[make].sort());
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (selectedMake) params.set('make', selectedMake);
        if (selectedModel) params.set('model', selectedModel);
        if (yearFrom) params.set('minYear', yearFrom);
        if (maxPrice) params.set('maxPrice', maxPrice);

        params.set('page', '1');
        router.push(`/cars?${params.toString()}`);
        setActiveDropdown(null);
        setMobileFiltersOpen(false);
    };

    const clearFilters = () => {
        setSelectedMake('');
        setSelectedModel('');
        setYearFrom('');
        setMaxPrice('');
        router.push('/cars');
        setActiveDropdown(null);
        setMobileFiltersOpen(false);
    };

    const activeFilterCount = [selectedMake, selectedModel, yearFrom, maxPrice].filter(Boolean).length;

    // Custom select trigger component
    const SelectTrigger = ({
        label,
        value,
        placeholder,
        isActive,
        onClick,
        disabled = false,
        className = ''
    }: {
        label: string;
        value: string;
        placeholder: string;
        isActive: boolean;
        onClick: () => void;
        disabled?: boolean;
        className?: string;
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`relative group flex items-center justify-between w-full px-3 py-2 text-sm transition-all duration-200
                ${disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-ferrari-red/10 cursor-pointer'
                }
                ${isActive ? 'bg-ferrari-red/20 text-white' : 'text-white/80'}
                ${className}
            `}
        >
            <span className="truncate">
                {value || <span className="text-white/50">{placeholder}</span>}
            </span>
            <ChevronDown
                size={14}
                className={`ml-1 transition-transform duration-200 flex-shrink-0
                    ${isActive ? 'rotate-180 text-ferrari-red' : 'text-white/40'}
                `}
            />
        </button>
    );

    // Mobile Filter Button
    const MobileFilterButton = () => (
        <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-ferrari-red/20 rounded-lg border border-ferrari-red/30"
        >
            <Filter size={18} className="text-ferrari-red" />
            <span className="text-sm text-white">Filtrat</span>
            {activeFilterCount > 0 && (
                <span className="bg-ferrari-red text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                </span>
            )}
        </button>
    );

    return (
        <div className="w-full" ref={dropdownRef} style={{ position: 'relative', zIndex: 9999 }}>
            {/* Desktop View - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-1 bg-ferrari-red/10 backdrop-blur-sm border border-ferrari-red/30 rounded-xl p-1 shadow-lg shadow-ferrari-red/5">
                {/* Make Select */}
                <div className="relative flex-1 min-w-[100px]">
                    <SelectTrigger
                        label="Prodhuesi"
                        value={selectedMake}
                        placeholder="Prodhuesi"
                        isActive={activeDropdown === 'make'}
                        onClick={() => setActiveDropdown(activeDropdown === 'make' ? null : 'make')}
                    />

                    <AnimatePresence>
                        {activeDropdown === 'make' && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-0 mt-1 w-64 bg-ferrari-dark/95 backdrop-blur-xl 
                                         rounded-xl border border-ferrari-red/20 shadow-2xl py-1"
                                style={{ zIndex: 10000 }}
                            >
                                <div className="max-h-60 overflow-y-auto scrollbar-thin">
                                    <button
                                        onClick={() => {
                                            setSelectedMake('');
                                            setActiveDropdown(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-ferrari-red/10 transition-colors text-white/70 hover:text-white"
                                    >
                                        Të gjitha
                                    </button>
                                    {makes.map(make => (
                                        <button
                                            key={make}
                                            onClick={() => {
                                                setSelectedMake(make);
                                                setActiveDropdown(null);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-ferrari-red/10 transition-colors
                                                ${selectedMake === make ? 'bg-ferrari-red/20 text-ferrari-red' : 'text-white/80 hover:text-white'}`}
                                        >
                                            {make}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Model Select */}
                <div className="relative flex-1 min-w-[100px]">
                    <SelectTrigger
                        label="Modeli"
                        value={selectedModel}
                        placeholder={selectedMake ? "Modeli" : "Zgjidh markën"}
                        isActive={activeDropdown === 'model'}
                        onClick={() => selectedMake && setActiveDropdown(activeDropdown === 'model' ? null : 'model')}
                        disabled={!selectedMake}
                    />

                    <AnimatePresence>
                        {activeDropdown === 'model' && selectedMake && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-0 mt-1 w-64 bg-ferrari-dark/95 backdrop-blur-xl 
                                         rounded-xl border border-ferrari-red/20 shadow-2xl py-1"
                                style={{ zIndex: 10000 }}
                            >
                                <div className="max-h-60 overflow-y-auto scrollbar-thin">
                                    <button
                                        onClick={() => {
                                            setSelectedModel('');
                                            setActiveDropdown(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-ferrari-red/10 transition-colors text-white/70 hover:text-white"
                                    >
                                        Të gjitha modelet
                                    </button>
                                    {models.map(model => (
                                        <button
                                            key={model}
                                            onClick={() => {
                                                setSelectedModel(model);
                                                setActiveDropdown(null);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-ferrari-red/10 transition-colors
                                                ${selectedModel === model ? 'bg-ferrari-red/20 text-ferrari-red' : 'text-white/80 hover:text-white'}`}
                                        >
                                            {model}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Year From */}
                <div className="relative flex-1 min-w-[90px]">
                    <SelectTrigger
                        label="Viti nga"
                        value={yearFrom}
                        placeholder="Viti nga"
                        isActive={activeDropdown === 'year'}
                        onClick={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
                    />

                    <AnimatePresence>
                        {activeDropdown === 'year' && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-0 mt-1 w-40 bg-ferrari-dark/95 backdrop-blur-xl 
                                         rounded-xl border border-ferrari-red/20 shadow-2xl py-1"
                                style={{ zIndex: 10000 }}
                            >
                                <div className="max-h-60 overflow-y-auto scrollbar-thin">
                                    <button
                                        onClick={() => {
                                            setYearFrom('');
                                            setActiveDropdown(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-ferrari-red/10 transition-colors text-white/70 hover:text-white"
                                    >
                                        Çdo vit
                                    </button>
                                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setYearFrom(year.toString());
                                                setActiveDropdown(null);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-ferrari-red/10 transition-colors
                                                ${yearFrom === year.toString() ? 'bg-ferrari-red/20 text-ferrari-red' : 'text-white/80 hover:text-white'}`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Max Price */}
                <div className="relative flex-1 min-w-[110px]">
                    <SelectTrigger
                        label="Çmimi deri"
                        value={maxPrice ? `€${parseInt(maxPrice).toLocaleString()}` : ''}
                        placeholder="Çmimi deri"
                        isActive={activeDropdown === 'price'}
                        onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                    />

                    <AnimatePresence>
                        {activeDropdown === 'price' && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-0 mt-1 w-48 bg-ferrari-dark/95 backdrop-blur-xl 
                                         rounded-xl border border-ferrari-red/20 shadow-2xl py-1"
                                style={{ zIndex: 10000 }}
                            >
                                <div className="max-h-60 overflow-y-auto scrollbar-thin">
                                    <button
                                        onClick={() => {
                                            setMaxPrice('');
                                            setActiveDropdown(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-ferrari-red/10 transition-colors text-white/70 hover:text-white"
                                    >
                                        Pa limit
                                    </button>
                                    {[
                                        { value: '5000', label: '€5,000' },
                                        { value: '10000', label: '€10,000' },
                                        { value: '15000', label: '€15,000' },
                                        { value: '20000', label: '€20,000' },
                                        { value: '25000', label: '€25,000' },
                                        { value: '30000', label: '€30,000' },
                                        { value: '40000', label: '€40,000' },
                                        { value: '50000', label: '€50,000' },
                                        { value: '75000', label: '€75,000' },
                                        { value: '100000', label: '€100,000+' },
                                    ].map(price => (
                                        <button
                                            key={price.value}
                                            onClick={() => {
                                                setMaxPrice(price.value);
                                                setActiveDropdown(null);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-ferrari-red/10 transition-colors
                                                ${maxPrice === price.value ? 'bg-ferrari-red/20 text-ferrari-red' : 'text-white/80 hover:text-white'}`}
                                        >
                                            {price.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="px-5 py-2 bg-ferrari-red text-white rounded-lg hover:bg-ferrari-dark transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-ferrari-red/25 hover:shadow-xl"
                >
                    <Search size={16} />
                    <span className="text-sm font-medium">Kërko</span>
                </button>

                {/* Clear Button - only if filters active */}
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="p-2 text-white/50 hover:text-ferrari-red transition-colors ml-1"
                        title="Pastro filtrat"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                {/* Mobile Search Row */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSearch}
                        className="flex-1 px-4 py-3 bg-ferrari-red text-white rounded-lg hover:bg-ferrari-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-ferrari-red/25"
                    >
                        <Search size={18} />
                        <span className="text-sm font-medium">Kërko</span>
                    </button>
                    <MobileFilterButton />
                </div>

                {/* Mobile Filters Dropdown */}
                <AnimatePresence>
                    {mobileFiltersOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 right-0 mt-2 p-4 bg-ferrari-dark/95 backdrop-blur-xl 
                                     rounded-xl border border-ferrari-red/20 shadow-2xl"
                            style={{ zIndex: 10000 }}
                        >
                            <div className="space-y-3">
                                {/* Mobile Make Select */}
                                <div>
                                    <label className="block text-xs text-white/50 mb-1">Prodhuesi</label>
                                    <select
                                        value={selectedMake}
                                        onChange={(e) => setSelectedMake(e.target.value)}
                                        className="w-full px-3 py-2 bg-ferrari-red/10 border border-ferrari-red/30 rounded-lg text-white text-sm"
                                    >
                                        <option value="">Të gjitha</option>
                                        {makes.map(make => (
                                            <option key={make} value={make}>{make}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mobile Model Select */}
                                <div>
                                    <label className="block text-xs text-white/50 mb-1">Modeli</label>
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        disabled={!selectedMake}
                                        className="w-full px-3 py-2 bg-ferrari-red/10 border border-ferrari-red/30 rounded-lg text-white text-sm disabled:opacity-40"
                                    >
                                        <option value="">Të gjitha modelet</option>
                                        {models.map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mobile Year Select */}
                                <div>
                                    <label className="block text-xs text-white/50 mb-1">Viti nga</label>
                                    <select
                                        value={yearFrom}
                                        onChange={(e) => setYearFrom(e.target.value)}
                                        className="w-full px-3 py-2 bg-ferrari-red/10 border border-ferrari-red/30 rounded-lg text-white text-sm"
                                    >
                                        <option value="">Çdo vit</option>
                                        {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mobile Price Select */}
                                <div>
                                    <label className="block text-xs text-white/50 mb-1">Çmimi deri</label>
                                    <select
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 bg-ferrari-red/10 border border-ferrari-red/30 rounded-lg text-white text-sm"
                                    >
                                        <option value="">Pa limit</option>
                                        {[
                                            { value: '5000', label: '€5,000' },
                                            { value: '10000', label: '€10,000' },
                                            { value: '15000', label: '€15,000' },
                                            { value: '20000', label: '€20,000' },
                                            { value: '25000', label: '€25,000' },
                                            { value: '30000', label: '€30,000' },
                                            { value: '40000', label: '€40,000' },
                                            { value: '50000', label: '€50,000' },
                                            { value: '75000', label: '€75,000' },
                                            { value: '100000', label: '€100,000+' },
                                        ].map(price => (
                                            <option key={price.value} value={price.value}>{price.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mobile Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSearch}
                                        className="flex-1 px-4 py-2 bg-ferrari-red text-white rounded-lg hover:bg-ferrari-dark transition-all text-sm font-medium"
                                    >
                                        <span>Filtro</span>
                                    </button>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 border border-ferrari-red/30 text-white/70 rounded-lg hover:bg-ferrari-red/10 transition-colors text-sm"
                                        >
                                            Pastro
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Active Filters Indicators - Mobile */}
            {activeFilterCount > 0 && (
                <div className="flex justify-center flex-wrap gap-2 mt-2 px-1 md:hidden">
                    {selectedMake && (
                        <span className="text-xs bg-ferrari-red/20 border border-ferrari-red px-2 py-1 rounded-full flex items-center gap-1">
                            {selectedMake}
                            <button onClick={() => setSelectedMake('')} className="ml-1 hover:text-white">
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {selectedModel && (
                        <span className="text-xs bg-ferrari-red/20 border border-ferrari-red px-2 py-1 rounded-full flex items-center gap-1">
                            {selectedModel}
                            <button onClick={() => setSelectedModel('')} className="ml-1 hover:text-white">
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {yearFrom && (
                        <span className="text-xs bg-ferrari-red/20 border border-ferrari-red px-2 py-1 rounded-full flex items-center gap-1">
                            {yearFrom}+
                            <button onClick={() => setYearFrom('')} className="ml-1 hover:text-white">
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {maxPrice && (
                        <span className="text-xs bg-ferrari-red/20 border border-ferrari-red px-2 py-1 rounded-full flex items-center gap-1">
                            €{parseInt(maxPrice).toLocaleString()}
                            <button onClick={() => setMaxPrice('')} className="ml-1 hover:text-white">
                                <X size={12} />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}