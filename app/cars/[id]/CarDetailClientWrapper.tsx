// app/cars/[id]/CarDetailClientWrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { fetchCarByVin, type Car } from '@/lib/api';
import { CarDetailClient } from '@/components/cars/CarDetailClient';
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton';

export default function CarDetailClientWrapper({ vin }: { vin: string }) {
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                setLoading(true);
                console.log('🔍 Fetching car with VIN:', vin);
                const data = await fetchCarByVin(vin);

                if (!data) {
                    console.log('❌ Car not found for VIN:', vin);
                    setError(true);
                    return;
                }

                console.log('✅ Car found:', data);
                setCar(data);
            } catch (err) {
                console.error('Error fetching car:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (vin) {
            fetchCar();
        } else {
            setError(true);
            setLoading(false);
        }
    }, [vin]);

    if (loading) {
        return <DetailSkeleton />;
    }

    if (error || !car) {
        notFound();
    }

    return <CarDetailClient car={car} />;
}