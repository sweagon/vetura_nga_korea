// app/cars/[id]/CarDetailClientWrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getCarByVin, type Car } from '@/lib/api';
import { CarDetailClient } from '@/components/cars/CarDetailClient';
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton';

export default function CarDetailClientWrapper({ vin }: { vin: string }) {
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCar = async () => {
            try {
                setLoading(true);
                const data = await getCarByVin(vin);

                if (!data) {
                    setError(true);
                    return;
                }

                setCar(data);
            } catch (err) {
                console.error('Error fetching car:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCar();
    }, [vin]);

    if (loading) {
        return <DetailSkeleton />;
    }

    if (error || !car) {
        notFound();
    }

    return <CarDetailClient car={car} />;
}