// app/saved/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSavedCars } from '@/hooks/useSavedCars';
import { fetchCarDetails } from '@/lib/api';
import CarCard from '@/components/cars/CarCard';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { Heart, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function SavedPage() {
    const { data: session, status } = useSession();
    const { savedCars, loading, removeSavedCar } = useSavedCars();
    const [carDetails, setCarDetails] = useState<Map<number, any>>(new Map());
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [isRemoving, setIsRemoving] = useState<number | null>(null);

    // Fetch car details for saved cars
    useEffect(() => {
        const loadDetails = async () => {
            if (savedCars.length === 0) {
                setLoadingDetails(false);
                return;
            }

            setLoadingDetails(true);
            const detailsMap = new Map();

            try {
                await Promise.all(
                    savedCars.map(async (saved) => {
                        if (!detailsMap.has(saved.car_id)) {
                            const car = await fetchCarDetails(saved.car_id.toString());
                            if (car) {
                                detailsMap.set(saved.car_id, car);
                            }
                        }
                    })
                );

                setCarDetails(detailsMap);
            } catch (error) {
                console.error('Error fetching car details:', error);
            } finally {
                setLoadingDetails(false);
            }
        };

        if (!loading) {
            loadDetails();
        }
    }, [savedCars, loading]);

    const handleRemove = async (carId: number) => {
        setIsRemoving(carId);
        await removeSavedCar(carId);

        // Update local state optimistically
        setCarDetails(prev => {
            const newMap = new Map(prev);
            newMap.delete(carId);
            return newMap;
        });

        setIsRemoving(null);
    };

    // Show loading state while either saved cars or details are loading
    if (status === 'loading' || loading || loadingDetails) {
        return (
            <div className="container-custom py-8">
                <div className="h-8 bg-surface-2 rounded w-64 mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(Math.max(4, savedCars.length || 4))].map((_, i) => (
                        <LoadingSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="container-custom py-12">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-surface p-8 rounded-lg shadow-md border border-medium">
                        <div className="w-20 h-20 bg-ferrari-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="text-ferrari-red" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-primary mb-2">Makinat e ruajtura</h1>
                        <p className="text-secondary mb-6">
                            Hyni në llogarinë tuaj për të parë makinat që keni ruajtur.
                        </p>
                        <Link href="/auth/signin" className="btn-primary inline-flex items-center">
                            <LogIn size={18} className="mr-2" />
                            Hyr në llogari
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (savedCars.length === 0) {
        return (
            <EmptyState
                type="saved"
                message="Filloni duke ruajtur makina që ju pëlqejnë dhe ato do të shfaqen këtu."
            />
        );
    }

    return (
        <div className="container-custom py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">Makinat e ruajtura</h1>
                <p className="text-secondary">
                    {savedCars.length} {savedCars.length === 1 ? 'makinë' : 'makina'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedCars.map((saved) => {
                    const car = carDetails.get(saved.car_id);
                    if (!car) return <LoadingSkeleton key={saved.id} />;

                    return (
                        <div key={saved.id} className="relative">
                            <CarCard car={car} />
                            <button
                                onClick={() => handleRemove(saved.car_id)}
                                disabled={isRemoving === saved.car_id}
                                className="absolute top-3 right-3 z-10 p-2 bg-surface rounded-full shadow-md hover:bg-surface-2 transition border border-medium disabled:opacity-50"
                                title="Hiq nga të ruajturat"
                            >
                                <Heart size={18} className="fill-ferrari-red text-ferrari-red" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}