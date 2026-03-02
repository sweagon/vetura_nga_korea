// app/cars/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getCarByVin, formatMileage, extractVinFromParam } from '@/lib/api';
import { Metadata } from 'next';
import { CarDetailClient } from '@/components/cars/CarDetailClient';
import { Suspense } from 'react';
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const { id } = await params;
        const vin = extractVinFromParam(id);
        const car = await getCarByVin(vin);

        if (!car) {
            return {
                title: 'Makina nuk u gjet | Vetura Nga Korea',
            };
        }

        const lot = car.lots?.[0];
        const mileage = lot?.odometer?.km || 0;
        const manufacturerName = car.manufacturer?.name || 'Makina';
        const modelName = car.model?.name || '';

        return {
            title: `${manufacturerName} ${modelName} ${car.year || ''} | Vetura Nga Korea`,
            description: `${manufacturerName} ${modelName} ${car.year || ''} me ${formatMileage(mileage)}.`,
            openGraph: {
                title: `${manufacturerName} ${modelName} ${car.year || ''}`,
                description: `${manufacturerName} ${modelName} ${car.year || ''}`,
                images: lot?.images?.normal?.[0] ? [lot.images.normal[0]] : [],
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Makina nuk u gjet | Vetura Nga Korea',
        };
    }
}

export default async function CarDetailPage({ params }: PageProps) {
    try {
        const { id } = await params;
        const vin = extractVinFromParam(id);

        // Add validation for VIN
        if (!vin) {
            console.error('Invalid VIN:', vin);
            notFound();
        }

        const car = await getCarByVin(vin);

        if (!car) {
            console.error('Car not found for VIN:', vin);
            notFound();
        }

        // Validate car data has required fields
        if (!car.lots || car.lots.length === 0) {
            console.error('Car has no lots:', car.id);
            notFound();
        }

        return (
            <Suspense fallback={<DetailSkeleton />}>
                <CarDetailClient car={car} />
            </Suspense>
        );
    } catch (error) {
        console.error('Error in CarDetailPage:', error);
        notFound();
    }
}