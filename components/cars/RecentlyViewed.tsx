// components/cars/RecentlyViewed.tsx - UPDATED WITH THEME VARIABLES
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, X, ChevronRight, Eye } from 'lucide-react';
import { recentlyViewedService, RecentlyViewedCar } from '@/lib/recentlyViewed';

export default function RecentlyViewed() {
    const [recentCars, setRecentCars] = useState<RecentlyViewedCar[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        loadRecentlyViewed();
    }, []);

    const loadRecentlyViewed = () => {
        const cars = recentlyViewedService.get();
        setRecentCars(cars);
    };

    const removeCar = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        recentlyViewedService.remove(id);
        loadRecentlyViewed();
    };

    const clearAll = () => {
        recentlyViewedService.clear();
        setRecentCars([]);
    };

    if (!isVisible || recentCars.length === 0) {
        return null;
    }

    return (
        <div className="bg-surface rounded-lg shadow-md p-6 mb-8 border border-medium">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock size={20} className="text-ferrari-red" />
                    <h2 className="text-xl font-bold text-primary">Shikuar së fundmi</h2>
                </div>
                <div className="flex items-center gap-4">
                    {recentCars.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-sm text-muted hover:text-ferrari-red transition"
                        >
                            Pastro të gjitha
                        </button>
                    )}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-muted hover:text-ferrari-red transition"
                        title="Fshih"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {recentCars.map((car) => (
                    <Link
                        key={car.id}
                        href={`/cars/${car.id}`}
                        className="group relative bg-surface-2 rounded-lg overflow-hidden hover:shadow-md transition border border-medium"
                    >
                        {/* Remove button */}
                        <button
                            onClick={(e) => removeCar(car.id, e)}
                            className="absolute top-2 right-2 z-10 p-1 bg-surface rounded-full shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-surface-2"
                        >
                            <X size={14} className="text-muted" />
                        </button>

                        {/* Image */}
                        <div className="aspect-video bg-surface-2 relative">
                            {car.image ? (
                                <img
                                    src={car.image}
                                    alt={`${car.make} ${car.model}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted">
                                    <Eye size={24} />
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="p-3">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-1 text-primary">
                                {car.make} {car.model}
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="text-ferrari-red font-bold text-sm">
                                    €{car.price?.toLocaleString()}
                                </span>
                                <span className="text-xs text-muted">
                                    {car.year}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                                <span>{car.fuelType === 'Diesel' ? 'Naftë' : 'Benzinë'}</span>
                                <span>•</span>
                                <span>{car.mileage?.toLocaleString()} km</span>
                            </div>
                        </div>

                        {/* View badge */}
                        <div className="absolute bottom-2 left-2 bg-primary/70 text-primary text-[10px] px-2 py-1 rounded">
                            {new Date(car.viewedAt).toLocaleDateString('sq-AL')}
                        </div>
                    </Link>
                ))}
            </div>

            {/* View all link */}
            {recentCars.length >= 5 && (
                <div className="text-right mt-4">
                    <Link
                        href="/recently-viewed"
                        className="text-sm text-ferrari-red hover:underline inline-flex items-center"
                    >
                        Shiko të gjitha
                        <ChevronRight size={16} className="ml-1" />
                    </Link>
                </div>
            )}
        </div>
    );
}
