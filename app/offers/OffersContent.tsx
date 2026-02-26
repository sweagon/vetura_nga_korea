// app/offers/OffersContent.tsx
'use client';

import { useState, useEffect } from 'react';
import CarCard from '@/components/cars/CarCard';
import { fetchCars, type Car } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function OffersContent() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOffers = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch all makes in parallel with a timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

                const [bmw, audi, mercedes, vw] = await Promise.allSettled([
                    fetchCars({ make: 'BMW', limit: 15, sort: 'price_asc', minPrice: 2000, maxPrice: 25000 }),
                    fetchCars({ make: 'Audi', limit: 15, sort: 'price_asc', minPrice: 2000, maxPrice: 25000 }),
                    fetchCars({ make: 'Mercedes-Benz', limit: 15, sort: 'price_asc', minPrice: 2000, maxPrice: 25000 }),
                    fetchCars({ make: 'Volkswagen', limit: 15, sort: 'price_asc', minPrice: 2000, maxPrice: 25000 })
                ]);

                clearTimeout(timeoutId);

                // Collect successful results
                const allCars: Car[] = [];

                if (bmw.status === 'fulfilled') allCars.push(...bmw.value.cars);
                if (audi.status === 'fulfilled') allCars.push(...audi.value.cars);
                if (mercedes.status === 'fulfilled') allCars.push(...mercedes.value.cars);
                if (vw.status === 'fulfilled') allCars.push(...vw.value.cars);

                // Remove duplicates
                const uniqueCars = Array.from(
                    new Map(allCars.map(car => [car.id, car])).values()
                );

                // Sort by price
                uniqueCars.sort((a, b) => (a.price || 0) - (b.price || 0));

                setCars(uniqueCars);

                if (uniqueCars.length === 0) {
                    setError('Nuk u gjetën makina për momentin.');
                }
            } catch (err) {
                console.error('Error loading offers:', err);
                setError('Ndodhi një gabim gjatë ngarkimit të ofertave.');
            } finally {
                setLoading(false);
            }
        };

        loadOffers();
    }, []);

    if (loading) {
        return (
            <div className="container-custom py-8">
                <div className="flex justify-center items-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-ferrari-red" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-custom py-8">
                <div className="text-center py-16 bg-surface rounded-xl border border-medium">
                    <AlertCircle className="mx-auto text-ferrari-red mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-primary mb-2">{error}</h3>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 btn-primary"
                    >
                        Provo përsëri
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <h1 className="text-3xl font-bold text-primary mb-8">Ofertat e javës</h1>

            {cars.length === 0 ? (
                <div className="text-center py-16 bg-surface rounded-xl border border-medium">
                    <h3 className="text-xl font-semibold text-primary mb-2">Nuk u gjet asnjë makinë</h3>
                    <p className="text-secondary">Provo të ndryshosh filtrat ose të kërkosh më vonë.</p>
                </div>
            ) : (
                <>
                    <p className="text-secondary mb-6">
                        Duke shfaqur {cars.length} makina nga markat gjermane
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {cars.map(car => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}