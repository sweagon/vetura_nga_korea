// app/cars/CarsContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchCars } from '@/lib/api';
import CarCard from '@/components/cars/CarCard';
import FilterSidebar from '@/components/cars/FilterSidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CarsContent() {
    const searchParams = useSearchParams();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    useEffect(() => {
        loadCars();
    }, [searchParams]);

    const loadCars = async () => {
        setLoading(true);
        try {
            const params = {
                make: searchParams.get('make') || undefined,
                model: searchParams.get('model') || undefined,
                minPrice: searchParams.get('minPrice') || undefined,
                maxPrice: searchParams.get('maxPrice') || undefined,
                minYear: searchParams.get('minYear') || undefined,
                maxYear: searchParams.get('maxYear') || undefined,
                fuelType: searchParams.get('fuelType') || undefined,
                transmission: searchParams.get('transmission') || undefined,
                sort: searchParams.get('sort') || 'price_desc',
                page: searchParams.get('page') || 1,
                limit: 12
            };

            const result = await fetchCars(params);

            console.log('Cars loaded:', result.cars.length); // Debug

            setCars(result.cars);
            setPagination(result.pagination);
        } catch (error) {
            console.error('Error loading cars:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container-custom py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-surface rounded-xl border border-medium p-4">
                            <div className="h-48 bg-surface-2 rounded-lg mb-4 animate-pulse"></div>
                            <div className="h-4 bg-surface-2 rounded w-3/4 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-surface-2 rounded w-1/2 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (cars.length === 0) {
        return (
            <div className="container-custom py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-primary mb-4">Nuk u gjet asnjë makinë</h2>
                    <p className="text-secondary mb-8">Provo të ndryshosh filtrat e kërkimit</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <div className="flex gap-8">
                {/* Sidebar */}
                <div className="hidden lg:block w-1/4">
                    <FilterSidebar />
                </div>

                {/* Main Content */}
                <div className="w-full lg:w-3/4">
                    {/* Results count */}
                    <div className="mb-4 text-secondary">
                        Duke shfaqur {cars.length} nga {pagination.total} makina
                    </div>

                    {/* Cars Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {cars.map((car) => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                            {/* Add pagination controls here */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}