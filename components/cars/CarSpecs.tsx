// components/cars/CarSpecs.tsx - FIXED
'use client';

import { useState, useEffect } from 'react';
import { type Car, getFuelTypeAlbanian, getTransmissionAlbanian, getColorAlbanian, formatMileage } from '@/lib/api';

interface CarSpecsProps {
    car: Car;
}

export default function CarSpecs({ car }: CarSpecsProps) {
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering on client after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    const lot = car.lots?.[0];
    const mileage = lot?.odometer?.km || 0;
    const location = lot?.location?.city?.name || 'N/A';

    const specs = [
        { label: 'Marka', value: car.manufacturer?.name || 'N/A' },
        { label: 'Modeli', value: car.model?.name || 'N/A' },
        { label: 'Viti', value: car.year || 'N/A' },
        { label: 'Kilometrazha', value: mounted ? formatMileage(mileage) : '...' }, // Show loading during SSR
        { label: 'Karburanti', value: getFuelTypeAlbanian(car.fuel?.name || '') },
        { label: 'Transmisioni', value: getTransmissionAlbanian(car.transmission?.name || '') },
        { label: 'Motori', value: car.engine?.name || 'N/A' },
        { label: 'Fuqia', value: car.hp ? `${car.hp} hp` : 'N/A' },
        { label: 'Ngjyra', value: getColorAlbanian(car.color?.name || '') },
        { label: 'Vendi', value: location },
        { label: 'VIN', value: car.vin || 'N/A' },
    ];

    return (
        <div className="bg-surface rounded-2xl p-6 border border-medium shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-primary">Specifikimet e plota</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specs.map((spec, index) => (
                    <div key={index} className="flex justify-between p-3 bg-surface-2 rounded-lg">
                        <span className="text-muted">{spec.label}:</span>
                        <span className="font-medium text-primary">
                            {!mounted && spec.label === 'Kilometrazha' ? '...' : spec.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}