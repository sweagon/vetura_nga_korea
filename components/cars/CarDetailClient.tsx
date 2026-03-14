// components/cars/CarDetailClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/lib/ConfigContext';
import { type Car, formatMileage } from '@/lib/api';
import { translateFuel, translateTransmission, translateColor } from '@/lib/translations';
// import CarSpecs from '@/components/cars/CarSpecs';
import {
    Calendar,
    Gauge,
    Fuel,
    Settings,
    MapPin,
    Phone,
    Mail,
    Building2,
    Database,
    Hash,
    Tag,
    AlertCircle,
    ArrowLeft,
    Car as CarIcon
} from 'lucide-react';
import Link from 'next/link';
import RecentlyViewedTracker from '@/components/cars/RecentlyViewedTracker';
import ImageGallery from './ImageGallery';
import CarDetailTabs from './CarDetailTabs';


interface CarDetailClientProps {
    car: Car;
}

export function CarDetailClient({ car }: CarDetailClientProps) {
    const { config, formatPrice, calculateFinalPrice, getVehicleTypeLabel } = useConfig();
    const [mounted, setMounted] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Safely access nested properties
    const lot = car.lots?.[0];
    const price = lot?.price_with_margin_and_kosovo || lot?.step5 || lot?.buy_now || 0;
    const mileage = lot?.odometer?.km || 0;

    // Filter valid images
    const images = lot?.images?.big || lot?.images?.normal || [];
    const validImages = images.filter(img => img && typeof img === 'string');

    const location = lot?.location?.city?.name || 'Korea';
    const lotNumber = lot?.lot || null;

    const manufacturerName = car.manufacturer?.name || 'Makina';
    const modelName = car.model?.name || '';
    const carTitle = car.title || `${manufacturerName} ${modelName}`.trim() || 'Makina pa emër';

    // Get vehicle type from car data - THIS IS THE KEY FIX
    // The API returns body_type.name which could be "Suv", "Sedan", etc.
    const rawBodyType = car.body_type?.name || '';

    // Normalize to lowercase for comparison with config keys
    const vehicleType = rawBodyType.toLowerCase();

    // Check if this vehicle type exists in our config and is enabled
    const hasTypeConfig = vehicleType &&
        Object.keys(config.vehicleTypes).includes(vehicleType) &&
        config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes]?.enabled;

    // Use the vehicle type if available and enabled, otherwise use 'default'
    const effectiveVehicleType = hasTypeConfig ? vehicleType : 'default';

    // Calculate price details with the correct vehicle type
    const priceDetails = mounted ? calculateFinalPrice(price, effectiveVehicleType) : {
        basePrice: price,
        shippingCost: config.shippingCost,
        shippingToPristina: config.shippingToPristina,
        finalPrice: price + config.shippingCost + config.shippingToPristina,
        vehicleTypeUsed: effectiveVehicleType
    };

    // For display, use the original API name with proper capitalization
    const displayBodyType = rawBodyType
        ? rawBodyType.charAt(0).toUpperCase() + rawBodyType.slice(1).toLowerCase()
        : null;

    // Check if we have essential data
    const hasEssentialData = car.manufacturer?.name || car.model?.name || car.year;

    // During SSR or before mount, show a simpler version
    if (!mounted) {
        return (
            <main className="min-h-screen bg-primary">
                <div className="container-swiss py-8 lg:py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-surface-2 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-surface-2 rounded w-1/2 mb-8"></div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="h-96 bg-surface-2 rounded-xl mb-8"></div>
                                <div className="grid grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-24 bg-surface-2 rounded-xl"></div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-64 bg-surface-2 rounded-xl"></div>
                                <div className="h-48 bg-surface-2 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // Error state if car data is invalid
    if (!car || !car.manufacturer) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="text-center">
                    <CarIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-primary mb-2">Makina nuk u gjet</h2>
                    <p className="text-secondary mb-6">Nuk mund të ngarkohen detajet e makinës.</p>
                    <Link href="/cars" className="btn-primary">
                        Kthehu te Makinat
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <RecentlyViewedTracker car={car} />
            <main className="min-h-screen bg-primary">
                {/* Breadcrumb */}
                <div className="border-b border-light bg-surface/80 sticky top-4 z-sticky backdrop-blur-sm z-10">
                    <div className="container-swiss py-3">
                        <nav className="flex items-center gap-2 text-sm flex-wrap" aria-label="Breadcrumb">
                            <Link href="/" className="text-muted hover:text-orange-500 transition focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded">
                                {config.siteName}
                            </Link>
                            <span className="text-muted" aria-hidden="true">/</span>
                            <Link href="/cars" className="text-muted hover:text-orange-500 transition focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded">
                                Makina
                            </Link>
                            {car.manufacturer?.id && (
                                <>
                                    <span className="text-muted" aria-hidden="true">/</span>
                                    <Link
                                        href={`/cars?manufacturer_id=${car.manufacturer.id}`}
                                        className="text-muted hover:text-orange-500 transition focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded"
                                    >
                                        {car.manufacturer.name}
                                    </Link>
                                </>
                            )}
                            {car.model?.name && (
                                <>
                                    <span className="text-muted" aria-hidden="true">/</span>
                                    <span className="text-orange-500" aria-current="page">
                                        {car.model.name}
                                    </span>
                                </>
                            )}
                        </nav>
                    </div>
                </div>

                <div className="container-swiss py-8 lg:py-12">
                    {/* Title Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">{carTitle}</h1>
                        <div className="flex items-center gap-4 text-sm text-muted flex-wrap">
                            <span className="flex items-center gap-1">
                                <MapPin size={16} className="shrink-0" />
                                {location}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted" aria-hidden="true" />
                            <span className="badge badge-success">Në dispozicion</span>

                            {/* Vehicle Type Badge */}
                            {/* {displayBodyType && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted" aria-hidden="true" />
                                    <span className="flex items-center gap-1">
                                        <CarIcon size={14} className="shrink-0" />
                                        {displayBodyType}
                                        {hasTypeConfig && (
                                            <span className="text-xs bg-orange-100 text-orange-500 px-1.5 py-0.5 rounded-full ml-1">
                                                Aktive
                                            </span>
                                        )}
                                    </span>
                                </>
                            )} */}

                            {lotNumber && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted" aria-hidden="true" />
                                    <span className="flex items-center gap-1">
                                        <Hash size={14} className="shrink-0" />
                                        Lot: {lotNumber}
                                    </span>
                                </>
                            )}
                            {car.vin && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted" aria-hidden="true" />
                                    <span className="flex items-center gap-1 font-mono text-xs">
                                        VIN: {car.vin}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Warning for incomplete data */}
                    {!hasEssentialData && (
                        <div className="mb-8 p-4 bg-warning-bg border border-warning-border rounded-lg flex items-center gap-3">
                            <AlertCircle size={20} className="text-warning-text shrink-0" />
                            <p className="text-sm text-warning-text">
                                Disa të dhëna të makinës nuk janë të plota. Informacioni mund të jetë i paplotë.
                            </p>
                        </div>
                    )}

                    {/* Main Grid */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Images & Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Gallery */}
                            <div className="card overflow-hidden">
                                <ImageGallery images={images} carName={carTitle} />
                                {imageLoadError && validImages.length === 0 && (
                                    <div className="text-xs text-warning-text text-center py-2 bg-warning-bg">
                                        Some images could not be loaded
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="card p-4 text-center">
                                    <div className="text-2xl font-semibold text-orange-500 mb-1">
                                        {formatPrice(priceDetails.basePrice + priceDetails.shippingCost)}
                                    </div>
                                    <div className="text-xs text-muted">Çmimi me transport</div>
                                </div>
                                <div className="card p-4 text-center">
                                    <div className="text-2xl font-semibold text-primary mb-1">
                                        {car.year || 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted">Viti</div>
                                </div>
                                <div className="card p-4 text-center">
                                    <div className="text-2xl font-semibold text-primary mb-1">
                                        {formatMileage(mileage)}
                                    </div>
                                    <div className="text-xs text-muted">Kilometrazha</div>
                                </div>
                                <div className="card p-4 text-center">
                                    <div className="text-2xl font-semibold text-primary mb-1">
                                        {car.fuel?.name ? translateFuel(car.fuel.name) : 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted">Karburanti</div>
                                </div>
                            </div>

                            {/* Key Features */}
                            <div className="card p-6">
                                <h2 className="text-lg font-semibold mb-4">Karakteristikat kryesore</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {car.year && (
                                        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                            <Calendar size={20} className="text-orange-500 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted">Viti</p>
                                                <p className="font-medium text-primary truncate">{car.year}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                        <Gauge size={20} className="text-orange-500 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted">Kilometrazha</p>
                                            <p className="font-medium text-primary truncate">{formatMileage(mileage)}</p>
                                        </div>
                                    </div>
                                    {car.fuel?.name && (
                                        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                            <Fuel size={20} className="text-orange-500 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted">Karburanti</p>
                                                <p className="font-medium text-primary truncate">{translateFuel(car.fuel.name)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {car.transmission?.name && (
                                        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                            <Settings size={20} className="text-orange-500 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted">Transmisioni</p>
                                                <p className="font-medium text-primary truncate">{translateTransmission(car.transmission.name)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {car.engine?.name && (
                                        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                            <Database size={20} className="text-orange-500 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted">Motori</p>
                                                <p className="font-medium text-primary truncate">{car.engine.name}</p>
                                            </div>
                                        </div>
                                    )}
                                    {car.color?.name && (
                                        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                            <Tag size={20} className="text-orange-500 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted">Ngjyra</p>
                                                <p className="font-medium text-primary truncate">{translateColor(car.color.name)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-8">
                                <CarDetailTabs car={car} />
                            </div>

                            {/* Full Specifications */}
                            {/* <CarSpecs car={car} /> */}
                        </div>

                        {/* Right Column - Contact */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                {/* Price Card */}
                                <div className="card p-6">
                                    <div className="text-3xl font-bold text-orange-500 mb-2">
                                        {formatPrice(priceDetails.finalPrice)}
                                    </div>

                                    {/* Vehicle Type Pricing Badge */}
                                    {displayBodyType && (
                                        <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 bg-orange-5 text-orange-500 rounded-lg text-xs">
                                            <CarIcon size={12} />
                                            <span>
                                                {hasTypeConfig
                                                    ? `Çmimi për ${displayBodyType} (i personalizuar)`
                                                    : `Çmimi për ${displayBodyType} (bazë)`}
                                            </span>
                                        </div>
                                    )}

                                    <p className="text-xs text-muted mb-4">
                                        Çmimi përfundimtar (përfshirë transportin dhe marzhën)
                                    </p>

                                    <div className="space-y-3">
                                        <div className="p-4 bg-surface-2 rounded-lg">
                                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                <Building2 size={18} className="text-orange-500 shrink-0" />
                                                Shitësi
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <p className="text-secondary">
                                                    veturakoreakosove
                                                </p>
                                                <p className="flex items-center gap-2 text-secondary hover:text-orange-500 transition-colors">
                                                    <Phone size={14} className="text-orange-500 shrink-0" />
                                                    <a href={`tel:${config.contactPhone}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded">
                                                        {config.contactPhone}
                                                    </a>
                                                </p>
                                                <p className="flex items-center gap-2 text-secondary hover:text-orange-500 transition-colors">
                                                    <Mail size={14} className="text-orange-500 shrink-0" />
                                                    <a href={`mailto:${config.contactEmail}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded">
                                                        {config.contactEmail}
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={`https://wa.me/${config.contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                                `Përshëndetje, jam i interesuar për makinën:\n\n` +
                                                `*${carTitle}*\n` +
                                                `🔗 Linku: ${typeof window !== 'undefined' ? window.location.href : ''}`
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary bg-green-500 hover:bg-green-600 w-full flex items-center justify-center gap-2"
                                        >
                                            WhatsApp
                                        </a>
                                        <a
                                            href={`mailto:${config.contactEmail}?subject=Interest in ${car.vin} - ${carTitle}`}
                                            className="btn-primary w-full"
                                        >
                                            Email
                                        </a>
                                    </div>
                                </div>

                                {/* Cost Estimate */}
                                <div className="card p-6">
                                    <h3 className="font-semibold mb-3">Shpenzime të përafërta</h3>
                                    <div className="space-y-2 text-sm">
                                        {/* Base Price (now includes Korea→Durrës shipping) */}
                                        <div className="flex justify-between">
                                            <span className="text-muted">Makina:</span>
                                            <span className="font-medium text-primary">
                                                {formatPrice(priceDetails.basePrice + priceDetails.shippingCost)}
                                            </span>
                                        </div>

                                        {/* Only show Prishtina shipping */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted">Transporti deri në Prishtinë:</span>
                                            <div className="text-right">
                                                <span className="font-medium text-primary block">
                                                    {formatPrice(priceDetails.shippingToPristina)}
                                                </span>
                                                <span className="text-xs text-orange-500">
                                                    Nga Durrësi në Prishtinë
                                                </span>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="border-t border-light my-2 pt-2">
                                            <div className="flex justify-between font-semibold">
                                                <span>Totali:</span>
                                                <span className="text-orange-500">
                                                    {formatPrice(priceDetails.finalPrice)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* VIN Quick Reference */}
                                <div className="card p-4 bg-surface-2/50">
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <CarIcon size={14} className="shrink-0" />
                                        <span className="truncate">VIN: {car.vin}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Link */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/cars"
                            className="inline-flex items-center gap-2 text-muted hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded-lg px-4 py-2"
                        >
                            <ArrowLeft size={16} />
                            Kthehu te të gjitha makinat
                        </Link>
                    </div>
                </div>
            </main >
        </>
    );
}