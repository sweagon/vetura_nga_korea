// components/ui/LoadingSkeleton.tsx
export default function LoadingSkeleton({ type = 'card' }: { type?: 'card' | 'form' | 'grid' }) {
    if (type === 'grid') {
        return (
            <div className="container-custom py-8">
                <div className="h-8 bg-surface-2 rounded w-64 mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-surface rounded-xl border border-medium p-4">
                            <div className="h-48 bg-surface-2 rounded-lg mb-4 animate-pulse"></div>
                            <div className="h-4 bg-surface-2 rounded w-3/4 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-surface-2 rounded w-1/2 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'form') {
        return (
            <div className="bg-surface rounded-xl shadow-xl p-8 border border-medium">
                <div className="h-8 bg-surface-2 rounded w-1/3 mb-6 animate-pulse"></div>
                <div className="space-y-4">
                    <div className="h-20 bg-surface-2 rounded animate-pulse"></div>
                    <div className="h-20 bg-surface-2 rounded animate-pulse"></div>
                    <div className="h-12 bg-surface-2 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (type === 'card') {
        return (
            <div className="bg-surface rounded-xl border border-medium p-4">
                <div className="h-48 bg-surface-2 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-4 bg-surface-2 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-surface-2 rounded w-1/2 animate-pulse"></div>
            </div>
        );
    }

    return null;
}

// Export named skeletons for backward compatibility
export const CarCardSkeleton = () => (
    <div className="bg-surface rounded-xl border border-medium p-4">
        <div className="h-48 bg-surface-2 rounded-lg mb-4 animate-pulse"></div>
        <div className="h-4 bg-surface-2 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-surface-2 rounded w-1/2 animate-pulse"></div>
    </div>
);

export const FormSkeleton = () => (
    <div className="bg-surface rounded-xl shadow-xl p-8 border border-medium">
        <div className="h-8 bg-surface-2 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="space-y-4">
            <div className="h-20 bg-surface-2 rounded animate-pulse"></div>
            <div className="h-20 bg-surface-2 rounded animate-pulse"></div>
            <div className="h-12 bg-surface-2 rounded animate-pulse"></div>
        </div>
    </div>
);

export const GridSkeleton = () => (
    <div className="container-custom py-8">
        <div className="h-8 bg-surface-2 rounded w-64 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <CarCardSkeleton key={i} />
            ))}
        </div>
    </div>
);