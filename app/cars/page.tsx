// app/cars/page.tsx (Enhanced Version)
import { Suspense } from 'react';
import CarsContent from './CarsContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Makina për Shitje | Formula Export',
    description: 'Shfleto makinat më të mira nga Korea. BMW, Audi, Mercedes-Benz, Volkswagen dhe marka të tjera me çmime konkurruese.',
    keywords: ['makina për shitje', 'makina nga Korea', 'import makina', 'BMW', 'Audi', 'Mercedes'],
    openGraph: {
        title: 'Makina për Shitje | Formula Export',
        description: 'Shfleto makinat më të mira nga Korea',
        images: ['/og-image.jpg'],
    },
};

export default function CarsPage() {
    return (
        <div className="min-h-screen bg-primary">
            <Suspense fallback={
                <div className="container-custom py-8">
                    {/* Header Skeleton */}
                    <div className="mb-8">
                        <div className="h-10 bg-surface-2 rounded-lg w-64 mb-2 animate-pulse"></div>
                        <div className="h-5 bg-surface-2 rounded-lg w-96 animate-pulse"></div>
                    </div>

                    {/* Filter Bar Skeleton */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-10 bg-surface-2 rounded-lg w-48 animate-pulse"></div>
                        <div className="h-10 bg-surface-2 rounded-lg w-40 animate-pulse"></div>
                    </div>

                    {/* Cars Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-surface rounded-xl border border-medium overflow-hidden">
                                {/* Image Skeleton */}
                                <div className="h-48 bg-surface-2 animate-pulse"></div>

                                {/* Content Skeleton */}
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-surface-2 rounded w-3/4 animate-pulse"></div>
                                    <div className="flex justify-between">
                                        <div className="h-6 bg-surface-2 rounded w-24 animate-pulse"></div>
                                        <div className="h-5 bg-surface-2 rounded w-12 animate-pulse"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="h-4 bg-surface-2 rounded animate-pulse"></div>
                                        <div className="h-4 bg-surface-2 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            }>
                <CarsContent />
            </Suspense>
        </div>
    );
}