'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Trash2, ArrowLeft } from 'lucide-react';
import { recentlyViewedService, RecentlyViewedCar } from '@/lib/recentlyViewed';
import CarCard from '@/components/cars/CarCard';

export default function RecentlyViewedPage() {
    const [recentCars, setRecentCars] = useState<RecentlyViewedCar[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecentlyViewed();
    }, []);

    const loadRecentlyViewed = () => {
        const cars = recentlyViewedService.get();
        setRecentCars(cars);
        setLoading(false);
    };

    const clearAll = () => {
        recentlyViewedService.clear();
        setRecentCars([]);
    };

    if (loading) {
        return (
            <div className="container-custom py-12">
                <div className="animate-pulse">
                    <div className="h-8 bg-tertiary rounded w-48 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-tertiary h-64 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/cars"
                        className="p-2 hover:bg-secondary rounded-lg transition"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Shikuar së fundmi</h1>
                        <p className="text-secondary">
                            {recentCars.length} {recentCars.length === 1 ? 'makinë' : 'makina'} të shikuara
                        </p>
                    </div>
                </div>
                {recentCars.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-error-text rounded-lg hover:bg-error-bg transition"
                    >
                        <Trash2 size={18} />
                        <span>Pastro historikun</span>
                    </button>
                )}
            </div>

            {/* Recently viewed grid */}
            {recentCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {recentCars.map((car) => (
                        <div key={car.id} className="relative">
                            <div className="absolute top-2 left-2 z-10 bg-primary/50 text-primary text-xs px-2 py-1 rounded">
                                {new Date(car.viewedAt).toLocaleDateString('sq-AL', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                            {/* We need to convert RecentlyViewedCar to full car object */}
                            {/* For now, we'll create a mock car object */}
                            <CarCard car={{
                                ...car,
                                full_name: `${car.make} ${car.model}`,
                                images: car.image ? [car.image] : []
                            }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-secondary rounded-lg">
                    <Clock size={48} className="mx-auto text-muted mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nuk keni shikuar asnjë makinë</h3>
                    <p className="text-secondary mb-6">
                        Makinat që shikoni do të shfaqen këtu
                    </p>
                    <Link href="/cars" className="btn-primary inline-block">
                        Shfleto makina
                    </Link>
                </div>
            )}
        </div>
    );
}
