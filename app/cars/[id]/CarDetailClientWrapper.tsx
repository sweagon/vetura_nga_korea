'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { fetchCarByVin, type Car } from '@/lib/api';
import { CarDetailClient } from '@/components/cars/CarDetailClient';
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton';
import { Link } from 'lucide-react';

export default function CarDetailClientWrapper({ vin }: { vin: string }) {
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('🔍 Fetching car with VIN:', vin);
                console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

                const data = await fetchCarByVin(vin);

                if (!data) {
                    console.log('❌ Car not found for VIN:', vin);
                    setError('Makina nuk u gjet');
                    return;
                }

                console.log('✅ Car found:', data);
                setCar(data);
            } catch (err) {
                console.error('❌ Error fetching car:', err);
                setError(err instanceof Error ? err.message : 'Gabim gjatë ngarkimit');
            } finally {
                setLoading(false);
            }
        };

        if (vin) {
            fetchCar();
        } else {
            setError('VIN i pavlefshëm');
            setLoading(false);
        }
    }, [vin]);

    if (loading) {
        return <DetailSkeleton />;
    }

    if (error) {
        console.log('Showing error state:', error);
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-primary mb-2">Makina nuk u gjet</h2>
                    <p className="text-secondary mb-2">{error}</p>
                    <p className="text-sm text-muted mb-6">
                        VIN: {vin}
                    </p>
                    <div className="flex flex-col gap-3">
                        <a
                            href={`/api/proxy/vin/${vin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-600 text-sm underline"
                        >
                            Testo API direkt
                        </a>
                        <Link href="/cars" className="btn-primary inline-block">
                            Kthehu te Makinat
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!car) {
        notFound();
    }

    return <CarDetailClient car={car} />;
}