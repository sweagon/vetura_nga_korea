'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/lib/ConfigContext';
import { type Car, formatMileage, getVehicleTypeFromBodyName, getLotLocationName } from '@/lib/api';
import { calculateFinalPriceWithConfig, type PriceDetails } from '@/lib/pricing';
import { translateFuel, translateTransmission, translateColor } from '@/lib/translations';
import {
    Calendar, Gauge, Fuel, Settings, MapPin, Phone, Mail,
    Building2, Database, Hash, Tag, ArrowLeft, Car as CarIcon,
    Eye, EyeOff
} from 'lucide-react';
import Link from 'next/link';
import RecentlyViewedTracker from '@/components/cars/RecentlyViewedTracker';
import ImageGallery from './ImageGallery';
import CarDetailTabs from './CarDetailTabs';
import PriceBreakdown from './PriceBreakdown';
import DownloadPdfButton, { type PdfCarData } from './DownloadPdfButton';
import { VehicleTypeConfig } from '@/lib/config';

interface CarDetailClientProps {
    car: Car;
    photosLoading?: boolean;
}

export function CarDetailClient({ car, photosLoading }: CarDetailClientProps) {
    const { config, formatPrice } = useConfig();
    const [mounted, setMounted] = useState(false);
    const [priceDetails, setPriceDetails] = useState<PriceDetails | null>(null);
    const [showTransportSeparately, setShowTransportSeparately] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedPreference = localStorage.getItem('showTransportSeparately');
        if (savedPreference !== null) {
            setShowTransportSeparately(savedPreference === 'true');
        }
    }, []);

    const lot = car.lots?.[0];
    const rawBodyType = car.body_type?.name || '';
    const vehicleType = getVehicleTypeFromBodyName(rawBodyType);

    const hasTypeConfig = vehicleType !== 'default' &&
        config.vehicleTypes &&
        Object.prototype.hasOwnProperty.call(config.vehicleTypes, vehicleType) &&
        (config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes] as VehicleTypeConfig | undefined)?.enabled === true;

    const isPriceLoading = !priceDetails && mounted && !!lot;

    useEffect(() => {
        if (lot && config) {
            const det = calculateFinalPriceWithConfig(lot, config, vehicleType);
            setPriceDetails(det);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lot?.lot, config, vehicleType, hasTypeConfig]);

    const toggleTransportDisplay = () => {
        const newValue = !showTransportSeparately;
        setShowTransportSeparately(newValue);
        localStorage.setItem('showTransportSeparately', String(newValue));
    };

    const mileage = lot?.odometer?.km || 0;
    const images = lot?.images?.big || lot?.images?.normal || [];
    const validImages = images.filter(img => img && typeof img === 'string');
    const location = getLotLocationName(lot);
    const lotNumber = lot?.lot || null;
    const manufacturerName = car.manufacturer?.name || 'Makina';
    const modelName = car.model?.name || '';
    const carTitle = car.title || `${manufacturerName} ${modelName}`.trim() || 'Makina pa emër';

    // Provider-rich data surfaced on the page
    const listing = car.listing;
    const plate = listing?.plate || car.encar_details?.full?.plate || null;
    const region = car.encar_details?.full?.region || car.encar_details?.full?.dealer_region || null;

    const realPrice = priceDetails?.basePrice ?? 0;
    const shippingCost = priceDetails?.shippingCost ?? 0;
    const marginAmount = priceDetails?.marginAmount ?? 0;
    const marginPercentage = priceDetails?.marginPercentage ?? 0;
    const finalPrice = priceDetails?.finalPrice ?? 0;
    const priceWithDurresShipping = realPrice + shippingCost;

    const displayBodyType = rawBodyType
        ? rawBodyType.charAt(0).toUpperCase() + rawBodyType.slice(1).toLowerCase()
        : null;

    // PDF-friendly snapshot of everything we surface about the car.
    const pdfData: PdfCarData = {
        carId: String(car.id),
        siteName: config.siteName,
        contactPhone: config.contactPhone,
        contactEmail: config.contactEmail,
        carTitle,
        year: car.year || null,
        mileageKm: mileage,
        location: location || '',
        vin: car.vin || null,
        lot: lotNumber || null,
        description: (lot as any)?.details?.description_en || (lot as any)?.details?.description_ko || undefined,
        specs: [
            { label: 'Viti', value: car.year ? String(car.year) : 'N/A' },
            { label: 'Kilometrazha', value: formatMileage(mileage) },
            ...(car.fuel?.name ? [{ label: 'Karburanti', value: translateFuel(car.fuel.name) }] : []),
            ...(car.transmission?.name ? [{ label: 'Transmisioni', value: translateTransmission(car.transmission.name) }] : []),
            ...(car.engine?.name ? [{ label: 'Motori', value: car.engine.name }] : []),
            ...(car.color?.name ? [{ label: 'Ngjyra', value: translateColor(car.color.name) }] : []),
            ...(displayBodyType ? [{ label: 'Karroceria', value: displayBodyType }] : []),
        ],
        priceRows: priceDetails
            ? [
                  { label: 'Çmimi bazë (Korea):', value: formatPrice(priceDetails.basePrice) },
                  { label: 'Transporti detar (Korea - Durrës):', value: formatPrice(priceDetails.shippingCost) },
                  ...(priceDetails.marginAmount > 0
                      ? [{ label: `Marzha jonë (${priceDetails.marginPercentage}%):`, value: formatPrice(priceDetails.marginAmount) }]
                      : []),
                  { label: 'Transporti tokësor (Durrës - Prishtinë):', value: formatPrice(priceDetails.shippingToPristina) },
                  { label: 'Totali:', value: formatPrice(priceDetails.finalPrice), bold: true, accent: true },
              ]
            : [],
        images: validImages,
    };

    if (!mounted || isPriceLoading) {
        return (
            <main className="min-h-screen bg-bg-primary">
                <div className="container-swiss py-8 lg:py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-surface-2 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-surface-2 rounded w-1/2 mb-8"></div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="h-96 bg-surface-2 rounded-xl mb-8"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-64 bg-surface-2 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!car || !car.manufacturer) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="text-center">
                    <CarIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Makina nuk u gjet</h2>
                    <p className="text-text-secondary mb-6">Nuk mund të ngarkohen detajet e makinës.</p>
                    <Link href="/cars" className="btn-primary">Kthehu te Makinat</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <RecentlyViewedTracker car={car} />
            <main className="min-h-screen bg-bg-primary">
                <div className="border-b border-border-light bg-surface/80 sticky top-4 backdrop-blur-sm z-10">
                    <div className="container-swiss py-3">
                        <nav className="flex items-center gap-2 text-sm flex-wrap">
                            <Link href="/" className="text-muted hover:text-orange-500 transition">
                                {config.siteName}
                            </Link>
                            <span className="text-muted">/</span>
                            <Link href="/cars" className="text-muted hover:text-orange-500 transition">
                                Makina
                            </Link>
                            {car.manufacturer?.id && (
                                <>
                                    <span className="text-muted">/</span>
                                    <Link href={`/cars?manufacturer_id=${car.manufacturer.id}`} className="text-muted hover:text-orange-500 transition">
                                        {car.manufacturer.name}
                                    </Link>
                                </>
                            )}
                            {car.model?.name && (
                                <>
                                    <span className="text-muted">/</span>
                                    <span className="text-orange-500">{car.model.name}</span>
                                </>
                            )}
                        </nav>
                    </div>
                </div>

                <div className="container-swiss py-8 lg:py-12">
                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">{carTitle}</h1>
                        <div className="flex items-center gap-4 text-sm text-muted flex-wrap">
                            <span className="flex items-center gap-1">
                                <MapPin size={16} />
                                {location}
                            </span>
                            {region && <span className="text-xs text-muted">({region})</span>}
                            <span className="w-1 h-1 rounded-full bg-muted" />
                            <span className="badge badge-success">Në dispozicion</span>
                            {lotNumber && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted" />
                                    <span className="flex items-center gap-1">
                                        <Hash size={14} />
                                        Lot: {lotNumber}
                                    </span>
                                </>
                            )}
                            {plate && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted" />
                                    <span className="flex items-center gap-1 font-mono text-xs">
                                        Targa: {plate}
                                    </span>
                                </>
                            )}
                            {car.vin && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted" />
                                    <span className="flex items-center gap-1 font-mono text-xs">
                                        VIN: {car.vin}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Condition summary badges */}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="card overflow-hidden">
                                <ImageGallery images={images} carName={carTitle} carId={String(car.id)} loading={photosLoading} />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="card p-4 text-center">
                                    <div className="text-2xl font-semibold text-orange-500 mb-1">
                                        {formatPrice(priceWithDurresShipping)}
                                    </div>
                                    <div className="text-xs text-muted">Çmimi me transport deri në Durrës</div>
                                </div>
                                <div className="card p-4 text-center">
                                    <div className="text-2xl font-semibold text-text-primary mb-1">
                                        {car.year || 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted">Viti</div>
                                </div>
                                <div className="card p-4 text-center">
                                    <div className="text-2xl font-semibold text-text-primary mb-1">
                                        {formatMileage(mileage)}
                                    </div>
                                    <div className="text-xs text-muted">Kilometrazha</div>
                                </div>
                                <div className="card p-4 text-center">
                                    <div className="text-2xl font-semibold text-text-primary mb-1">
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
                                            <Calendar size={20} className="text-orange-500" />
                                            <div>
                                                <p className="text-xs text-muted">Viti</p>
                                                <p className="font-medium text-text-primary">{car.year}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                        <Gauge size={20} className="text-orange-500" />
                                        <div>
                                            <p className="text-xs text-muted">Kilometrazha</p>
                                            <p className="font-medium text-text-primary">{formatMileage(mileage)}</p>
                                        </div>
                                    </div>
                                    {car.fuel?.name && (
                                        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                            <Fuel size={20} className="text-orange-500" />
                                            <div>
                                                <p className="text-xs text-muted">Karburanti</p>
                                                <p className="font-medium text-text-primary">{translateFuel(car.fuel.name)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {car.transmission?.name && (
                                        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                            <Settings size={20} className="text-orange-500" />
                                            <div>
                                                <p className="text-xs text-muted">Transmisioni</p>
                                                <p className="font-medium text-text-primary">{translateTransmission(car.transmission.name)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {car.engine?.name && (
                                        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                            <Database size={20} className="text-orange-500" />
                                            <div>
                                                <p className="text-xs text-muted">Motori</p>
                                                <p className="font-medium text-text-primary">{car.engine.name}</p>
                                            </div>
                                        </div>
                                    )}
                                    {car.color?.name && (
                                        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                            <Tag size={20} className="text-orange-500" />
                                            <div>
                                                <p className="text-xs text-muted">Ngjyra</p>
                                                <p className="font-medium text-text-primary">{translateColor(car.color.name)}</p>
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
                                        <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-500 rounded-lg text-xs">
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
                                                <Building2 size={18} className="text-orange-500" />
                                                Shitësi
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <p className="text-text-secondary">veturakoreakosove</p>
                                                <p className="flex items-center gap-2 text-text-secondary hover:text-orange-500 transition-colors">
                                                    <Phone size={14} className="text-orange-500" />
                                                    <a href={`tel:${config.contactPhone}`}>{config.contactPhone}</a>
                                                </p>
                                                <p className="flex items-center gap-2 text-text-secondary hover:text-orange-500 transition-colors">
                                                    <Mail size={14} className="text-orange-500" />
                                                    <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={toggleTransportDisplay}
                                            className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <span className="text-sm text-white/70 flex items-center gap-2">
                                                {showTransportSeparately ? <Eye size={14} /> : <EyeOff size={14} />}
                                                {showTransportSeparately ? 'Fshi detajet e transportit' : 'Shfaq detajet e transportit'}
                                            </span>
                                        </button>

                                        {showTransportSeparately && (
                                            <div className="p-4 bg-white/5 rounded-lg space-y-2 text-sm">
                                                <h4 className="font-medium text-white mb-2">Detajet e çmimit:</h4>
                                                <PriceBreakdown priceDetails={priceDetails} formatPrice={formatPrice} variant="details" />
                                            </div>
                                        )}

                                        <a
                                            href={`https://wa.me/${config.contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                                `Përshëndetje, jam i interesuar për makinën:\n\n${carTitle}\n💰 Çmimi: ${formatPrice(finalPrice)}\n🔗 Linku: ${typeof window !== 'undefined' ? window.location.href : ''}`
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary bg-green-500 hover:bg-green-600 w-full flex items-center justify-center gap-2"
                                        >
                                            WhatsApp
                                        </a>
                                        <a
                                            href={`mailto:${config.contactEmail}?subject=Interest in ${car.vin || car.id} - ${carTitle}`}
                                            className="btn-primary w-full"
                                        >
                                            Email
                                        </a>
                                        <DownloadPdfButton
                                            data={pdfData}
                                            className="btn-primary bg-blue-600 hover:bg-blue-500 w-full flex items-center justify-center gap-2"
                                        />
                                    </div>
                                </div>

                                <div className="card p-6">
                                    <h3 className="font-semibold mb-3">Shpenzime të përafërta</h3>
                                    <PriceBreakdown priceDetails={priceDetails} formatPrice={formatPrice} variant="expenses" />
                                </div>

                                <div className="card p-4 bg-surface-2/50">
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <CarIcon size={14} />
                                        <span className="truncate">VIN: {car.vin || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/cars" className="inline-flex items-center gap-2 text-muted hover:text-orange-500 transition-colors">
                            <ArrowLeft size={16} />
                            Kthehu te të gjitha makinat
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
