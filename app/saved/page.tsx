// app/saved/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import CarCard from '@/components/cars/CarCard';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useSavedCars } from '@/hooks/useSavedCars';
import { fetchCarDetails } from '@/lib/api';
import { Heart, LogIn, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';

export default function SavedPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { savedCars, loading, removeSavedCar, reloadSavedCars } = useSavedCars();
    const [carDetails, setCarDetails] = useState<Map<number, any>>(new Map());
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch car details for saved cars
    const fetchDetails = useCallback(async () => {
        if (savedCars.length === 0) {
            setLoadingDetails(false);
            return;
        }

        setLoadingDetails(true);
        setError(null);
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
        } catch (err) {
            console.error('Error fetching saved car details:', err);
            setError('Failed to load some saved cars. Please try again.');
        } finally {
            setLoadingDetails(false);
        }
    }, [savedCars]);

    useEffect(() => {
        if (!loading) {
            fetchDetails();
        }
    }, [savedCars, loading, fetchDetails]);

    const handleRemove = async (carId: number) => {
        try {
            await removeSavedCar(carId);
            // Optimistically update UI
            setCarDetails(prev => {
                const newMap = new Map(prev);
                newMap.delete(carId);
                return newMap;
            });
        } catch (error) {
            console.error('Error removing car:', error);
            setError('Failed to remove car. Please try again.');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await reloadSavedCars();
        await fetchDetails();
        setRefreshing(false);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="container-custom py-8">
                <div className="h-8 bg-surface-2 rounded w-64 mb-8 animate-pulse"></div>
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

    const hasCars = savedCars.length > 0;

    return (
        <div className="container-custom py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2">Makinat e ruajtura</h1>
                    <p className="text-secondary">
                        {savedCars.length} {savedCars.length === 1 ? 'makinë e ruajtur' : 'makina të ruajtura'}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                    title="Rifresko"
                >
                    <RefreshCw size={20} className={`text-muted ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="bg-error-bg border border-error-border text-error-text px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-error-text hover:text-error-text/80">
                        <X size={18} />
                    </button>
                </div>
            )}

            {loadingDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(Math.min(4, savedCars.length || 4))].map((_, i) => (
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

                        return (
                            <div key={saved.id} className="relative">
                                {car ? (
                                    <>
                                        <CarCard car={car} />
                                        <button
                                            onClick={() => handleRemove(saved.car_id)}
                                            className="absolute top-3 right-3 z-10 p-2 bg-surface rounded-full shadow-md hover:bg-surface-2 transition border border-medium"
                                            title="Hiq nga të ruajturat"
                                        >
                                            <Heart size={18} className="fill-ferrari-red text-ferrari-red" />
                                        </button>
                                    </>
                                ) : (
                                    <LoadingSkeleton />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}