// components/search/SearchBar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchFilterData } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('search') || '');
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [selectedMake, setSelectedMake] = useState(searchParams.get('make') || '');
    const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '');
    const [yearFrom, setYearFrom] = useState(searchParams.get('minYear') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMakes();
    }, []);

    useEffect(() => {
        if (selectedMake) {
            loadModels(selectedMake);
        } else {
            setModels([]);
        }
    }, [selectedMake]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowFilters(false);
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
        if (data?.modelsByMake?.[make]) {
            setModels(data.modelsByMake[make].sort());
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (query) params.set('search', query);
        if (selectedMake) params.set('make', selectedMake);
        if (selectedModel) params.set('model', selectedModel);
        if (yearFrom) params.set('minYear', yearFrom);
        if (maxPrice) params.set('maxPrice', maxPrice);

        params.set('page', '1');
        router.push(`/cars?${params.toString()}`);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setSelectedMake('');
        setSelectedModel('');
        setYearFrom('');
        setMaxPrice('');
        setQuery('');
        router.push('/cars');
    };

    const activeFilterCount = [
        selectedMake, selectedModel, yearFrom, maxPrice
    ].filter(Boolean).length;

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Main Search Bar */}
            <div className="flex items-center gap-2">
                {/* Search Input */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Kërko markën, modelin..."
                        className="w-full pl-4 pr-10 py-2.5 bg-ferrari-dark/50 backdrop-blur-sm 
                                 border border-ferrari-red/20 rounded-xl
                                 focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/30
                                 text-white placeholder:text-white/50 transition-all"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-2.5 text-white/40 hover:text-ferrari-red transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 rounded-xl transition-all duration-200 relative
                        ${showFilters || activeFilterCount > 0
                            ? 'bg-ferrari-red text-white shadow-sm'
                            : 'bg-ferrari-dark/50 backdrop-blur-sm text-white/70 hover:text-white hover:bg-ferrari-red/20 border border-ferrari-red/20'
                        }`}
                >
                    <SlidersHorizontal size={18} />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-ferrari-red text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="px-5 py-2.5 bg-ferrari-red text-white rounded-xl hover:bg-ferrari-dark transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                >
                    <Search size={18} />
                    <span className="hidden sm:inline">Kërko</span>
                </button>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-ferrari-dark/95 backdrop-blur-xl 
                                 rounded-xl border border-ferrari-red/20 shadow-xl p-4 z-50"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Make Select */}
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">
                                    Prodhuesi
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedMake}
                                        onChange={(e) => {
                                            setSelectedMake(e.target.value);
                                            setSelectedModel('');
                                        }}
                                        className="w-full px-3 py-2 bg-ferrari-dark/50 border border-ferrari-red/20 
                                                 rounded-lg text-white text-sm
                                                 focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/30
                                                 appearance-none cursor-pointer"
                                    >
                                        <option value="">Të gjitha</option>
                                        {makes.map(make => (
                                            <option key={make} value={make}>{make}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-3 text-white/40 pointer-events-none" />
                                </div>
                            </div>

                            {/* Model Select */}
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">
                                    Modeli
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        disabled={!selectedMake}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm appearance-none cursor-pointer
                                            ${selectedMake
                                                ? 'bg-ferrari-dark/50 border-ferrari-red/20 text-white focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/30'
                                                : 'bg-ferrari-dark/20 border-ferrari-red/10 text-white/30 cursor-not-allowed'
                                            }`}
                                    >
                                        <option value="">Zgjidh fillimisht markën</option>
                                        {models.map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className={`absolute right-3 top-3 ${selectedMake ? 'text-white/40' : 'text-white/20'}`} />
                                </div>
                            </div>

                            {/* Year From */}
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">
                                    Viti nga
                                </label>
                                <div className="relative">
                                    <select
                                        value={yearFrom}
                                        onChange={(e) => setYearFrom(e.target.value)}
                                        className="w-full px-3 py-2 bg-ferrari-dark/50 border border-ferrari-red/20 
                                                 rounded-lg text-white text-sm
                                                 focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/30
                                                 appearance-none cursor-pointer"
                                    >
                                        <option value="">Çdo vit</option>
                                        {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-3 text-white/40 pointer-events-none" />
                                </div>
                            </div>

                            {/* Max Price */}
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">
                                    Çmimi deri në
                                </label>
                                <div className="relative">
                                    <select
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 bg-ferrari-dark/50 border border-ferrari-red/20 
                                                 rounded-lg text-white text-sm
                                                 focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/30
                                                 appearance-none cursor-pointer"
                                    >
                                        <option value="">Pa limit</option>
                                        <option value="5000">€5,000</option>
                                        <option value="10000">€10,000</option>
                                        <option value="15000">€15,000</option>
                                        <option value="20000">€20,000</option>
                                        <option value="25000">€25,000</option>
                                        <option value="30000">€30,000</option>
                                        <option value="40000">€40,000</option>
                                        <option value="50000">€50,000</option>
                                        <option value="75000">€75,000</option>
                                        <option value="100000">€100,000+</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-3 text-white/40 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-ferrari-red/10">
                            <button
                                onClick={clearFilters}
                                className="text-sm text-white/40 hover:text-ferrari-red transition-colors"
                            >
                                Pastro të gjitha
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="px-4 py-1.5 text-sm text-white/60 hover:text-white transition-colors"
                                >
                                    Anulo
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-1.5 bg-ferrari-red text-white rounded-lg hover:bg-ferrari-dark transition-colors text-sm"
                                >
                                    Apliko
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}