// app/cars/CarsContent.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FilterSidebar from '@/components/cars/FilterSidebar';
import CarGrid from './CarGrid';
import { SlidersHorizontal, Search, XCircle } from 'lucide-react';

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
                    {/* Sort Bar */}
                    <div className="bg-surface rounded-xl shadow-sm border border-medium p-4 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-secondary">
                                    Filtro sipas:
                                </span>
                                {getActiveFilterCount() > 0 && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="text-xs text-muted hover:text-ferrari-red flex items-center gap-1"
                                    >
                                        <XCircle size={12} />
                                        <span>Pastro filtrat</span>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-xs text-muted whitespace-nowrap">Rendit sipas:</span>
                                <select
                                    className="flex-1 sm:w-48 px-3 py-1.5 bg-surface-2 border border-medium rounded-lg text-sm focus:outline-none focus:border-ferrari-red text-primary"
                                    value={searchParams.get('sort') || 'price_asc'}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                >
                                    <option value="price_asc">Çmimi: Nga më i ulëti</option>
                                    <option value="price_desc">Çmimi: Nga më i larti</option>
                                    <option value="year_desc">Viti: Më të rijtë</option>
                                    <option value="mileage_asc">Kilometrazha: Më e ulët</option>
                                </select>
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