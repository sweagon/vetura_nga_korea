// app/cars/[id]/page.tsx
import { notFound } from 'next/navigation';
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
        if (!id) return { title: 'Makina nuk u gjet | Vetura Korea Kosovë' };
        return {
            title: `Makina ${id} | Vetura Korea Kosovë`,
            description: `Detajet e makinës ${id}`,
        };
    } catch {
        return {
            title: 'Makina nuk u gjet | Vetura Korea Kosovë',
        };
    }
}

export default async function CarDetailPage({ params }: PageProps) {
    const { id } = await params;
    if (!id) {
        notFound();
    }
    return (
        <Suspense fallback={<DetailSkeleton />}>
            <CarDetailClientWrapper id={id} />
        </Suspense>
    );
}