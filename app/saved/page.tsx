'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CarCard from '@/components/cars/CarCard';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useSavedCars } from '@/hooks/useSavedCars';
import { fetchCarDetails } from '@/lib/api';
import { Heart, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function SavedPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { savedCars, loading, removeSavedCar } = useSavedCars();
    const [carDetails, setCarDetails] = useState<Map<number, any>>(new Map());
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Fetch car details for saved cars
    useEffect(() => {
        const fetchDetails = async () => {
            if (savedCars.length === 0) return;

            setLoadingDetails(true);
            const detailsMap = new Map();

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
            setLoadingDetails(false);
        };

        fetchDetails();
    }, [savedCars]);

    if (status === 'loading' || loading) {
        return (
            <div className="container-custom py-8">
                <div className="h-8 bg-tertiary rounded w-64 mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
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
                    <div className="bg-surface p-8 rounded-lg shadow-md">
                        <div className="w-20 h-20 bg-ferrari-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="text-ferrari-red" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Makinat e ruajtura</h1>
                        <p className="text-gray-600 mb-6">
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

    const hasCars = savedCars.length > 0;

    return (
        <div className="container-custom py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Makinat e ruajtura</h1>
                    <p className="text-gray-600">
                        {savedCars.length} {savedCars.length === 1 ? 'makinë e ruajtur' : 'makina të ruajtura'}
                    </p>
                </div>
            </div>

            {loadingDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <LoadingSkeleton key={i} />
                    ))}
                </div>
            ) : !hasCars ? (
                <EmptyState
                    type="saved"
                    message="Filloni duke ruajtur makina që ju pëlqejnë dhe ato do të shfaqen këtu."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {savedCars.map((saved) => {
                        const car = carDetails.get(saved.car_id);
                        if (!car) return null;

                        return (
                            <div key={saved.id} className="relative">
                                <CarCard car={car} />
                                <button
                                    onClick={() => removeSavedCar(saved.car_id)}
                                    className="absolute top-3 right-3 z-10 p-2 bg-surface rounded-full shadow-md hover:bg-secondary transition"
                                    title="Hiq nga të ruajturat"
                                >
                                    <Heart size={18} className="fill-ferrari-red text-ferrari-red" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}