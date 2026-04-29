// components/home/FeaturedCars.tsx
'use client';

import { useState, useEffect } from 'react';
import CarCard from '@/components/cars/CarCard';
import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { AlertCircle } from 'lucide-react';
import { fetchCars } from '@/lib/api';
import { type Car } from '@/lib/api';

// Define the manufacturers we want to show (limited to reduce API calls)
const FEATURED_MANUFACTURERS = [
    { id: 147, name: 'Volkswagen' },
    { id: 9, name: 'Audi' },
    { id: 16, name: 'BMW' },
    { id: 140, name: 'Mercedes-Benz' },
];

interface FeaturedCarsProps {
    limit?: number;
}

export default function FeaturedCars({ limit = 2 }: FeaturedCarsProps) {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeaturedCars = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch all manufacturers in parallel with timeout
                const fetchPromises = FEATURED_MANUFACTURERS.map(async (manufacturer) => {
                    try {
                        // Add timeout to each fetch
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 8000);

                        const response = await fetch(
                            `/api/proxy/cars?manufacturer_id=${manufacturer.id}&per_page=${limit}&buy_now_price_from=10000&buy_now_price_to=50000&year_from=2015&order_by=year_desc`,
                            { signal: controller.signal }
                        );

                        clearTimeout(timeoutId);

                        if (!response.ok) {
                            console.warn(`Failed to fetch ${manufacturer.name}: ${response.status}`);
                            return [];
                        }

                        const data = await response.json();
                        return data.data || [];
                    } catch (err) {
                        console.warn(`Error fetching ${manufacturer.name}:`, err);
                        return [];
                    }
                });

                const results = await Promise.all(fetchPromises);
                const allCars = results.flat();

                // Deduplicate by ID and limit total
                const uniqueCars = Array.from(
                    new Map(allCars.map(car => [car.id, car])).values()
                );

                setCars(uniqueCars.slice(0, 6));
            } catch (err) {
                console.error('Error fetching featured cars:', err);
                setError('Nuk mund të ngarkohen makinat e rekomanduara');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedCars();
    }, [limit]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <CarCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <p className="text-secondary">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                    Provo përsëri
                </button>
            </div>
        );
    }

    if (cars.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-secondary">Nuk ka makina të rekomanduara për momentin.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
                <CarCard key={car.id} car={car} />
            ))}
        </div>
    );
}