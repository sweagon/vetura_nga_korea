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
            <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 rounded w-full" />
                <Skeleton className="h-4 rounded w-full" />
                <Skeleton className="h-4 rounded w-full" />
                <Skeleton className="h-4 rounded w-full" />
            </div>
            <div className="pt-3 border-t border-light">
                <Skeleton className="h-8 rounded w-1/2" />
            </div>
        </div>
    </div>
);

export const GridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
    <div className="container-swiss space-y-6 md:space-y-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 bg-surface-2 rounded w-48 md:w-64"></div>

        {/* Title skeleton */}
        <div className="space-y-2">
            <Skeleton className="h-8 md:h-10 rounded w-3/4 md:w-2/3" />
            <Skeleton className="h-4 rounded w-32 md:w-48" />
        </div>

        {/* Main Grid skeleton */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {/* Gallery skeleton */}
                <Skeleton className="aspect-[16/9] rounded-xl w-full" />

                {/* Quick Stats skeleton - matches actual grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card p-3 md:p-4 space-y-2">
                            <Skeleton className="h-6 md:h-8 rounded w-3/4 mx-auto" />
                            <Skeleton className="h-3 rounded w-1/2 mx-auto" />
                        </div>
                    ))}
                </div>

                {/* Key Features skeleton */}
                <div className="card p-5 md:p-6 space-y-4">
                    <Skeleton className="h-5 md:h-6 rounded w-36 md:w-48" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-surface-2 rounded-lg">
                                <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
                                <div className="space-y-1 flex-1">
                                    <Skeleton className="h-3 rounded w-12 md:w-16" />
                                    <Skeleton className="h-4 rounded w-16 md:w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Full Specifications skeleton */}
                <div className="card p-5 md:p-6 space-y-4">
                    <Skeleton className="h-5 md:h-6 rounded w-40 md:w-56" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex justify-between p-2 md:p-3 bg-surface-2 rounded-lg">
                                <Skeleton className="h-4 rounded w-16 md:w-20" />
                                <Skeleton className="h-4 rounded w-12 md:w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Contact skeleton */}
            <div className="lg:col-span-1 space-y-4">
                {/* Price Card skeleton */}
                <div className="card p-5 md:p-6 space-y-4">
                    <Skeleton className="h-8 md:h-10 rounded w-32 md:w-40 mx-auto" />
                    <Skeleton className="h-3 rounded w-24 md:w-32 mx-auto" />
                    <div className="space-y-3 pt-2">
                        <div className="p-3 md:p-4 bg-surface-2 rounded-lg space-y-2">
                            <Skeleton className="h-4 rounded w-24 md:w-32" />
                            <Skeleton className="h-4 rounded w-32 md:w-40" />
                            <Skeleton className="h-4 rounded w-28 md:w-36" />
                        </div>
                        <Skeleton className="h-10 md:h-12 rounded w-full" />
                    </div>
                </div>

                {/* Cost Estimate skeleton */}
                <div className="card p-5 md:p-6 space-y-3">
                    <Skeleton className="h-5 rounded w-32 md:w-40" />
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-4 rounded w-16 md:w-20" />
                                <Skeleton className="h-4 rounded w-12 md:w-16" />
                            </div>
                        ))}
                        <div className="border-t border-light my-2 pt-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 rounded w-12 md:w-16" />
                                <Skeleton className="h-5 rounded w-16 md:w-20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* VIN skeleton */}
                <Skeleton className="h-12 rounded-lg" />
            </div>
        </div>

        {/* Back Link skeleton */}
        <div className="mt-8 md:mt-12 text-center">
            <Skeleton className="h-8 md:h-10 w-32 md:w-40 rounded-lg mx-auto" />
        </div>
    </div>
);

export default Skeleton;