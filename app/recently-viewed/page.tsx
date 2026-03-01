// app/recently-viewed/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Eye, ArrowLeft, Trash2 } from 'lucide-react';
import { getRecentlyViewed, clearRecentlyViewed, RecentlyViewedItem } from '@/lib/recentlyViewed';

export default function RecentlyViewedPage() {
    const [recentCars, setRecentCars] = useState<RecentlyViewedItem[]>([]);

    useEffect(() => {
        setRecentCars(getRecentlyViewed());
    }, []);

    const handleClear = () => {
        clearRecentlyViewed();
        setRecentCars([]);
    };

    return (
        <div className="min-h-screen bg-primary py-12">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/cars"
                            className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                            aria-label="Back to cars"
                        >
                            <ArrowLeft className="w-5 h-5 text-primary" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                                <Clock className="w-8 h-8 text-orange-primary" />
                                Shikuar së fundmi
                            </h1>
                            <p className="text-secondary mt-1">
                                {recentCars.length} {recentCars.length === 1 ? 'makinë' : 'makina'} të shikuara
                            </p>
                        </div>
                    </div>
                    {recentCars.length > 0 && (
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-error-text hover:text-error-text/80 bg-error-bg hover:bg-error-bg/80 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                            Pastro historinë
                        </button>
                    )}
                </div>

                {/* Content */}
                {recentCars.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-2xl border border-medium">
                        <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Eye className="w-8 h-8 text-muted" />
                        </div>
                        <h2 className="text-xl text-primary mb-2">Nuk keni shikuar asnjë makinë</h2>
                        <p className="text-secondary mb-6">
                            Makinat që shikoni do të shfaqen këtu
                        </p>
                        <Link
                            href="/cars"
                            className="btn-primary inline-flex"
                        >
                            Shfleto makina
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {recentCars.map((car) => (
                            <Link
                                key={car.id}
                                href={`/cars/${car.id}`}
                                className="group"
                            >
                                <div className="bg-surface rounded-2xl overflow-hidden border border-medium hover:border-orange-primary/30 transition-all duration-300 hover:shadow-xl">
                                    <div className="relative h-48 bg-surface-2 overflow-hidden">
                                        {car.image ? (
                                            <img
                                                src={car.image}
                                                alt={car.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Eye className="w-8 h-8 text-muted" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-1 group-hover:text-orange-primary transition-colors">
                                            {car.title}
                                        </h3>
                                        {car.price && (
                                            <p className="text-xl font-bold text-orange-primary mb-2">
                                                {new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(car.price)}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted">
                                            Shikuar: {new Date(car.viewedAt).toLocaleDateString('sq-AL')}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}