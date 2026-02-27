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
    const { isCarSaved, toggleSave } = useSavedCars();
    const isSaved = isCarSaved(car.id);

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const wasSaved = isSaved;
        await toggleSave(car.id, {
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
            image: car.images?.[0],
        });

        if (wasSaved) {
            const event = new CustomEvent('carUnsave', { detail: car });
            window.dispatchEvent(event);
        } else {
            const event = new CustomEvent('carSave', { detail: car });
            window.dispatchEvent(event);
        }
    };

    const handleView = () => {
        const event = new CustomEvent('carView', { detail: car });
        window.dispatchEvent(event);
    };

    return (
        <Link href={`/cars/${car.id}`} onClick={handleView}>
            <div className="bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
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
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span>No image</span>
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="absolute top-3 right-3 p-2 bg-surface rounded-full shadow-md hover:bg-secondary transition z-10"
                        title={isSaved ? "Hiq nga të ruajturat" : "Ruaj makinën"}
                    >
                        <Heart
                            size={18}
                            className={isSaved ? 'fill-ferrari-red text-ferrari-red' : 'text-gray-600'}
                        />
                    </button>

                    {/* Badge for new/featured */}
                    {car.isFeatured && (
                        <div className="absolute top-3 left-3 bg-ferrari-red text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Featured
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{car.full_name}</h3>

                    <div className="flex items-baseline justify-between mb-3">
                        <span className="text-2xl font-bold text-ferrari-red">
                            €{car.price?.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">{car.year}</span>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Fuel size={16} className="text-ferrari-red" />
                            <span>{car.fuelType === 'Diesel' ? 'Naftë' : car.fuelType === 'Gasoline' ? 'Benzinë' : car.fuelType}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Gauge size={16} className="text-ferrari-red" />
                            <span>{car.mileage?.toLocaleString()} km</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Settings size={16} className="text-ferrari-red" />
                            <span>{car.transmission === 'Automatic' ? 'Automatik' : 'Manuel'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar size={16} className="text-ferrari-red" />
                            <span>{car.year}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-theme">
                        <CompareButton car={{ id: car.id, make: car.make, model: car.model }} />
                        <span className="text-xs text-gray-400">
                            ID: {car.id}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}