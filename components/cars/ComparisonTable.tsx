'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Car as CarIcon, Fuel, Gauge, Calendar, Settings, Shield, Users, Palette, Wind, Maximize2, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
}

export default function ComparisonTable({ cars }: ComparisonTableProps) {
    const [selectedCar, setSelectedCar] = useState<number | null>(null);
    const [highlightDiff, setHighlightDiff] = useState(true);

    if (!cars || cars.length === 0) return null;

    // Helper function to get value with fallback
    const getValue = (car: Car, key: string): any => {
        return key.split('.').reduce((obj: any, k) => obj?.[k], car);
    };

    // Helper function to format values
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

    // Check if a value is the same across all cars
    const isValueSame = (key: string): boolean => {
        const values = cars.map(car => {
            const val = getValue(car, key);
            return key === 'warranty' ? val?.bodyMonth : val;
        });
        return values.every(v => v === values[0]);
    };

    // Get best value for comparison
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Krahasimi i makinave</h2>
                    <button
                        onClick={() => setHighlightDiff(!highlightDiff)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${highlightDiff
                                ? 'bg-ferrari-red text-white'
                                : 'bg-secondary text-gray-600 hover:bg-tertiary'
                            }`}
                    >
                        {highlightDiff ? '🎯 Thekso dallimet' : '📊 Pamje normale'}
                    </button>
                </div>
                <p className="text-sm text-gray-500">
                    Duke krahasuar {cars.length} makina
                </p>
            </div>

            {/* Mobile/Desktop view - Card based for mobile, table for desktop */}
            <div className="hidden lg:block overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden rounded-2xl border border-theme">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-secondary">
                                <tr>
                                    <th scope="col" className="py-4 px-6 text-left text-sm font-medium text-gray-500 w-48">
                                        Specifikimet
                                    </th>
                                    {cars.map((car, index) => (
                                        <th key={index} scope="col" className="px-6 py-4 text-center min-w-[280px] relative group">
                                            <Link href={`/cars/${car.id}`} className="block hover:opacity-90 transition">
                                                {/* Car Image */}
                                                <div className="relative h-32 bg-secondary rounded-lg mb-3 overflow-hidden">
                                                    {car.images && car.images[0] ? (
                                                        <img
                                                            src={car.images[0]}
                                                            alt={`${car.make} ${car.model}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <CarIcon size={32} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Car Title */}
                                                <h3 className="font-bold text-gray-900 hover:text-ferrari-red transition">
                                                    {car.make} {car.model}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">{car.year}</p>

                                                {/* Price */}
                                                <p className="text-xl font-bold text-ferrari-red mt-2">
                                                    €{car.price?.toLocaleString()}
                                                </p>
                                            </Link>

                                            {/* Remove button */}
                                            <button
                                                onClick={() => {
                                                    const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
                                                    const updated = compareList.filter((id: number) => id !== car.id);
                                                    localStorage.setItem('compareList', JSON.stringify(updated));
                                                    window.location.reload();
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-surface rounded-full shadow-md hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                                                title="Hiq nga krahasimi"
                                            >
                                                <X size={14} className="text-red-500" />
                                            </button>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-surface">
                                {specs.map((spec, idx) => {
                                    const Icon = spec.icon;
                                    const isSame = isValueSame(spec.key);
                                    const shouldHighlight = highlightDiff && !isSame;

                                    return (
                                        <tr key={idx} className={shouldHighlight ? 'bg-amber-50/50' : ''}>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Icon size={16} className="text-ferrari-red" />
                                                    {spec.label}
                                                </div>
                                            </td>
                                            {cars.map((car, carIdx) => {
                                                const value = getValue(car, spec.key);
                                                const formatted = formatValue(spec.key, value);

                                                // Check if this is the best value
                                                let isBest = false;
                                                if (spec.highlight) {
                                                    if (spec.key === 'price' && value === bestPrice) isBest = true;
                                                    if (spec.key === 'year' && value === bestYear) isBest = true;
                                                    if (spec.key === 'mileage' && value === bestMileage) isBest = true;
                                                }

                                                return (
                                                    <td key={carIdx} className="py-4 px-6 text-sm text-gray-600 text-center whitespace-nowrap relative">
                                                        <span className={`
                                                            ${shouldHighlight ? 'font-medium' : ''}
                                                            ${isBest ? 'text-green-600 font-bold' : ''}
                                                        `}>
                                                            {formatted}
                                                        </span>
                                                        {isBest && (
                                                            <span className="absolute -top-1 -right-1">
                                                                <span className="flex h-3 w-3">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
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
            </div>

            {/* Mobile View - Card based comparison */}
            <div className="lg:hidden space-y-6">
                {cars.map((car, index) => (
                    <div key={index} className="bg-surface rounded-2xl border border-theme overflow-hidden">
                        {/* Car Header */}
                        <div className="bg-gradient-to-r from-secondary to-surface p-4 border-b">
                            <div className="flex items-start justify-between">
                                <Link href={`/cars/${car.id}`} className="flex-1">
                                    <h3 className="font-bold text-lg">{car.make} {car.model}</h3>
                                    <p className="text-sm text-gray-500">{car.year}</p>
                                    <p className="text-2xl font-bold text-ferrari-red mt-2">
                                        €{car.price?.toLocaleString()}
                                    </p>
                                </Link>
                                <button
                                    onClick={() => {
                                        const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
                                        const updated = compareList.filter((id: number) => id !== car.id);
                                        localStorage.setItem('compareList', JSON.stringify(updated));
                                        window.location.reload();
                                    }}
                                    className="p-2 hover:bg-red-50 rounded-full transition"
                                >
                                    <X size={18} className="text-red-500" />
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
                                    <div key={idx} className="bg-secondary p-3 rounded-lg">
                                        <div className="flex items-center gap-2 text-ferrari-red mb-1">
                                            <Icon size={14} />
                                            <span className="text-xs text-gray-500">{spec.label}</span>
                                        </div>
                                        <p className="text-sm font-medium">{formatted}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Compare more CTA */}
            {cars.length < 3 && (
                <div className="bg-gradient-to-r from-ferrari-red/5 to-transparent rounded-2xl p-6 text-center border border-ferrari-red/20">
                    <h3 className="font-semibold mb-2">Dëshironi të krahasoni më shumë makina?</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Mund të krahasoni deri në 3 makina njëherësh.
                    </p>
                    <Link
                        href="/cars"
                        className="inline-flex items-center gap-2 text-ferrari-red font-medium hover:underline"
                    >
                        Shfleto makina të tjera
                        <ChevronRight size={16} />
                    </Link>
                </div>
            )}

            {/* Remove all button */}
            {cars.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            localStorage.removeItem('compareList');
                            window.location.reload();
                        }}
                        className="text-sm text-red-500 hover:text-red-700 transition flex items-center gap-1"
                    >
                        <X size={14} />
                        Hiq të gjitha nga krahasimi
                    </button>
                </div>
            )}
        </div>
    );
}