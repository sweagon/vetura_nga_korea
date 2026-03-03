// app/cars/page.tsx
import { Suspense } from 'react';
import CarsContentWrapper from './CarsContentWrapper'; // Make sure this is correct
import { Metadata } from 'next';
import CompactSearch from '@/components/ui/CompactSearch';

export const metadata: Metadata = {
    title: 'Makina për Shitje | Vetura Nga Korea',
    description: 'Shfleto makinat më të mira nga Korea.',
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
                        Shfleto makinat më të mira nga Korea
                    </p>
                </div>

                {/* Results */}
                <Suspense fallback={<div>Loading...</div>}>
                    <CarsContentWrapper />
                </Suspense>
            </div>
        </div>
    );
}