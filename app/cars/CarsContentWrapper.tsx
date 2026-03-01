// app/cars/CarsContentWrapper.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import CarsContent from './CarsContent';

export default function CarsContentWrapper() {
    const searchParams = useSearchParams();
    return <CarsContent searchParams={searchParams} />;
}