// app/cars/[id]/loading.tsx
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton';

export default function CarDetailLoading() {
    return (
        <div className="container-swiss py-6 md:py-8 lg:py-12">
            <DetailSkeleton />
        </div>
    );
}