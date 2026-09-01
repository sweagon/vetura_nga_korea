import { Suspense } from 'react';
import CarsContentWrapper from './CarsContentWrapper';
import { Metadata } from 'next';
import { FilterProvider } from '@/contexts/FilterContext';
import CarsLoadingSkeleton from './CarsLoadingSkeleton';
import CarsErrorBoundary from './CarsErrorBoundary';

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
        <div className="min-h-screen bg-bg-primary">
            <div className="container-swiss py-6 md:py-8">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                        Makina për Shitje
                    </h1>
                    <p className="text-text-secondary">
                        Mercedes, BMW, Audi, Volkswagen, Toyota dhe modele të tjera të përzgjedhura për tregun kosovar
                    </p>
                </div>

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
