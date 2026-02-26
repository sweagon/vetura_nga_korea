'use client';

import { useEffect } from 'react';
import { recentlyViewedService } from '@/lib/recentlyViewed';

interface RecentlyViewedTrackerProps {
    car: any;
}

export default function RecentlyViewedTracker({ car }: RecentlyViewedTrackerProps) {
    useEffect(() => {
        if (car) {
            recentlyViewedService.add(car);
        }
    }, [car]);

    return null; // This component doesn't render anything
}