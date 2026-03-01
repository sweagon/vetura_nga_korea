// components/cars/RecentlyViewed.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Eye } from 'lucide-react';
import { getRecentlyViewed, RecentlyViewedItem } from '@/lib/recentlyViewed';

export default function RecentlyViewed() {
    const [recentCars, setRecentCars] = useState<RecentlyViewedItem[]>([]);

    useEffect(() => {
        setRecentCars(getRecentlyViewed());
    }, []);

    if (recentCars.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-primary/10 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-primary">Shikuar së fundmi</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {recentCars.slice(0, 5).map((car) => (
                    <Link
                        key={car.id}
                        href={`/cars/${car.id}`}
                        className="group"
                    >
                        <div className="bg-surface rounded-xl overflow-hidden border border-medium hover:border-orange-primary/30 transition-all duration-300 hover:shadow-lg">
                            <div className="relative h-28 bg-surface-2">
                                {car.image ? (
                                    <img
                                        src={car.image}
                                        alt={car.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-muted" />
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="text-sm font-medium text-primary line-clamp-1 group-hover:text-orange-primary transition-colors">
                                    {car.title}
                                </h3>
                                {car.price && (
                                    <p className="text-sm font-semibold text-orange-primary mt-1">
                                        {new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(car.price)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}