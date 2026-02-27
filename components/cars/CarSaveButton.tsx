// components/cars/CarSaveButton.tsx
'use client';

import { Heart } from 'lucide-react';
import { useSavedCars } from '@/hooks/useSavedCars';
import { useState } from 'react';

interface CarSaveButtonProps {
    car: any;
    variant?: 'icon' | 'full';
}

export default function CarSaveButton({ car, variant = 'icon' }: CarSaveButtonProps) {
    const { isCarSaved, toggleSave } = useSavedCars();
    const [isSaving, setIsSaving] = useState(false);
    const isSaved = isCarSaved(car.id);

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isSaving) return;

        setIsSaving(true);
        try {
            await toggleSave(car.id, {
                make: car.make,
                model: car.model,
                year: car.year,
                price: car.price,
                image: car.images?.[0],
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleSave}
                disabled={isSaving}
                className={`p-3 bg-surface border border-medium rounded-xl hover:border-ferrari-red transition-all group ${isSaving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                title={isSaved ? "Hiq nga të ruajturat" : "Ruaj makinën"}
            >
                <Heart
                    size={20}
                    className={`transition-colors ${isSaved
                        ? 'fill-ferrari-red text-ferrari-red'
                        : 'text-muted group-hover:text-ferrari-red'
                        }`}
                />
            </button>
        );
    }

    return (
        <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isSaved
                ? 'bg-ferrari-red text-white hover:bg-ferrari-dark'
                : 'bg-surface-2 text-secondary hover:bg-ferrari-red hover:text-white border border-medium'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Heart size={18} className={isSaved ? 'fill-white' : ''} />
            <span>{isSaved ? 'E ruajtur' : 'Ruaj'}</span>
        </button>
    );
}