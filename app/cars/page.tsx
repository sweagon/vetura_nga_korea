// app/cars/page.tsx
import { Suspense } from 'react';
import CarsContentWrapper from './CarsContentWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Makina për Shitje | Formula Export',
    description: 'Shfleto makinat më të mira nga Korea.',
};

// Loading skeleton for cars page
function CarsLoadingSkeleton() {
    return (
        <div className="container-swiss py-6 md:py-8">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="h-8 bg-surface-2 rounded w-64 mb-2 animate-pulse"></div>
                <div className="h-4 bg-surface-2 rounded w-96 animate-pulse"></div>
            </div>

            {/* Filter Bar Skeleton */}
            <div className="bg-surface-2 border border-light/20 rounded-xl p-3 md:p-4 mb-6">
                <div className="h-10 bg-surface-2 rounded-lg w-40 animate-pulse"></div>
            </div>

            {/* Cars Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-surface rounded-xl border border-medium overflow-hidden">
                        <div className="h-48 bg-surface-2 animate-pulse"></div>
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
    );
}

export default function CarsPage() {
    return (
        <div className="min-h-screen bg-primary">
            <Suspense fallback={<CarsLoadingSkeleton />}>
                <CarsContentWrapper />
            </Suspense>
        </div>
    );
}