'use client';

import { useEffect, useState } from 'react';
import { fetchCars } from '@/lib/api';
import CarCard from './CarCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SimilarCarsProps {
    currentCarId: number;
    make: string;
    model: string;
    price: number;
}

export default function SimilarCars({ currentCarId, make, model, price }: SimilarCarsProps) {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSimilarCars();
    }, []);

    const loadSimilarCars = async () => {
        const data = await fetchCars({
            make,
            limit: 6,
            page: 1
        });

        if (data?.cars) {
            // Filter out current car
            const filtered = data.cars.filter((car: any) => car.id !== currentCarId);
            setCars(filtered.slice(0, 4));
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6">Makina të ngjashme</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-tertiary h-48 rounded-t-lg"></div>
                            <div className="bg-surface p-4 rounded-b-lg">
                                <div className="h-4 bg-tertiary rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-tertiary rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (cars.length === 0) return null;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Makina të ngjashme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cars.map((car: any) => (
                    <CarCard key={car.id} car={car} />
                ))}
            </div>
        </div>
    );
}