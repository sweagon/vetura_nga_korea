// components/cars/ComparisonTable.tsx
'use client';

import { useState } from 'react';
import {
    X, ChevronLeft, ChevronRight, Car as CarIcon,
    Fuel, Gauge, Calendar, Settings, Shield,
    Users, Palette, Wind, Maximize2, Award, Star
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Car {
    id: number;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    drivetrain?: string;
    displacement?: number;
    seatCount?: number;
    exteriorColor?: string;
    images?: string[];
    warranty?: {
        bodyMonth?: number;
        bodyMileage?: number;
        transmissionMonth?: number;
        transmissionMileage?: number;
    };
    [key: string]: any;
}

interface ComparisonTableProps {
    cars: Car[];
    onRemove?: (carId: number) => void;
    onRemoveAll?: () => void;
}

export default function ComparisonTable({ cars, onRemove, onRemoveAll }: ComparisonTableProps) {
    const router = useRouter();
    const [selectedCar, setSelectedCar] = useState<number | null>(null);
    const [highlightDiff, setHighlightDiff] = useState(true);
    const [removingId, setRemovingId] = useState<number | null>(null);

    if (!cars || cars.length === 0) return null;

    const getValue = (car: Car, key: string): any => {
        return key.split('.').reduce((obj: any, k) => obj?.[k], car);
    };

    const formatValue = (key: string, value: any): string => {
        if (value === undefined || value === null) return 'N/A';

        switch (key) {
            case 'price':
                return `€${value.toLocaleString()}`;
            case 'mileage':
                return `${value.toLocaleString()} km`;
            case 'fuelType':
                return value === 'Diesel' ? 'Naftë' :
                    value === 'Gasoline' ? 'Benzinë' :
                        value === 'Electric' ? 'Elektrik' :
                            value === 'Hybrid' ? 'Hibrid' : value;
            case 'transmission':
                return value === 'Automatic' ? 'Automatik' :
                    value === 'Manual' ? 'Manuel' : value;
            case 'drivetrain':
                return value === 'FWD' ? 'Para' :
                    value === 'RWD' ? 'Pasme' :
                        value === 'AWD' ? '4x4' :
                            value === '4WD' ? '4x4' : value || 'N/A';
            case 'displacement':
                return value ? `${value} cm³` : 'N/A';
            case 'warranty':
                return value?.bodyMonth ? `${value.bodyMonth} muaj` : 'N/A';
            default:
                return value?.toString() || 'N/A';
        }
    };

    const isValueSame = (key: string): boolean => {
        const values = cars.map(car => {
            const val = getValue(car, key);
            return key === 'warranty' ? val?.bodyMonth : val;
        });
        return values.every(v => v === values[0]);
    };

    const getBestValue = (key: string): any => {
        const values = cars.map(car => getValue(car, key)).filter(v => v !== undefined && v !== null);
        if (values.length === 0) return null;

        switch (key) {
            case 'price':
                return Math.min(...values);
            case 'year':
                return Math.max(...values);
            case 'mileage':
                return Math.min(...values);
            default:
                return null;
        }
    };

    const handleRemove = async (carId: number) => {
        setRemovingId(carId);
        if (onRemove) {
            onRemove(carId);
        } else {
            // Fallback to localStorage
            const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
            const updated = compareList.filter((id: number) => id !== carId);
            localStorage.setItem('compareList', JSON.stringify(updated));
            router.refresh();
        }
        setTimeout(() => setRemovingId(null), 300);
    };

    const handleRemoveAll = () => {
        if (onRemoveAll) {
            onRemoveAll();
        } else {
            localStorage.removeItem('compareList');
            router.refresh();
        }
    };

    const bestPrice = getBestValue('price');
    const bestYear = getBestValue('year');
    const bestMileage = getBestValue('mileage');

    const specs = [
        { icon: Calendar, label: 'Viti', key: 'year', highlight: true },
        { icon: Gauge, label: 'Kilometrazha', key: 'mileage', highlight: true },
        { icon: Fuel, label: 'Karburanti', key: 'fuelType' },
        { icon: Settings, label: 'Transmisioni', key: 'transmission' },
        { icon: Wind, label: 'Lëvizja', key: 'drivetrain' },
        { icon: Maximize2, label: 'Kubikazha', key: 'displacement' },
        { icon: Users, label: 'Vendet', key: 'seatCount' },
        { icon: Palette, label: 'Ngjyra', key: 'exteriorColor' },
        { icon: Shield, label: 'Garancia', key: 'warranty' },
    ];

    return (
        <div className="space-y-8">
            {/* Header with controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-primary">Krahasimi i makinave</h2>
                    <button
                        onClick={() => setHighlightDiff(!highlightDiff)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${highlightDiff
                                ? 'bg-ferrari-red text-white shadow-md hover:bg-ferrari-dark'
                                : 'bg-surface-2 text-secondary hover:bg-ferrari-red/10 hover:text-ferrari-red border border-medium'
                            }`}
                    >
                        {highlightDiff ? '🎯 Thekso dallimet' : '📊 Pamje normale'}
                    </button>
                </div>
                <p className="text-sm text-muted bg-surface-2 px-4 py-2 rounded-full">
                    Duke krahasuar <span className="text-ferrari-red font-semibold">{cars.length}</span> makina
                </p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-medium shadow-sm">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-medium">
                        <thead className="bg-secondary">
                            <tr>
                                <th scope="col" className="py-5 px-6 text-left text-sm font-medium text-muted w-48">
                                    Specifikimet
                                </th>
                                {cars.map((car, index) => (
                                    <th
                                        key={index}
                                        scope="col"
                                        className={`px-6 py-5 text-center min-w-[280px] relative group transition-all duration-300 ${removingId === car.id ? 'opacity-50 scale-95' : ''
                                            }`}
                                    >
                                        <Link href={`/cars/${car.id}`} className="block hover:opacity-90 transition">
                                            {/* Car Image */}
                                            <div className="relative h-32 bg-surface-2 rounded-xl mb-3 overflow-hidden">
                                                {car.images && car.images[0] ? (
                                                    <img
                                                        src={car.images[0]}
                                                        alt={`${car.make} ${car.model}`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <CarIcon size={32} className="text-muted" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Car Title */}
                                            <h3 className="font-bold text-primary hover:text-ferrari-red transition">
                                                {car.make} {car.model}
                                            </h3>
                                            <p className="text-sm text-muted mt-1">{car.year}</p>

                                            {/* Price */}
                                            <p className="text-xl font-bold text-ferrari-red mt-2">
                                                €{car.price?.toLocaleString()}
                                            </p>
                                        </Link>

                                        {/* Remove button */}
                                        <button
                                            onClick={() => handleRemove(car.id)}
                                            disabled={removingId === car.id}
                                            className="absolute top-2 right-2 p-2 bg-surface rounded-full shadow-md 
                                                     hover:bg-error-bg hover:scale-110 transition-all duration-200 
                                                     opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                            title="Hiq nga krahasimi"
                                        >
                                            <X size={14} className="text-error-text" />
                                        </button>

                                        {/* Rank badge (optional) */}
                                        {index === 0 && (
                                            <div className="absolute top-2 left-2 bg-ferrari-red text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
                                                #1 Zgjedhja
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-medium bg-surface">
                            {specs.map((spec, idx) => {
                                const Icon = spec.icon;
                                const isSame = isValueSame(spec.key);
                                const shouldHighlight = highlightDiff && !isSame;

                                return (
                                    <tr
                                        key={idx}
                                        className={`transition-colors duration-300 ${shouldHighlight ? 'bg-warning-bg/30' : 'hover:bg-surface-2/50'
                                            }`}
                                    >
                                        <td className="py-4 px-6 text-sm font-medium text-primary whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Icon size={16} className="text-ferrari-red" />
                                                <span>{spec.label}</span>
                                            </div>
                                        </td>
                                        {cars.map((car, carIdx) => {
                                            const value = getValue(car, spec.key);
                                            const formatted = formatValue(spec.key, value);

                                            let isBest = false;
                                            if (spec.highlight) {
                                                if (spec.key === 'price' && value === bestPrice) isBest = true;
                                                if (spec.key === 'year' && value === bestYear) isBest = true;
                                                if (spec.key === 'mileage' && value === bestMileage) isBest = true;
                                            }

                                            return (
                                                <td
                                                    key={carIdx}
                                                    className={`py-4 px-6 text-sm text-center whitespace-nowrap relative ${shouldHighlight ? 'font-medium text-primary' : 'text-secondary'
                                                        }`}
                                                >
                                                    <span className={isBest ? 'text-success-text font-bold' : ''}>
                                                        {formatted}
                                                    </span>
                                                    {isBest && (
                                                        <span className="absolute -top-1 -right-1">
                                                            <span className="flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-bg opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-success-bg"></span>
                                                            </span>
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View - Card based comparison */}
            <div className="lg:hidden space-y-4">
                {cars.map((car, index) => (
                    <div
                        key={index}
                        className={`bg-surface rounded-2xl border border-medium overflow-hidden transition-all duration-300 ${removingId === car.id ? 'opacity-50 scale-95' : ''
                            }`}
                    >
                        {/* Car Header */}
                        <div className="bg-gradient-to-r from-surface-2 to-surface p-4 border-b border-medium">
                            <div className="flex items-start justify-between gap-4">
                                <Link href={`/cars/${car.id}`} className="flex-1">
                                    <h3 className="font-bold text-lg text-primary">{car.make} {car.model}</h3>
                                    <p className="text-sm text-muted">{car.year}</p>
                                    <p className="text-2xl font-bold text-ferrari-red mt-2">
                                        €{car.price?.toLocaleString()}
                                    </p>
                                </Link>
                                <button
                                    onClick={() => handleRemove(car.id)}
                                    disabled={removingId === car.id}
                                    className="p-2 hover:bg-error-bg rounded-full transition-colors shrink-0"
                                >
                                    <X size={18} className="text-error-text" />
                                </button>
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="p-4 grid grid-cols-2 gap-3">
                            {specs.map((spec, idx) => {
                                const Icon = spec.icon;
                                const value = getValue(car, spec.key);
                                const formatted = formatValue(spec.key, value);

                                return (
                                    <div key={idx} className="bg-surface-2 p-3 rounded-xl border border-medium">
                                        <div className="flex items-center gap-2 text-ferrari-red mb-1">
                                            <Icon size={14} />
                                            <span className="text-xs text-muted">{spec.label}</span>
                                        </div>
                                        <p className="text-sm font-medium text-primary">{formatted}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Compare more CTA */}
            {cars.length < 3 && (
                <div className="bg-gradient-to-r from-ferrari-red/5 to-transparent rounded-2xl p-8 text-center border border-ferrari-red/20">
                    <div className="w-16 h-16 bg-ferrari-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CarIcon size={32} className="text-ferrari-red" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-2">
                        Dëshironi të krahasoni më shumë makina?
                    </h3>
                    <p className="text-secondary mb-6 max-w-md mx-auto">
                        Mund të krahasoni deri në 3 makina njëherësh për të gjetur makinën ideale për ju.
                    </p>
                    <Link
                        href="/cars"
                        className="inline-flex items-center gap-2 bg-ferrari-red text-white px-6 py-3 rounded-xl font-medium hover:bg-ferrari-dark transition-all shadow-md hover:shadow-lg"
                    >
                        Shfleto makina të tjera
                        <ChevronRight size={18} />
                    </Link>
                </div>
            )}

            {/* Remove all button */}
            {cars.length > 0 && (
                <div className="flex justify-end border-t border-medium pt-6">
                    <button
                        onClick={handleRemoveAll}
                        className="group flex items-center gap-2 px-4 py-2 text-sm text-error-text hover:bg-error-bg rounded-lg transition-all"
                    >
                        <X size={16} className="group-hover:scale-110 transition" />
                        Hiq të gjitha nga krahasimi
                    </button>
                </div>
            )}
        </div>
    );
}