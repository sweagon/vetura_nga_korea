// app/cars/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getCarByVin, formatPrice, formatMileage, extractVinFromParam } from '@/lib/api';
import { translateFuel, translateTransmission, translateColor } from '@/lib/translations';
import { Metadata } from 'next';
import ImageGallery from '@/components/cars/ImageGallery';
import CarSpecs from '@/components/cars/CarSpecs';
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
    Car
} from 'lucide-react';
import Link from 'next/link';
import RecentlyViewedTracker from '@/components/cars/RecentlyViewedTracker';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const { id } = await params;
        const vin = extractVinFromParam(id);
        const car = await getCarByVin(vin);

        if (!car) {
            return {
                title: 'Makina nuk u gjet | Vetura Nga Korea',
            };
        }

        const lot = car.lots?.[0];
        const price = lot?.buy_now || 0;
        const mileage = lot?.odometer?.km || 0;

        const manufacturerName = car.manufacturer?.name || 'Makina';
        const modelName = car.model?.name || '';

        return {
            title: `${manufacturerName} ${modelName} ${car.year || ''} | Vetura Nga Korea`,
            description: `${manufacturerName} ${modelName} ${car.year || ''} me ${formatMileage(mileage)}. Çmimi: ${formatPrice(price)}`,
            openGraph: {
                title: `${manufacturerName} ${modelName} ${car.year || ''}`,
                description: `${manufacturerName} ${modelName} ${car.year || ''} - ${formatPrice(price)}`,
                images: lot?.images?.normal?.[0] ? [lot.images.normal[0]] : [],
            },
        };
    } catch (error) {
        return {
            title: 'Makina nuk u gjet | Vetura Nga Korea',
        };
    }
}

export default async function CarDetailPage({ params }: PageProps) {
    try {
        const { id } = await params;
        const vin = extractVinFromParam(id);
        const car = await getCarByVin(vin);

        if (!car) {
            notFound();
        }

        // Safely access nested properties
        const lot = car.lots?.[0];
        const price = lot?.buy_now || 0;
        const mileage = lot?.odometer?.km || 0;
        const images = lot?.images?.big || lot?.images?.normal || [];
        const location = lot?.location?.city?.name || 'Korea';
        const lotNumber = lot?.lot || null;

        const manufacturerName = car.manufacturer?.name || 'Makina';
        const modelName = car.model?.name || '';
        const carTitle = car.title || `${manufacturerName} ${modelName}`.trim() || 'Makina pa emër';

        // Check if we have essential data
        const hasEssentialData = car.manufacturer?.name || car.model?.name || car.year;

        return (
            <>
                <RecentlyViewedTracker car={car} />
                <main className="min-h-screen bg-primary">
                    {/* Breadcrumb */}
                    <div className="border-b border-light bg-surface/80 sticky top-18 z-sticky backdrop-blur-sm">
                        <div className="container-swiss py-3">
                            <nav className="flex items-center gap-2 text-sm flex-wrap" aria-label="Breadcrumb">
                                <Link href="/" className="text-muted hover:text-orange-primary transition focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded">
                                    Vetura Nga Korea
                                </Link>
                                <span className="text-muted" aria-hidden="true">/</span>
                                <Link href="/cars" className="text-muted hover:text-orange-primary transition focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded">
                                    Makina
                                </Link>
                                {car.manufacturer?.id && (
                                    <>
                                        <span className="text-muted" aria-hidden="true">/</span>
                                        <Link
                                            href={`/cars?manufacturer_id=${car.manufacturer.id}`}
                                            className="text-muted hover:text-orange-primary transition focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded"
                                        >
                                            {car.manufacturer.name}
                                        </Link>
                                    </>
                                )}
                                {car.model?.name && (
                                    <>
                                        <span className="text-muted" aria-hidden="true">/</span>
                                        <span className="text-orange-primary" aria-current="page">
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
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="card p-4 text-center">
                                        <div className="text-2xl font-semibold text-orange-primary mb-1">
                                            {formatPrice(price)}
                                        </div>
                                        <div className="text-xs text-muted">Çmimi</div>
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
                                                <Calendar size={20} className="text-orange-primary shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted">Viti</p>
                                                    <p className="font-medium text-primary truncate">{car.year}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                            <Gauge size={20} className="text-orange-primary shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted">Kilometrazha</p>
                                                <p className="font-medium text-primary truncate">{formatMileage(mileage)}</p>
                                            </div>
                                        </div>
                                        {car.fuel?.name && (
                                            <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                                <Fuel size={20} className="text-orange-primary shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted">Karburanti</p>
                                                    <p className="font-medium text-primary truncate">{translateFuel(car.fuel.name)}</p>
                                                </div>
                                            </div>
                                        )}
                                        {car.transmission?.name && (
                                            <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                                <Settings size={20} className="text-orange-primary shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted">Transmisioni</p>
                                                    <p className="font-medium text-primary truncate">{translateTransmission(car.transmission.name)}</p>
                                                </div>
                                            </div>
                                        )}
                                        {car.engine?.name && (
                                            <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                                <Database size={20} className="text-orange-primary shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted">Motori</p>
                                                    <p className="font-medium text-primary truncate">{car.engine.name}</p>
                                                </div>
                                            </div>
                                        )}
                                        {car.color?.name && (
                                            <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                                                <Tag size={20} className="text-orange-primary shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted">Ngjyra</p>
                                                    <p className="font-medium text-primary truncate">{translateColor(car.color.name)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Full Specifications */}
                                <CarSpecs car={car} />
                            </div>

                            {/* Right Column - Contact */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-24 space-y-4">
                                    {/* Price Card */}
                                    <div className="card p-6">
                                        <div className="text-3xl font-bold text-orange-primary mb-2">
                                            {formatPrice(price)}
                                        </div>
                                        <p className="text-sm text-muted mb-4 flex items-center gap-1">
                                            <MapPin size={14} className="shrink-0" />
                                            Çmimi në {location}
                                        </p>

                                        <div className="space-y-3">
                                            <div className="p-4 bg-surface-2 rounded-lg">
                                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                    <Building2 size={18} className="text-orange-primary shrink-0" />
                                                    Shitësi
                                                </h3>
                                                <div className="space-y-2 text-sm">
                                                    <p className="text-secondary">
                                                        Auto Korea Kosova Import
                                                    </p>
                                                    <p className="flex items-center gap-2 text-secondary hover:text-orange-primary transition-colors">
                                                        <Phone size={14} className="text-orange-primary shrink-0" />
                                                        <a href="tel:+38344123456" className="hover:underline focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded">
                                                            +383 44 123 456
                                                        </a>
                                                    </p>
                                                    <p className="flex items-center gap-2 text-secondary hover:text-orange-primary transition-colors">
                                                        <Mail size={14} className="text-orange-primary shrink-0" />
                                                        <a href="mailto:info@vetura-nga-korea.com" className="hover:underline focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded">
                                                            info@vetura-nga-korea.com
                                                        </a>
                                                    </p>
                                                </div>
                                            </div>

                                            <a
                                                href={`mailto:info@vetura-nga-korea.com?subject=Interest in ${car.vin} - ${carTitle}`}
                                                className="btn-primary w-full"
                                            >
                                                Kontakto shitësin
                                            </a>
                                        </div>
                                    </div>

                                    {/* Cost Estimate */}
                                    <div className="card p-6">
                                        <h3 className="font-semibold mb-3">Shpenzime të përafërta</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted">Makina:</span>
                                                <span className="font-medium text-primary">{formatPrice(price)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted">Transporti & taksa:</span>
                                                <span className="font-medium text-primary">~€3,500</span>
                                            </div>
                                            <div className="border-t border-light my-2 pt-2">
                                                <div className="flex justify-between font-semibold">
                                                    <span>Totali:</span>
                                                    <span className="text-orange-primary">
                                                        {formatPrice(price + 3500)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* VIN Quick Reference */}
                                    <div className="card p-4 bg-surface-2/50">
                                        <div className="flex items-center gap-2 text-xs text-muted">
                                            <Car size={14} className="shrink-0" />
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
                                className="inline-flex items-center gap-2 text-muted hover:text-orange-primary transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded-lg px-4 py-2"
                            >
                                <ArrowLeft size={16} />
                                Kthehu te të gjitha makinat
                            </Link>
                        </div>
                    </div>
                </main>
            </>
        );
    } catch (error) {
        console.error('Error in CarDetailPage:', error);
        notFound();
    }
}