// app/cars/CarsContent.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FilterSidebar from '@/components/cars/FilterSidebar';
import CarGrid from './CarGrid';
import { SlidersHorizontal, Search, XCircle, ChevronDown } from 'lucide-react';

export default function CarsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const searchQuery = searchParams.get('search') || '';
    const getActiveFilterCount = () => {
        const params = new URLSearchParams(searchParams);
        let count = 0;

        if (params.get('make')) count += params.get('make')?.split(',').length || 0;
        if (params.get('model')) count++;
        if (params.get('fuelType')) count += params.get('fuelType')?.split(',').length || 0;
        if (params.get('transmission')) count += params.get('transmission')?.split(',').length || 0;
        if (params.get('minPrice') || params.get('maxPrice')) count++;
        if (params.get('minYear') || params.get('maxYear')) count++;
        if (params.get('minMileage') || params.get('maxMileage')) count++;

        return count;
    };

    const handleSortChange = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);
        params.set('page', '1');
        router.push(`/cars?${params.toString()}`);
    };

    const handleClearFilters = () => {
        router.push('/cars');
    };

    const handleClearSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('search');
        params.set('page', '1');
        router.push(`/cars?${params.toString()}`);
    };

    return (
        <div className="container-custom py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Të gjitha makinat</h1>
                <p className="text-secondary">
                    Makina të gatshme për import nga Korea
                    {searchQuery && ` për "${searchQuery}"`}
                </p>
            </div>

            {/* Search Query Display */}
            {searchQuery && (
                <div className="bg-ferrari-red/10 p-4 rounded-lg mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <Search size={20} className="text-ferrari-red mr-2" />
                        <span className="text-secondary">
                            Duke kërkuar: <strong>"{searchQuery}"</strong>
                        </span>
                    </div>
                    <button
                        onClick={handleClearSearch}
                        className="text-sm text-ferrari-red hover:underline"
                    >
                        Pastro kërkimin
                    </button>
                </div>
            )}

            {/* Mobile Filter Button */}
            <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden w-full mb-4 btn-secondary flex items-center justify-center"
            >
                <SlidersHorizontal size={18} className="mr-2" />
                Filtro makina
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar - WON'T re-render when URL changes */}
                <div className={`lg:w-1/5 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
                    <FilterSidebar />
                </div>

                {/* Main Content - WILL re-render when URL changes */}
                <div className="lg:w-4/5">
                    {/* Sort Bar - Enhanced with more options */}
                    <div className="bg-surface rounded-xl shadow-sm border border-medium p-4 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-muted">
                                    <span className="text-sm">Rendit sipas:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {searchParams.get('fuelType') && (
                                        <span className="bg-surface-2 text-secondary text-xs px-3 py-1.5 rounded-full border border-medium flex items-center gap-1">
                                            <span>⛽</span>
                                            {searchParams.get('fuelType') === 'Diesel' ? 'Naftë' :
                                                searchParams.get('fuelType') === 'Gasoline' ? 'Benzinë' :
                                                    searchParams.get('fuelType')}
                                        </span>
                                    )}
                                    {searchParams.get('transmission') && (
                                        <span className="bg-surface-2 text-secondary text-xs px-3 py-1.5 rounded-full border border-medium flex items-center gap-1">
                                            <span>⚙️</span>
                                            {searchParams.get('transmission') === 'Automatic' ? 'Automatik' : 'Manuel'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <select
                                        className="w-full appearance-none px-4 py-2.5 bg-surface-2 border border-medium rounded-lg text-sm 
                             focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/50 
                             text-primary cursor-pointer pr-10"
                                        value={searchParams.get('sort') || 'recommended'}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                    >
                                        <optgroup label="✨ Rekomanduar">
                                            <option value="recommended" className="bg-surface">Më të përshtatshmet</option>
                                            <option value="newest" className="bg-surface">Më të rejat</option>
                                            <option value="popular" className="bg-surface">Më të kërkuarat</option>
                                        </optgroup>
                                        <optgroup label="💰 Çmimi">
                                            <option value="price_asc" className="bg-surface">Nga më i ulëti</option>
                                            <option value="price_desc" className="bg-surface">Nga më i larti</option>
                                        </optgroup>
                                        <optgroup label="📅 Viti">
                                            <option value="year_desc" className="bg-surface">Më të rijtë</option>
                                            <option value="year_asc" className="bg-surface">Më të vjetrit</option>
                                        </optgroup>
                                        <optgroup label="🛣️ Kilometrazha">
                                            <option value="mileage_asc" className="bg-surface">Më e ulët</option>
                                            <option value="mileage_desc" className="bg-surface">Më e lartë</option>
                                        </optgroup>
                                        <optgroup label="⚡ Performanca">
                                            <option value="power_desc" className="bg-surface">Fuqia më e lartë</option>
                                            <option value="engine_desc" className="bg-surface">Motorri më i madh</option>
                                        </optgroup>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Car Grid - This component handles its own loading and data fetching */}
                    <CarGrid />
                </div>
            </div>
        </div>
    );
}