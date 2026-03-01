// app/cars/[id]/loading.tsx
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton';

export default function CarDetailLoading() {
    return (
        <div className="container-swiss py-8">
            <DetailSkeleton />
        </div>
    );
}   