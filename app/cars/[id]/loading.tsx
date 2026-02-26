import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function CarDetailLoading() {
    return (
        <div className="min-h-screen bg-secondary">
            {/* Breadcrumb Skeleton */}
            <div className="bg-surface border-b">
                <div className="container-custom py-4">
                    <div className="flex items-center space-x-2 animate-pulse">
                        <div className="h-4 bg-tertiary rounded w-20"></div>
                        <div className="h-4 bg-tertiary rounded w-4"></div>
                        <div className="h-4 bg-tertiary rounded w-16"></div>
                        <div className="h-4 bg-tertiary rounded w-4"></div>
                        <div className="h-4 bg-tertiary rounded w-24"></div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Header Skeleton */}
                <div className="mb-6 animate-pulse">
                    <div className="h-8 bg-tertiary rounded w-96 mb-2"></div>
                    <div className="flex items-center space-x-4">
                        <div className="h-4 bg-tertiary rounded w-32"></div>
                        <div className="h-6 bg-tertiary rounded w-20"></div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery Skeleton */}
                        <div className="bg-surface rounded-lg shadow-md overflow-hidden">
                            <div className="h-96 bg-tertiary animate-pulse"></div>
                            <div className="grid grid-cols-6 gap-2 p-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-20 bg-tertiary rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Skeleton */}
                        <div className="bg-surface rounded-lg shadow-md p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="text-center">
                                        <div className="h-6 bg-tertiary rounded w-24 mx-auto mb-2 animate-pulse"></div>
                                        <div className="h-4 bg-tertiary rounded w-16 mx-auto animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Car Specs Skeleton */}
                        <div className="bg-surface rounded-lg shadow-md p-6">
                            <div className="h-6 bg-tertiary rounded w-48 mb-4 animate-pulse"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="flex items-start space-x-3 p-3 bg-secondary rounded-lg">
                                        <div className="w-5 h-5 bg-tertiary rounded animate-pulse"></div>
                                        <div className="flex-1">
                                            <div className="h-3 bg-tertiary rounded w-20 mb-2 animate-pulse"></div>
                                            <div className="h-4 bg-tertiary rounded w-32 animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Price Card Skeleton */}
                        <div className="bg-surface rounded-lg shadow-md p-6 sticky top-24">
                            <div className="h-8 bg-tertiary rounded w-32 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-tertiary rounded w-40 mb-4 animate-pulse"></div>
                            <div className="space-y-3">
                                <div className="h-12 bg-tertiary rounded w-full animate-pulse"></div>
                                <div className="h-12 bg-tertiary rounded w-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Cost Calculator Skeleton */}
                        <div className="bg-surface rounded-lg shadow-md overflow-hidden">
                            <div className="bg-tertiary h-14 animate-pulse"></div>
                            <div className="p-4">
                                <div className="h-16 bg-tertiary rounded mb-4 animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-tertiary rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-tertiary rounded w-3/4 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Seller Info Skeleton */}
                        <div className="bg-surface rounded-lg shadow-md p-6">
                            <div className="h-6 bg-tertiary rounded w-32 mb-4 animate-pulse"></div>
                            <div className="space-y-3">
                                <div className="h-5 bg-tertiary rounded w-40 animate-pulse"></div>
                                <div className="h-4 bg-tertiary rounded w-32 animate-pulse"></div>
                                <div className="h-4 bg-tertiary rounded w-36 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Contact Form Skeleton */}
                        <div className="bg-surface rounded-lg shadow-md p-6">
                            <div className="h-6 bg-tertiary rounded w-32 mb-4 animate-pulse"></div>
                            <div className="space-y-4">
                                <div className="h-10 bg-tertiary rounded w-full animate-pulse"></div>
                                <div className="h-10 bg-tertiary rounded w-full animate-pulse"></div>
                                <div className="h-24 bg-tertiary rounded w-full animate-pulse"></div>
                                <div className="h-10 bg-tertiary rounded w-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Cars Skeleton */}
                <div className="mt-12">
                    <div className="h-6 bg-tertiary rounded w-48 mb-4 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <CarCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}