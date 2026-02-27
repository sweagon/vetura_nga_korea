// components/cars/CarCard.tsx
'use client';

import Link from 'next/link';
import { Heart, Fuel, Gauge, Calendar, Settings } from 'lucide-react';
import { useState } from 'react';
import { useSavedCars } from '@/hooks/useSavedCars';
import CompareButton from './CompareButton';
import { type Car } from '@/lib/api';

interface CarCardProps {
    car: Car;
}

export default function CarCard({ car }: CarCardProps) {
    const [imageError, setImageError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { isCarSaved, toggleSave } = useSavedCars();
    const isSaved = isCarSaved(car.id);

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isSaving) return;

        setIsSaving(true);
        const wasSaved = isSaved;

        try {
            await toggleSave(car.id, {
                make: car.make,
                model: car.model,
                year: car.year,
                price: car.price,
                image: car.images?.[0],
            });

            // Dispatch events for matchmaker
            const event = new CustomEvent(wasSaved ? 'carUnsave' : 'carSave', {
                detail: car
            });
            window.dispatchEvent(event);
        } finally {
            setIsSaving(false);
        }
    };

    const handleView = () => {
        const event = new CustomEvent('carView', { detail: car });
        window.dispatchEvent(event);
    };

    return (
        <Link href={`/cars/${car.id}`} onClick={handleView}>
            <div className="bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-medium">
                {/* Image Container */}
                <div className="relative h-48 bg-secondary">
                    {car.images && car.images.length > 0 && !imageError ? (
                        <img
                            src={car.images[0]}
                            alt={`${car.full_name}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                            <span>No image</span>
                        </div>
                    )}

                    {/* Save Button - FIXED */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`absolute top-3 right-3 p-2 bg-surface/90 backdrop-blur-sm rounded-full shadow-md hover:bg-surface transition-all z-10 border border-medium ${isSaving ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        title={isSaved ? "Hiq nga të ruajturat" : "Ruaj makinën"}
                    >
                        <Heart
                            size={18}
                            className={`transition-colors ${isSaved
                                    ? 'fill-ferrari-red text-ferrari-red'
                                    : 'text-secondary hover:text-ferrari-red'
                                }`}
                        />
                    </button>

                    {/* Badge for new/featured - FIXED text color */}
                    {car.isFeatured && (
                        <div className="absolute top-3 left-3 bg-ferrari-red text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                            🔥 Featured
                        </div>
                    )}

                    {/* Sold badge */}
                    {car.sold && (
                        <div className="absolute top-3 left-3 bg-error-bg text-error-text px-3 py-1 rounded-full text-xs font-semibold shadow-md border border-error-border">
                            Sold
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1 text-primary">
                        {car.full_name}
                    </h3>

                    <div className="flex items-baseline justify-between mb-3">
                        <span className="text-2xl font-bold text-ferrari-red">
                            €{car.price?.toLocaleString()}
                        </span>
                        <span className="text-sm text-secondary">{car.year}</span>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2 text-secondary">
                            <Fuel size={16} className="text-ferrari-red flex-shrink-0" />
                            <span className="truncate">
                                {car.fuelType === 'Diesel' ? 'Naftë' :
                                    car.fuelType === 'Gasoline' ? 'Benzinë' :
                                        car.fuelType}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 text-secondary">
                            <Gauge size={16} className="text-ferrari-red flex-shrink-0" />
                            <span className="truncate">{car.mileage?.toLocaleString()} km</span>
                        </div>
                        <div className="flex items-center space-x-2 text-secondary">
                            <Settings size={16} className="text-ferrari-red flex-shrink-0" />
                            <span className="truncate">
                                {car.transmission === 'Automatic' ? 'Automatik' : 'Manuel'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 text-secondary">
                            <Calendar size={16} className="text-ferrari-red flex-shrink-0" />
                            <span className="truncate">{car.year}</span>
                        </div>
                    </div>

                    {/* Actions - FIXED CompareButton */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-medium">
                        <CompareButton
                            car={{ id: car.id, make: car.make, model: car.model }}
                            variant="card"
                        />
                        <span className="text-xs text-muted">
                            ID: {car.id}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}