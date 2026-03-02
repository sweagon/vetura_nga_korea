// app/recently-viewed/page.tsx
import { Suspense } from 'react';
import RecentlyViewedContent from './RecentlyViewedContent';

export const metadata = {
    title: 'Shikuar së fundmi | Vetura Nga Korea',
    description: 'Makinat që keni shikuar së fundmi.',
};

// Loading skeleton
function RecentlyViewedSkeleton() {
    return (
        <div className="min-h-screen bg-primary py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-surface-2 rounded-lg animate-pulse" />
                    <div>
                        <div className="h-8 bg-surface-2 rounded w-48 mb-2 animate-pulse" />
                        <div className="h-4 bg-surface-2 rounded w-32 animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-surface rounded-2xl overflow-hidden border border-medium">
                            <div className="h-48 bg-surface-2 animate-pulse" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 bg-surface-2 rounded w-3/4 animate-pulse" />
                                <div className="h-4 bg-surface-2 rounded w-1/2 animate-pulse" />
                                <div className="h-3 bg-surface-2 rounded w-1/3 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function RecentlyViewedPage() {
    return (
        <Suspense fallback={<RecentlyViewedSkeleton />}>
            <RecentlyViewedContent />
        </Suspense>
    );
}