// app/cars/page.tsx
import { Suspense } from 'react';
import CarsContentWrapper from './CarsContentWrapper';
import { Metadata } from 'next';
import { FilterProvider } from '@/contexts/FilterContext';
import CarsLoadingSkeleton from './CarsLoadingSkeleton';
import CarsErrorBoundary from './CarsErrorBoundary';

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300; // 5 minutes

// Generate static params for first 5 pages (improves initial load)
export async function generateStaticParams() {
    // Pre-generate first 5 pages for better performance
    const pages = [1, 2, 3, 4, 5];
    return pages.map(page => ({
        page: page.toString()
    }));
}

export const metadata: Metadata = {
    title: 'Makina për Shitje | Vetura Korea Kosovë',
    description: 'Shfleto makinat më të mira nga Korea. Mercedes, BMW, Audi, Volkswagen dhe Toyota të përzgjedhura për tregun kosovar.',
    openGraph: {
        title: 'Makina për Shitje | Vetura Korea Kosovë',
        description: 'Shfleto makinat më të mira nga Korea. Çmime konkurruese, transport i sigurt.',
        type: 'website',
    },
};

export default function CarsPage() {
    return (
        <div className="min-h-screen bg-primary">
            <div className="container-swiss py-6 md:py-8">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                        Makina për Shitje
                    </h1>
                    <p className="text-secondary">
                        Mercedes, BMW, Audi, Volkswagen, Toyota dhe modele të tjera të përzgjedhura për tregun kosovar
                    </p>
                </div>

                {/* Results with Suspense - Wrapped in FilterProvider */}
                <CarsErrorBoundary>
                    <FilterProvider>
                        <Suspense fallback={<CarsLoadingSkeleton />}>
                            <CarsContentWrapper />
                        </Suspense>
                    </FilterProvider>
                </CarsErrorBoundary>
            </div>
        </div>
    );
}