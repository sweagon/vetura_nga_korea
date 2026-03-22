'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/lib/ConfigContext';
import {
    type Car,
    formatMileage,
    getRawKoreanPrice,
    getOldSitePrice
} from '@/lib/api';
import { translateFuel, translateTransmission, translateColor } from '@/lib/translations';
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
    Car as CarIcon,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff
} from 'lucide-react';
import Link from 'next/link';
import RecentlyViewedTracker from '@/components/cars/RecentlyViewedTracker';
import ImageGallery from './ImageGallery';
import CarDetailTabs from './CarDetailTabs';
import { VehicleTypeConfig } from '@/lib/config';

interface CarDetailClientProps {
    car: Car;
}

// Helper function to map body types to our vehicle type IDs
const getVehicleTypeId = (bodyTypeName: string): string => {
    const typeMap: Record<string, string> = {
        // Standard types
        'sedan': 'sedan',
        'suv': 'suv',
        'hatchback': 'hatchback',
        'wagon': 'wagon',
        'coupe': 'coupe',
        'van': 'van',
        'pickup': 'pickup',
        'sport_car': 'sport_car',

        // Variations
        'hatch': 'hatchback',
        'hatch back': 'hatchback',
        '5 door': 'hatchback',
        '3 door': 'hatchback',
        '5dr': 'hatchback',
        '3dr': 'hatchback',

        // Specific models
        'gti': 'hatchback',
        'golf': 'hatchback',
        'focus': 'hatchback',
        'civic': 'sedan',
        'passat': 'sedan',
        'tiguan': 'suv',
        'touareg': 'suv',
        'q5': 'suv',
        'q7': 'suv',
        'x5': 'suv',
        'x3': 'suv',
        'a4': 'sedan',
        'a6': 'sedan',
        'a3': 'hatchback',
        '1 series': 'hatchback',
        '3 series': 'sedan',
        '5 series': 'sedan'
    };

    const normalized = bodyTypeName?.toLowerCase().trim() || '';

    // Check exact match first
    if (typeMap[normalized]) {
        return typeMap[normalized];
    }

    // Check partial match
    for (const [key, value] of Object.entries(typeMap)) {
        if (normalized.includes(key)) {
            return value;
        }
    }

    return 'default';
};

export function CarDetailClient({ car }: CarDetailClientProps) {
    const { config, formatPrice } = useConfig();
    const [mounted, setMounted] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);
    const [rawPrice, setRawPrice] = useState(0);
    const [loadingPrice, setLoadingPrice] = useState(true);
    const [shippingCost, setShippingCost] = useState(0);
    const [marginAmount, setMarginAmount] = useState(0);
    const [marginPercentage, setMarginPercentage] = useState(0);
    const [showTransportSeparately, setShowTransportSeparately] = useState(false);
    const [detectedVehicleType, setDetectedVehicleType] = useState<string>('default');

    useEffect(() => {
        setMounted(true);
        const savedPreference = localStorage.getItem('showTransportSeparately');
        if (savedPreference !== null) {
            setShowTransportSeparately(savedPreference === 'true');
        }
    }, []);

    const lot = car.lots?.[0];

    // Improved vehicle type detection
    const rawBodyType = car.body_type?.name || car.vehicle_type?.name || '';
    const vehicleType = getVehicleTypeId(rawBodyType);

    // Also check the model name for better detection
    const modelName = car.model?.name?.toLowerCase() || '';
    const modelBasedType = getVehicleTypeId(modelName);

    // Use the most specific detection (body type has priority, then model name)
    const finalVehicleType = vehicleType !== 'default' ? vehicleType : modelBasedType;

    useEffect(() => {
        setDetectedVehicleType(finalVehicleType);
    }, [finalVehicleType]);

    // Check if vehicle type exists in config and is enabled for custom shipping
    const hasTypeConfig = finalVehicleType !== 'default' &&
        config.vehicleTypes &&
        Object.prototype.hasOwnProperty.call(config.vehicleTypes, finalVehicleType) &&
        (config.vehicleTypes[finalVehicleType as keyof typeof config.vehicleTypes] as VehicleTypeConfig | undefined)?.enabled === true;

    // Get shipping cost (vehicle-specific or global)
    const getShippingCost = () => {
        if (hasTypeConfig && config.vehicleTypes) {
            const typeConfig = config.vehicleTypes[finalVehicleType as keyof typeof config.vehicleTypes] as VehicleTypeConfig | undefined;
            if (typeConfig?.enabled && typeConfig.shippingCost) {
                console.log(`✅ Using ${finalVehicleType} shipping: ${typeConfig.shippingCost}€`);
                return typeConfig.shippingCost;
            }
        }
        console.log(`⚠️ Using global shipping: ${config.shippingCost}€ (${finalVehicleType} not enabled)`);
        return config.shippingCost;
    };

    // Calculate prices
    useEffect(() => {
        if (lot && config) {
            setLoadingPrice(true);
            try {
                const baseRawPrice = getRawKoreanPrice(lot) || 0;
                setRawPrice(baseRawPrice);

                if (baseRawPrice > 0) {
                    const shipping = getShippingCost();
                    const marginPercent = config.defaultMarginPercentage;
                    const minMargin = config.defaultMinimumMargin;

                    const calculatedMargin = Math.round(baseRawPrice * (marginPercent / 100));
                    const finalMarginAmount = Math.max(calculatedMargin, minMargin);

                    setShippingCost(shipping);
                    setMarginAmount(finalMarginAmount);
                    setMarginPercentage(marginPercent);

                    console.log('💰 Price Calculation:', {
                        carTitle: car.title,
                        rawBodyType,
                        detectedType: finalVehicleType,
                        hasTypeConfig,
                        rawPrice: baseRawPrice,
                        shippingCost: shipping,
                        marginPercentage: marginPercent,
                        marginAmount: finalMarginAmount,
                        pristina: config.shippingToPristina,
                        finalPrice: baseRawPrice + shipping + finalMarginAmount + config.shippingToPristina
                    });
                } else {
                    const competitorPrice = getOldSitePrice(lot);
                    if (competitorPrice > 0) {
                        const estimatedRawPrice = competitorPrice - 3500 - 350;
                        setRawPrice(estimatedRawPrice);
                        setShippingCost(config.shippingCost);
                        setMarginAmount(0);
                        setMarginPercentage(config.defaultMarginPercentage);
                    }
                }
            } catch (error) {
                console.error('Error calculating price:', error);
            } finally {
                setLoadingPrice(false);
            }
        }
    }, [lot, config, finalVehicleType, hasTypeConfig, car.title, rawBodyType]);

    const toggleTransportDisplay = () => {
        const newValue = !showTransportSeparately;
        setShowTransportSeparately(newValue);
        localStorage.setItem('showTransportSeparately', String(newValue));
    };

    const mileage = lot?.odometer?.km || 0;
    const images = lot?.images?.big || lot?.images?.normal || [];
    const validImages = images.filter(img => img && typeof img === 'string');
    const location = lot?.location?.city?.name || 'Korea';
    const lotNumber = lot?.lot || null;
    const manufacturerName = car.manufacturer?.name || 'Makina';
    const modelNameDisplay = car.model?.name || '';
    const carTitle = car.title || `${manufacturerName} ${modelNameDisplay}`.trim() || 'Makina pa emër';

    // Calculate final price
    const priceWithDurresShipping = rawPrice + shippingCost;
    const finalPrice = priceWithDurresShipping + marginAmount + (config.shippingToPristina || 350);

    const displayBodyType = rawBodyType
        ? rawBodyType.charAt(0).toUpperCase() + rawBodyType.slice(1).toLowerCase()
        : null;

    const hasEssentialData = car.manufacturer?.name || car.model?.name || car.year;

    // Don't show margin if it's 0%
    const shouldShowMargin = marginAmount > 0;

    // During SSR or before mount, show skeleton
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
                        {/* Debug info - remove in production */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-2 text-xs text-muted">
                                🚗 Detected type: {detectedVehicleType} |
                                Body: {rawBodyType || 'N/A'} |
                                Shipping: {hasTypeConfig ? `${shippingCost}€ (custom)` : `${shippingCost}€ (global)`}
                            </div>
                        )}
                    </div>

                    {!hasEssentialData && (
                        <div className="mb-8 p-4 bg-warning-bg border border-warning-border rounded-lg flex items-center gap-3">
                            <AlertCircle size={20} className="text-warning-text shrink-0" />
                            <p className="text-sm text-warning-text">
                                Disa të dhëna të makinës nuk janë të plota. Informacioni mund të jetë i paplotë.
                            </p>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="card overflow-hidden">
                                <ImageGallery images={images} carName={carTitle} />
                                {imageLoadError && validImages.length === 0 && (
                                    <div className="text-xs text-warning-text text-center py-2 bg-warning-bg">
                                        Some images could not be loaded
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="card p-4 text-center">
                                    <div className="text-2xl font-semibold text-orange-500 mb-1">
                                        {formatPrice(priceWithDurresShipping)}
                                    </div>
                                    <div className="text-xs text-muted">Çmimi me transport deri në Durrës</div>
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
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                <div className="card p-6">
                                    <div className="text-3xl font-bold text-orange-500 mb-2">
                                        {formatPrice(finalPrice)}
                                    </div>

                                    {displayBodyType && hasTypeConfig && (
                                        <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 bg-orange-5 text-orange-500 rounded-lg text-xs">
                                            <CarIcon size={12} />
                                            <span>Transporti i personalizuar për {displayBodyType}</span>
                                        </div>
                                    )}

                                    <p className="text-xs text-muted mb-4">
                                        Çmimi përfundimtar (përfshirë transportin detar dhe tokësor)
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

                                        {/* Toggle Button for Transport Display */}
                                        <button
                                            onClick={toggleTransportDisplay}
                                            className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <span className="text-sm text-white/70 flex items-center gap-2">
                                                {showTransportSeparately ? <Eye size={14} /> : <EyeOff size={14} />}
                                                {showTransportSeparately ? 'Fshi detajet e transportit' : 'Shfaq detajet e transportit'}
                                            </span>
                                        </button>

                                        {/* Price Breakdown - Only show if toggled on */}
                                        {showTransportSeparately && (
                                            <div className="p-4 bg-white/5 rounded-lg space-y-2 text-sm">
                                                <h4 className="font-medium text-white mb-2">Detajet e çmimit:</h4>

                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Çmimi bazë (Korea):</span>
                                                    <span className="text-white">{formatPrice(rawPrice)}</span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Transporti detar (Korea → Durrës):</span>
                                                    <span className="text-white">{formatPrice(shippingCost)}</span>
                                                </div>

                                                {shouldShowMargin && (
                                                    <div className="flex justify-between">
                                                        <span className="text-white/60">Marzha jonë ({marginPercentage}%):</span>
                                                        <span className="text-white">{formatPrice(marginAmount)}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Transporti tokësor (Durrës → Prishtinë):</span>
                                                    <span className="text-white">{formatPrice(config.shippingToPristina || 350)}</span>
                                                </div>

                                                <div className="border-t border-white/10 my-2 pt-2">
                                                    <div className="flex justify-between font-bold">
                                                        <span>Totali:</span>
                                                        <span className="text-orange-500">{formatPrice(finalPrice)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <a
                                            href={`https://wa.me/${config.contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                                `Përshëndetje, jam i interesuar për makinën:\n\n` +
                                                `*${carTitle}*\n` +
                                                `💰 Çmimi: ${formatPrice(finalPrice)}\n` +
                                                `🔗 Linku: ${typeof window !== 'undefined' ? window.location.href : ''}`
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary bg-green-500 hover:bg-green-600 w-full flex items-center justify-center gap-2"
                                        >
                                            WhatsApp
                                        </a>
                                        <a
                                            href={`mailto:${config.contactEmail}?subject=Interest in ${car.vin} - ${carTitle}&body=I'm interested in this car: ${carTitle}\nPrice: ${formatPrice(finalPrice)}\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`}
                                            className="btn-primary w-full"
                                        >
                                            Email
                                        </a>
                                    </div>
                                </div>

                                {/* Simplified Cost Estimate */}
                                <div className="card p-6">
                                    <h3 className="font-semibold mb-3">Shpenzime të përafërta</h3>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted">Makina (përfshirë transportin detar):</span>
                                            <span className="font-medium text-primary">{formatPrice(priceWithDurresShipping)}</span>
                                        </div>

                                        {shouldShowMargin && (
                                            <div className="flex justify-between">
                                                <span className="text-muted">Marzha jonë ({marginPercentage}%):</span>
                                                <span className="font-medium text-primary">{formatPrice(marginAmount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <span className="text-muted">Transporti Prishtinë:</span>
                                            <span className="font-medium text-primary">{formatPrice(config.shippingToPristina || 350)}</span>
                                        </div>

                                        <div className="border-t border-light my-2 pt-2">
                                            <div className="flex justify-between font-semibold">
                                                <span>Totali:</span>
                                                <span className="text-orange-500">{formatPrice(finalPrice)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card p-4 bg-surface-2/50">
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <CarIcon size={14} className="shrink-0" />
                                        <span className="truncate">VIN: {car.vin}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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
            </main>
        </>
    );
}