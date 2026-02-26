'use client';

import { useEffect, useState } from 'react';
import { fetchCarDetails } from '@/lib/api';
import ComparisonTable from '@/components/cars/ComparisonTable';
import EmptyState from '@/components/ui/EmptyState';

// Define the complete Car interface matching the API response
interface Car {
    id: number;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    drivetrain?: string;
    displacement?: number;
    seatCount?: number;
    exteriorColor?: string;
    interiorColor?: string;
    full_name?: string;
    grade?: string;
    images?: string[];
    description?: string;
    warranty?: {
        bodyMonth?: number;
        bodyMileage?: number;
        transmissionMonth?: number;
        transmissionMileage?: number;
    };
    dealer?: {
        name?: string;
        firm?: string;
        location?: string;
        phone?: string;
    };
    sellerName?: string;
    sellerPhone?: string;
    sellerEmail?: string;
    sellerLocation?: string;
    [key: string]: any;
}

export default function ComparePage() {
    const [compareList, setCompareList] = useState<number[]>([]);
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCompareCars = async () => {
            try {
                const list = JSON.parse(localStorage.getItem('compareList') || '[]');
                setCompareList(list);

                // Fetch car details
                if (list.length > 0) {
                    const results = await Promise.all(
                        list.map((id: number) => fetchCarDetails(id.toString()))
                    );
                    // Filter out any null results and ensure they match Car interface
                    const validCars = results.filter((car): car is Car =>
                        car !== null &&
                        typeof car === 'object' &&
                        'id' in car &&
                        'make' in car &&
                        'model' in car
                    );
                    setCars(validCars);
                }
            } catch (error) {
                console.error('Error loading compare cars:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCompareCars();
    }, []);

    if (loading) {
        return (
            <div className="container-custom py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-tertiary rounded w-64 mb-8"></div>
                    <div className="h-96 bg-tertiary rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <h1 className="text-3xl font-bold mb-8">Krahasimi i makinave</h1>
            {cars.length === 0 ? (
                <EmptyState
                    type="compare"
                    message="Nuk keni zgjedhur asnjë makinë për krahasim. Shfletoni makinat dhe shtoni në krahasim."
                />
            ) : (
                <ComparisonTable cars={cars} />
            )}
        </div>
    );
}