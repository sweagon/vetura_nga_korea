// components/cars/SimilarCars.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchCars, type Car } from '@/lib/api'; // Import Car type
import CarCard from './CarCard';
import { Loader2 } from 'lucide-react';

interface SimilarCarsProps {
    currentCarId: number | string;
    make?: string;
    model?: string;
    price?: number;
}

export default function SimilarCars({ currentCarId, make, model, price }: SimilarCarsProps) {
    const [cars, setCars] = useState<Car[]>([]); // ✅ Properly typed as Car[]
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSimilarCars = async () => {
            setLoading(true);
            try {
                const params: Record<string, any> = {
                    limit: 10,
                    sort: 'price_asc'
                };

                // Add filters based on current car
                if (make) params.make = make;
                if (model) params.model = model;

                // Price range ±20%
                if (price) {
                    params.minPrice = Math.max(0, price * 0.8).toString();
                    params.maxPrice = (price * 1.2).toString();
                }

                const data = await fetchCars(params);

                // Filter out current car and take first 4
                const filtered = data.cars.filter((car: Car) => car.id !== currentCarId);
                setCars(filtered.slice(0, 4));
            } catch (error) {
                console.error('Error loading similar cars:', error);
                setCars([]);
            } finally {
                setLoading(false);
            }
        };

        loadSimilarCars();
    }, [currentCarId, make, model, price]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-ferrari-red" />
            </div>
        );
    }

    if (cars.length === 0) {
        return null; // Don't show section if no similar cars
    }

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Makina të ngjashme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cars.map((car) => (
                    <CarCard key={car.id} car={car} />
                ))}
            </div>
        </div>
    );
}