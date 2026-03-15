#!/bin/bash

echo "🚀 FIXING PRICING TO MATCH API EXACTLY"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Backup function
backup_file() {
    local file=$1
    cp "$file" "$file.backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "${GREEN}✅ Backed up $file${NC}"
}

echo ""
echo "📁 Step 1: Updating exchange rates in lib/priceCalculator.ts"
echo "-----------------------------------------------------------"

if [ -f "lib/priceCalculator.ts" ]; then
    backup_file "lib/priceCalculator.ts"
    
    # Update the exchange rates to match API
    cat > lib/priceCalculator.ts << 'EOF'
// lib/priceCalculator.ts
import { Lot } from './api';

export interface CalculatedPrice {
    basePriceEur: number;
    exchangeRate: {
        usdToEur: number;
        krwToEur: number;
    };
    source: 'original_price' | 'buy_now' | 'api_price' | 'fallback';
    originalCurrency: 'KRW' | 'USD' | 'EUR' | 'N/A';
    originalAmount: number;
}

// API's actual exchange rates (from debug data)
// API uses: 6.28 per 10,000 KRW = 0.000628
const API_KRW_TO_EUR = 0.000628; // Exactly what API uses
const API_USD_TO_EUR = 0.93; // Approximate

export async function calculateBasePriceInEUR(lot: Lot | undefined): Promise<CalculatedPrice> {
    if (!lot) {
        return {
            basePriceEur: 0,
            exchangeRate: { usdToEur: API_USD_TO_EUR, krwToEur: API_KRW_TO_EUR },
            source: 'fallback',
            originalCurrency: 'N/A',
            originalAmount: 0
        };
    }

    // PRIORITY 1: Use API's pre-calculated price if available (matches other site)
    if (lot.price_with_margin_and_kosovo) {
        return {
            basePriceEur: lot.price_with_margin_and_kosovo,
            exchangeRate: { usdToEur: API_USD_TO_EUR, krwToEur: API_KRW_TO_EUR },
            source: 'api_price',
            originalCurrency: 'EUR',
            originalAmount: lot.price_with_margin_and_kosovo
        };
    }

    if (lot.step5) {
        return {
            basePriceEur: lot.step5,
            exchangeRate: { usdToEur: API_USD_TO_EUR, krwToEur: API_KRW_TO_EUR },
            source: 'api_price',
            originalCurrency: 'EUR',
            originalAmount: lot.step5
        };
    }

    // PRIORITY 2: original_price in KRW with API's exact rate
    if (lot.details?.original_price) {
        const basePriceEur = Math.round(lot.details.original_price * API_KRW_TO_EUR);
        return {
            basePriceEur,
            exchangeRate: { usdToEur: API_USD_TO_EUR, krwToEur: API_KRW_TO_EUR },
            source: 'original_price',
            originalCurrency: 'KRW',
            originalAmount: lot.details.original_price
        };
    }

    // PRIORITY 3: buy_now in USD
    if (lot.buy_now) {
        const basePriceEur = Math.round(lot.buy_now * API_USD_TO_EUR);
        return {
            basePriceEur,
            exchangeRate: { usdToEur: API_USD_TO_EUR, krwToEur: API_KRW_TO_EUR },
            source: 'buy_now',
            originalCurrency: 'USD',
            originalAmount: lot.buy_now
        };
    }

    // Fallback
    return {
        basePriceEur: 0,
        exchangeRate: { usdToEur: API_USD_TO_EUR, krwToEur: API_KRW_TO_EUR },
        source: 'fallback',
        originalCurrency: 'N/A',
        originalAmount: 0
    };
}

// For client-side caching
let cachedRates = { usdToEur: API_USD_TO_EUR, krwToEur: API_KRW_TO_EUR };

export async function getCachedExchangeRates(): Promise<{ usdToEur: number; krwToEur: number }> {
    return cachedRates;
}

// Synchronous version for backward compatibility
export function getBasePriceInEUR(lot: Lot | undefined): number {
    if (!lot) return 0;
    
    if (lot.price_with_margin_and_kosovo) {
        return lot.price_with_margin_and_kosovo;
    }
    
    if (lot.step5) {
        return lot.step5;
    }
    
    if (lot.details?.original_price) {
        return Math.round(lot.details.original_price * API_KRW_TO_EUR);
    }
    
    if (lot.buy_now) {
        return Math.round(lot.buy_now * API_USD_TO_EUR);
    }
    
    return 0;
}
EOF
    echo -e "${GREEN}✅ Updated lib/priceCalculator.ts with API's exact exchange rates${NC}"
else
    echo -e "${RED}❌ lib/priceCalculator.ts not found${NC}"
fi

echo ""
echo "📁 Step 2: Updating lib/api.ts with price priority"
echo "--------------------------------------------------"

if [ -f "lib/api.ts" ]; then
    backup_file "lib/api.ts"
    
    # Append/update the price functions
    cat >> lib/api.ts << 'EOF'

// ============ FIXED PRICING FUNCTIONS ============
// These use API's exact exchange rates and prioritize API pre-calculated prices

const API_KRW_TO_EUR = 0.000628; // API's exact rate
const API_USD_TO_EUR = 0.93;

// Get the best price matching what other sites use
export function getApiPrice(lot: Lot | undefined): number {
    if (!lot) return 0;
    
    // Priority 1: Use API's pre-calculated price (matches other site)
    if (lot.price_with_margin_and_kosovo) {
        return lot.price_with_margin_and_kosovo;
    }
    
    // Priority 2: Use step5 (same as above)
    if (lot.step5) {
        return lot.step5;
    }
    
    // Priority 3: Calculate from original_price with API's rate
    if (lot.details?.original_price) {
        return Math.round(lot.details.original_price * API_KRW_TO_EUR);
    }
    
    // Priority 4: Calculate from buy_now
    if (lot.buy_now) {
        return Math.round(lot.buy_now * API_USD_TO_EUR);
    }
    
    return 0;
}

// Async version that matches API exactly
export async function getApiPriceAsync(lot: Lot | undefined): Promise<number> {
    return getApiPrice(lot);
}
EOF
    echo -e "${GREEN}✅ Updated lib/api.ts with priority pricing${NC}"
else
    echo -e "${RED}❌ lib/api.ts not found${NC}"
fi

echo ""
echo "📁 Step 3: Updating CarDetailClient.tsx to use API price"
echo "--------------------------------------------------------"

if [ -f "components/cars/CarDetailClient.tsx" ]; then
    backup_file "components/cars/CarDetailClient.tsx"
    
    # Create a modified version
    cat > components/cars/CarDetailClient.tsx.tmp << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/lib/ConfigContext';
import { type Car, formatMileage, getApiPrice } from '@/lib/api';
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
    const [apiPrice, setApiPrice] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Safely access nested properties
    const lot = car.lots?.[0];
    
    // Use API price immediately (matches other site)
    useEffect(() => {
        if (lot) {
            const price = getApiPrice(lot);
            setApiPrice(price);
            console.log('💰 Using API price:', price);
        }
    }, [lot]);

    const mileage = lot?.odometer?.km || 0;
    const images = lot?.images?.big || lot?.images?.normal || [];
    const validImages = images.filter(img => img && typeof img === 'string');
    const location = lot?.location?.city?.name || 'Korea';
    const lotNumber = lot?.lot || null;
    const manufacturerName = car.manufacturer?.name || 'Makina';
    const modelName = car.model?.name || '';
    const carTitle = car.title || `${manufacturerName} ${modelName}`.trim() || 'Makina pa emër';

    // Get vehicle type
    const rawBodyType = car.body_type?.name || '';
    const vehicleType = rawBodyType.toLowerCase();
    const hasTypeConfig = vehicleType &&
        Object.keys(config.vehicleTypes).includes(vehicleType) &&
        config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes]?.enabled;
    const effectiveVehicleType = hasTypeConfig ? vehicleType : 'default';

    // Calculate price details using API price as base
    const priceDetails = mounted ? calculateFinalPrice(apiPrice, effectiveVehicleType) : {
        basePrice: apiPrice,
        shippingCost: config.shippingCost,
        shippingToPristina: config.shippingToPristina,
        finalPrice: apiPrice + config.shippingCost + config.shippingToPristina,
        vehicleTypeUsed: effectiveVehicleType
    };

    const displayBodyType = rawBodyType
        ? rawBodyType.charAt(0).toUpperCase() + rawBodyType.slice(1).toLowerCase()
        : null;

    const hasEssentialData = car.manufacturer?.name || car.model?.name || car.year;

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
                                        {formatPrice(apiPrice)}
                                    </div>
                                    <div className="text-xs text-muted">Çmimi nga Korea</div>
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
                                        {formatPrice(priceDetails.finalPrice)}
                                    </div>

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
                                        Çmimi përfundimtar (përfshirë transportin në Prishtinë)
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

                                <div className="card p-6">
                                    <h3 className="font-semibold mb-3">Shpenzime të përafërta</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted">Makina (Korea):</span>
                                            <span className="font-medium text-primary">{formatPrice(apiPrice)}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-muted">Transporti deri në Prishtinë:</span>
                                            <div className="text-right">
                                                <span className="font-medium text-primary block">
                                                    {formatPrice(config.shippingToPristina)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t border-light my-2 pt-2">
                                            <div className="flex justify-between font-semibold">
                                                <span>Totali:</span>
                                                <span className="text-orange-500">
                                                    {formatPrice(apiPrice + config.shippingToPristina)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted mt-2">
                                            *Çmimi i makinës përfshin transportin detar Korea-Durrës
                                        </p>
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
EOF

    # Replace the original file
    mv components/cars/CarDetailClient.tsx.tmp components/cars/CarDetailClient.tsx
    echo -e "${GREEN}✅ Updated CarDetailClient.tsx to use API price${NC}"
else
    echo -e "${RED}❌ components/cars/CarDetailClient.tsx not found${NC}"
fi

echo ""
echo "📁 Step 4: Updating CarCard.tsx to use API price"
echo "------------------------------------------------"

if [ -f "components/cars/CarCard.tsx" ]; then
    backup_file "components/cars/CarCard.tsx"
    
    # Update the price section in CarCard
    sed -i 's/const price =.*/const [apiPrice, setApiPrice] = useState(0);\
    \
    useEffect(() => {\
        if (lot) {\
            const { getApiPrice } = require("@\/lib\/api");\
            setApiPrice(getApiPrice(lot));\
        }\
    }, [lot]);\
    \
    const finalPrice = apiPrice + (config?.shippingToPristina || 350);/g' components/cars/CarCard.tsx
    
    echo -e "${GREEN}✅ Updated CarCard.tsx to use API price${NC}"
else
    echo -e "${RED}❌ components/cars/CarCard.tsx not found${NC}"
fi

echo ""
echo "📁 Step 5: Creating debug script to verify prices"
echo "------------------------------------------------"

cat > scripts/verify-api-prices.js << 'EOF'
// scripts/verify-api-prices.js
const { getApiPrice } = require('../lib/api');

const VINS = [
    'SCBFT63W0GC057590', // Your test Bentley
    // Add more VINs as needed
];

async function verifyPrices() {
    console.log('🔍 Verifying API prices match other site\n');
    
    for (const vin of VINS) {
        try {
            const response = await fetch(`http://localhost:3000/api/proxy/vin/${vin}`);
            const car = await response.json();
            const lot = car.lots?.[0];
            
            if (!lot) continue;
            
            const ourPrice = getApiPrice(lot);
            
            console.log(`VIN: ${vin}`);
            console.log(`Car: ${car.manufacturer?.name} ${car.model?.name} ${car.year}`);
            console.log(`Our price: €${ourPrice.toLocaleString()}`);
            console.log(`API price_with_margin: €${lot.price_with_margin_and_kosovo?.toLocaleString()}`);
            console.log(`Match: ${ourPrice === lot.price_with_margin_and_kosovo ? '✅ YES' : '❌ NO'}`);
            console.log('-'.repeat(40));
        } catch (error) {
            console.error(`Error checking ${vin}:`, error.message);
        }
    }
}

verifyPrices();
EOF

echo -e "${GREEN}✅ Created scripts/verify-api-prices.js${NC}"

echo ""
echo "📁 Step 6: Summary of changes"
echo "=============================="
echo -e "${GREEN}✅ Fixed exchange rate to match API: 0.000628 (was 0.00068)${NC}"
echo -e "${GREEN}✅ Added priority to use price_with_margin_and_kosovo first${NC}"
echo -e "${GREEN}✅ Updated CarDetailClient to show correct breakdown${NC}"
echo -e "${GREEN}✅ Shipping now shown correctly:${NC}"
echo "   - Car price includes Korea→Durrës shipping"
echo "   - Only Prishtina shipping shown separately"
echo "   - Total matches API + Prishtina"

echo ""
echo "🚀 To apply changes and test:"
echo "=============================="
echo "1. npm run dev"
echo "2. Check a car page - price should now be ~€42,713 + €350 = €43,063"
echo "3. Run verification: node scripts/verify-api-prices.js"
echo ""
echo "The €24,316 difference should now be fixed! 🎉"