// app/cars/[id]/loading.tsx
import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function CarDetailLoading() {
    return (
        <div className="container-custom py-8">
            <div className="animate-pulse">
                <div className="h-8 bg-surface-2 rounded w-64 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="h-96 bg-surface-2 rounded-xl mb-4"></div>
                        <div className="grid grid-cols-4 gap-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-20 bg-surface-2 rounded"></div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <CarCardSkeleton />
                        <div className="mt-4 h-32 bg-surface-2 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}