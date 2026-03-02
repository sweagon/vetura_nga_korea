// app/cars/[id]/page.tsx
import { notFound } from 'next/navigation';
import { extractVinFromParam } from '@/lib/api';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton';
import CarDetailClientWrapper from './CarDetailClientWrapper';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const { id } = await params;
        const vin = extractVinFromParam(id);

        // For metadata, we still need to fetch on server
        // You can keep this or simplify
        return {
            title: `Makina me VIN ${vin} | Vetura Nga Korea`,
            description: `Detajet e makinës me VIN ${vin}`,
        };
    } catch (error) {
        return {
            title: 'Makina nuk u gjet | Vetura Nga Korea',
        };
    }
}

export default async function CarDetailPage({ params }: PageProps) {
    const { id } = await params;
    const vin = extractVinFromParam(id);

    if (!vin) {
        notFound();
    }

    return (
        <Suspense fallback={<DetailSkeleton />}>
            <CarDetailClientWrapper vin={vin} />
        </Suspense>
    );
}