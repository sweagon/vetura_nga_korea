// app/cars/CarsContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CarGrid from './CarGrid';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Car } from '@/lib/api';
import MobileFilters from '@/components/ui/MobileFilters';
import CustomSelect from '@/components/ui/CustomSelect';

interface CarsContentProps {
    searchParams: URLSearchParams;
}

interface SortOption {
    value: string;
    label: string;
    sortFn: (a: Car, b: Car) => number;
}

export default function CarsContent({ searchParams }: CarsContentProps) {
    const router = useRouter();
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [currentSort, setCurrentSort] = useState('recommended');
    const [gridKey, setGridKey] = useState(0); // Add key to force re-render

    const searchQuery = searchParams.get('search') || '';

    // Force CarGrid to re-render when searchParams change
    useEffect(() => {
        setGridKey(prev => prev + 1);
    }, [searchParams]);

    // Sort options with client-side sorting functions
    const sortOptions: SortOption[] = [
        {
            value: 'recommended',
            label: 'Më të përshtatshmet',
            sortFn: (a, b) => 0
        },
        {
            value: 'price_asc',
            label: 'Çmimi: Nga më i ulëti',
            sortFn: (a, b) => {
                const priceA = a.lots?.[0]?.buy_now || 0;
                const priceB = b.lots?.[0]?.buy_now || 0;
                return priceA - priceB;
            }
        },
        {
            value: 'price_desc',
            label: 'Çmimi: Nga më i larti',
            sortFn: (a, b) => {
                const priceA = a.lots?.[0]?.buy_now || 0;
                const priceB = b.lots?.[0]?.buy_now || 0;
                return priceB - priceA;
            }
        },
        {
            value: 'year_desc',
            label: 'Viti: Më të rijtë',
            sortFn: (a, b) => b.year - a.year
        },
        {
            value: 'year_asc',
            label: 'Viti: Më të vjetrit',
            sortFn: (a, b) => a.year - b.year
        },
        {
            value: 'mileage_asc',
            label: 'Kilometrazha: Më e ulët',
            sortFn: (a, b) => {
                const kmA = a.lots?.[0]?.odometer?.km || 0;
                const kmB = b.lots?.[0]?.odometer?.km || 0;
                return kmA - kmB;
            }
        },
        {
            value: 'mileage_desc',
            label: 'Kilometrazha: Më e lartë',
            sortFn: (a, b) => {
                const kmA = a.lots?.[0]?.odometer?.km || 0;
                const kmB = b.lots?.[0]?.odometer?.km || 0;
                return kmB - kmA;
            }
        },
    ];

    const handleSortChange = (value: string) => {
        setCurrentSort(value);
        sessionStorage.setItem('carSortPreference', value);
    };

    const handleClearSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('search');
        params.set('page', '1');
        router.push(`/cars?${params.toString()}`);
        router.refresh();
    };

    const handleClearAllFilters = () => {
        router.push('/cars');
        router.refresh();
        setMobileFilterOpen(false);
        sessionStorage.removeItem('carSortPreference');
        setCurrentSort('recommended');
    };

    const handleRemoveFilter = (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        params.set('page', '1');
        router.push(`/cars?${params.toString()}`);
        router.refresh();
    };

    // Get active filters
    const filterKeys = ['manufacturer_id', 'model_id', 'from_year', 'to_year', 'buy_now_price_to'];
    const activeFilters = Array.from(searchParams.entries()).filter(([key]) => filterKeys.includes(key));
    const activeFilterCount = activeFilters.length;

    const filterLabels: Record<string, string> = {
        'manufacturer_id': 'Prodhuesi',
        'model_id': 'Modeli',
        'from_year': 'Viti nga',
        'to_year': 'Viti deri',
        'buy_now_price_to': 'Çmimi max',
    };

    // Prepare sort options for CustomSelect
    const sortSelectOptions = sortOptions.map(opt => ({
        value: opt.value,
        label: opt.label
    }));

    return (
        <div className="container-swiss pt-12">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    Të gjitha makinat
                </h1>
                <p className="text-sm md:text-base text-secondary">
                    {searchQuery
                        ? `Rezultatet për "${searchQuery}"`
                        : 'Makina të gatshme për import nga Korea'
                    }
                </p>
            </div>

            {/* Search Query Display */}
            {searchQuery && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-surface-2 border border-light/20 rounded-xl p-4 mb-6 flex items-center justify-between"
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <Search size={18} className="text-orange-primary shrink-0" />
                        <span className="text-sm text-secondary truncate">
                            Duke kërkuar: <span className="font-medium text-primary">"{searchQuery}"</span>
                        </span>
                    </div>
                    <button
                        onClick={handleClearSearch}
                        className="text-sm text-orange-primary hover:text-orange-dark transition-colors flex items-center gap-1 shrink-0 ml-2"
                        aria-label="Pastro kërkimin"
                    >
                        <X size={14} />
                        <span className="hidden sm:inline">Pastro</span>
                    </button>
                </motion.div>
            )}

            {/* Mobile Filter Button - Visible on all screens now since no desktop sidebar */}
            <div className="mb-4">
                <button
                    onClick={() => setMobileFilterOpen(true)}
                    className={`
                        w-full bg-surface-2 border border-light/20 rounded-xl py-3 px-4
                        flex items-center justify-center gap-2 text-sm transition-colors
                        hover:bg-surface-3 hover:text-primary
                        ${activeFilterCount > 0 ? 'border-orange-primary/30 bg-orange-5' : ''}
                    `}
                >
                    <Filter size={18} className={activeFilterCount > 0 ? 'text-orange-primary' : ''} />
                    <span className={activeFilterCount > 0 ? 'text-orange-primary font-medium' : ''}>
                        Filtro makina
                    </span>
                    {activeFilterCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-orange-primary text-white text-xs rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile Filters Modal */}
            <MobileFilters
                isOpen={mobileFilterOpen}
                onClose={() => setMobileFilterOpen(false)}
            />

            {/* Sort Bar - Using CustomSelect */}
            <div className="bg-surface-2 border border-light/20 rounded-xl p-3 md:p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-xs md:text-sm text-muted flex items-center gap-1">
                        <ArrowUpDown size={14} />
                        Rendit sipas:
                    </span>

                    <div className="w-full sm:w-56">
                        <CustomSelect
                            value={currentSort}
                            onChange={handleSortChange}
                            options={sortSelectOptions}
                            placeholder="Zgjidh renditjen"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-xs text-muted shrink-0">Filtrat aktivë:</span>
                        <div className="flex flex-wrap items-center gap-2">
                            {activeFilters.map(([key, value]) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-2 border border-light/20 rounded-lg text-xs"
                                >
                                    <span className="text-muted">{filterLabels[key]}:</span>
                                    <span className="text-primary font-medium">{value}</span>
                                    <button
                                        onClick={() => handleRemoveFilter(key)}
                                        className="ml-1 p-0.5 hover:bg-surface-3 rounded-full transition-colors"
                                        aria-label={`Hiq filtrin ${filterLabels[key]}`}
                                    >
                                        <X size={10} className="text-muted hover:text-orange-primary" />
                                    </button>
                                </span>
                            ))}
                            <button
                                onClick={handleClearAllFilters}
                                className="text-xs text-orange-primary hover:text-orange-dark transition-colors flex items-center gap-1 rounded px-2 py-1"
                                aria-label="Pastro të gjithë filtrat"
                            >
                                <X size={12} />
                                <span>Pastro të gjitha</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Car Grid with sort prop and key to force re-render */}
            <CarGrid key={gridKey} sortBy={currentSort} sortOptions={sortOptions} />
        </div>
    );
}