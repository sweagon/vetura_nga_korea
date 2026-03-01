// components/ui/LoadingSkeleton.tsx
'use client';

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
    <div className={`skeleton ${className}`} />
);

export const CarCardSkeleton = () => (
    <div className="card p-0">
        <Skeleton className="aspect-[4/3] rounded-t-xl" />
        <div className="p-5 space-y-4">
            <Skeleton className="h-5 rounded w-3/4" />
            <div className="space-y-2">
                <Skeleton className="h-4 rounded w-full" />
                <Skeleton className="h-4 rounded w-2/3" />
            </div>
            <div className="pt-3 border-t border-light">
                <Skeleton className="h-8 rounded w-1/2" />
            </div>
        </div>
    </div>
);

export const GridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
            <CarCardSkeleton key={i} />
        ))}
    </div>
);

export const FilterSkeleton = () => (
    <div className="bg-surface rounded-xl border border-light p-5 space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-5 rounded w-16" />
            <Skeleton className="h-4 rounded w-12" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-10 rounded w-full" />
            <Skeleton className="h-10 rounded w-full" />
            <Skeleton className="h-10 rounded w-full" />
        </div>
    </div>
);

export const DetailSkeleton = () => (
    <div className="space-y-8">
        <Skeleton className="aspect-[16/9] rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
        </div>
        <div className="space-y-4">
            <Skeleton className="h-6 rounded w-48" />
            <Skeleton className="h-32 rounded w-full" />
        </div>
    </div>
);

export default Skeleton;