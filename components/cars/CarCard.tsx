// components/cars/CarCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Fuel, Gauge, Calendar, Settings } from 'lucide-react';
import { type Car, formatMileage, getFuelTypeAlbanian, getTransmissionAlbanian, getRawKoreanPrice } from '@/lib/api';
import { addToRecentlyViewed } from '@/lib/recentlyViewed';
import { useConfig } from '@/lib/ConfigContext';

interface CarCardProps {
    car: Car;
    priority?: boolean;
}

export default function CarCard({ car, priority = false }: CarCardProps) {
    const { config, formatPrice } = useConfig();
    const [mounted, setMounted] = useState(false);
    const [koreanPrice, setKoreanPrice] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Safely access nested properties
    const lot = car.lots?.[0];

    // Get raw Korean price
    useEffect(() => {
        if (lot) {
            const price = getRawKoreanPrice(lot);
            setKoreanPrice(price - 3190);
        }
    }, [lot]);

    const mileage = lot?.odometer?.km || 0;
    const image = lot?.images?.normal?.[0] || lot?.images?.downloaded?.[0] || '';

    const manufacturerName = car.manufacturer?.name || 'Unknown';
    const modelName = car.model?.name || '';
    const fuelName = car.fuel?.name || '';
    const transmissionName = car.transmission?.name || '';

    const handleClick = () => {
        addToRecentlyViewed({
            id: car.vin || car.id.toString(),
            title: car.title || `${manufacturerName} ${modelName}`,
            image: image,
            price: koreanPrice
        });
    };

    const carTitle = car.title || `${manufacturerName} ${modelName}`;
    const detailUrl = car.vin ? `/cars/${car.vin}` : `/cars/${car.id}`;

    // Calculate final price with all costs
    // Note: In a real scenario, you'd calculate margin properly
    const estimatedFinalPrice = koreanPrice +
        (config?.shippingCost || 3500) +
        (config?.shippingToPristina || 350) +
        (config?.defaultMinimumMargin || 1000);

    return (
        <Link
            href={detailUrl}
            onClick={handleClick}
            className="group block h-full focus:outline-none focus:ring-2 focus:ring-orange-primary/40 rounded-2xl"
            aria-label={`Shiko detajet për ${carTitle}`}
        >
            <article className="card h-full flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                    {image ? (
                        <img
                            src={image}
                            alt={carTitle}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading={priority ? 'eager' : 'lazy'}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.fallback');
                                if (fallback) {
                                    (fallback as HTMLElement).style.display = 'flex';
                                }
                            }}
                        />
                    ) : null}

                    {/* Fallback when no image */}
                    <div
                        className="fallback absolute inset-0 flex items-center justify-center text-muted text-sm bg-surface-2"
                        style={{ display: image ? 'none' : 'flex' }}
                    >
                        No image
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-medium text-primary mb-3 line-clamp-1 group-hover:text-orange-500 transition-colors">
                        {carTitle}
                    </h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-muted shrink-0" />
                            <span className="text-sm text-secondary truncate">{car.year || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Gauge size={14} className="text-muted shrink-0" />
                            <span className="text-sm text-secondary truncate">
                                {mounted ? formatMileage(mileage) : '...'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Fuel size={14} className="text-muted shrink-0" />
                            <span className="text-sm text-secondary truncate">{getFuelTypeAlbanian(fuelName)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Settings size={14} className="text-muted shrink-0" />
                            <span className="text-sm text-secondary truncate">{getTransmissionAlbanian(transmissionName)}</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="mt-auto pt-3 border-t border-light">
                        <div className="flex items-baseline justify-between">
                            <div>
                                <span className="text-xl font-semibold text-orange-500">
                                    {formatPrice(estimatedFinalPrice)}
                                </span>
                                <span className="text-xs text-muted ml-1">
                                    me transport
                                </span>
                            </div>
                            {car.engine?.name && (
                                <span className="text-xs text-muted">
                                    {car.engine.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}