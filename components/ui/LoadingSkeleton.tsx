// components/ui/LoadingSkeleton.tsx

// Car card skeleton
export const CarCardSkeleton = () => (
    <div className="animate-pulse">
        <div className="bg-tertiary h-48 rounded-t-lg"></div>
        <div className="bg-surface p-4 rounded-b-lg">
            <div className="h-4 bg-tertiary rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-tertiary rounded w-1/2 mb-3"></div>
            <div className="grid grid-cols-2 gap-2">
                <div className="h-3 bg-tertiary rounded"></div>
                <div className="h-3 bg-tertiary rounded"></div>
            </div>
        </div>
    </div>
);

// Filter skeleton
export const FilterSkeleton = () => (
    <div className="bg-surface p-6 rounded-lg shadow-md space-y-4">
        <div className="h-6 bg-tertiary rounded w-1/3"></div>
        <div className="h-10 bg-tertiary rounded"></div>
        <div className="h-10 bg-tertiary rounded"></div>
        <div className="h-10 bg-tertiary rounded"></div>
    </div>
);

// Also export a default component for convenience
const LoadingSkeleton = CarCardSkeleton;
export default LoadingSkeleton;