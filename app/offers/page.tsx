// app/offers/page.tsx
export const dynamic = 'force-dynamic';
// or
export const revalidate = 0;

import { Suspense } from 'react';
import OffersContent from './OffersContent';

export default function OffersPage() {
    return (
        <div className="min-h-screen bg-primary">
            <Suspense fallback={
                <div className="container-custom py-8">
                    <div className="h-8 bg-surface-2 rounded w-64 mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-surface rounded-xl border border-medium p-4">
                                <div className="h-48 bg-surface-2 rounded-lg mb-4 animate-pulse"></div>
                                <div className="h-4 bg-surface-2 rounded w-3/4 mb-2 animate-pulse"></div>
                                <div className="h-4 bg-surface-2 rounded w-1/2 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            }>
                <OffersContent />
            </Suspense>
        </div>
    );
}