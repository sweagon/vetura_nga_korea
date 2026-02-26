// app/cars/[id]/page.tsx
import { notFound } from 'next/navigation';
import { fetchCarDetails } from '@/lib/api';
import ImageGallery from '@/components/cars/ImageGallery';
import CarSpecs from '@/components/cars/CarSpecs';
import CostCalculator from '@/components/cars/CostCalculator';
import ContactForm from '@/components/forms/ContactForm';
import SellerInfo from '@/components/cars/SellerInfo';
import WarrantyInfo from '@/components/cars/WarrantyInfo';
import SimilarCars from '@/components/cars/SimilarCars';
import WarrantyShowcase from '@/components/cars/WarrantyShowcase';
import DealerBadge from '@/components/cars/DealerBadge';
import PopularityMeter from '@/components/cars/PopularityMeter';
import QuickActions from '@/components/cars/QuickActions';
import {
    Heart,
    Share2,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    MessageCircle,
    Sparkles,
    Shield,
    Truck,
    FileCheck,
    Calendar,
    Gauge,
    Fuel,
    Settings,
    MapPin,
    Phone,
    Mail,
    Building2
} from 'lucide-react';
import Link from 'next/link';
import CompareButton from '@/components/cars/CompareButton';
import StructuredData from '@/components/seo/StructuredData';
import ShareButtons from '@/components/ui/ShareButtons';
import RecentlyViewedTracker from '@/components/cars/RecentlyViewedTracker';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function CarDetailPage({ params }: PageProps) {
    console.log('🚀 CarDetailPage started');
    console.log('📦 Environment:', process.env.NODE_ENV);
    console.log('🔑 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

    const { id } = await params;
    console.log('🔍 Looking for car with ID:', id);

    console.log('📞 Calling fetchCarDetails...');
    const car = await fetchCarDetails(id);
    console.log('📥 fetchCarDetails returned:', car ? 'Car found' : 'Car not found');

    if (car) {
        console.log('✅ Car details:', {
            id: car.id,
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
            hasImages: car.images?.length || 0
        });
    } else {
        console.log('❌ Car not found, calling notFound()');
        notFound();
    }

    return (
        <>
            <StructuredData
                type="car"
                data={{
                    id: car.id,
                    make: car.make,
                    model: car.model,
                    year: car.year,
                    price: car.price,
                    mileage: car.mileage,
                    fuelType: car.fuelType,
                    transmission: car.transmission,
                    exteriorColor: car.exteriorColor,
                    images: car.images,
                    description: car.description,
                    sellerName: car.sellerName
                }}
            />
            <StructuredData
                type="breadcrumb"
                breadcrumbs={[
                    { name: 'Ferrari Export', url: '/' },
                    { name: 'Makina', url: '/cars' },
                    { name: car.make, url: `/cars?make=${car.make}` },
                    { name: `${car.make} ${car.model}`, url: `/cars/${car.id}` }
                ]}
            />

            <RecentlyViewedTracker car={car} />

            <div className="min-h-screen bg-linear-to-b from-secondary to-primary">
                {/* Breadcrumb */}
                <div className="border-b border-medium bg-surface/80 backdrop-blur-sm sticky top-20 z-40">
                    <div className="container-custom py-3">
                        <div className="flex items-center text-sm">
                            <Link href="/" className="text-muted hover:text-ferrari-red transition flex items-center gap-1">
                                <span>Ferrari Export</span>
                            </Link>
                            <ChevronRight size={14} className="mx-2 text-muted" />
                            <Link href="/cars" className="text-muted hover:text-ferrari-red transition">Makina</Link>
                            <ChevronRight size={14} className="mx-2 text-muted" />
                            <Link href={`/cars?make=${car.make}`} className="text-muted hover:text-ferrari-red transition">{car.make}</Link>
                            <ChevronRight size={14} className="mx-2 text-muted" />
                            <span className="text-ferrari-red font-medium truncate max-w-50">{car.full_name}</span>
                        </div>
                    </div>
                </div>

                <div className="container-custom py-8 lg:py-12">
                    {/* Hero Section */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div>
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    {car.isFeatured && (
                                        <span className="bg-linear-to-r from-ferrari-red to-ferrari-dark text-white px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 shadow-md">
                                            <Sparkles size={14} />
                                            E zgjedhur
                                        </span>
                                    )}
                                    {car.sold ? (
                                        <span className="bg-error-bg text-error-text px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            E shitur
                                        </span>
                                    ) : (
                                        <span className="bg-success-bg text-success-text px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                                            <CheckCircle size={14} />
                                            Në dispozicion
                                        </span>
                                    )}
                                    <span className="text-muted text-xs px-4 py-1.5 bg-secondary rounded-full">
                                        ID: {car.car_id || car.id}
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                                    {car.full_name}
                                </h1>

                                {/* Quick location */}
                                <div className="flex items-center text-muted text-sm">
                                    <MapPin size={16} className="mr-1" />
                                    <span>Makina në Kore • Gati për import</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button className="p-3 bg-surface border border-medium rounded-xl hover:border-ferrari-red hover:text-ferrari-red transition-all group">
                                    <Heart size={20} className="text-muted group-hover:text-ferrari-red" />
                                </button>
                                <CompareButton car={{ id: car.id, make: car.make, model: car.model }} variant="icon" />
                                <ShareButtons
                                    url={`/cars/${car.id}`}
                                    title={`${car.make} ${car.model} ${car.year}`}
                                    description={`${car.make} ${car.model} - Viti: ${car.year}, Km: ${car.mileage?.toLocaleString()}, Çmimi: €${car.price?.toLocaleString()}`}
                                    size="md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Images & Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Image Gallery */}
                            <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-medium">
                                <ImageGallery images={car.images} carName={car.full_name} />
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-surface rounded-xl p-4 text-center border border-medium shadow-sm hover:shadow-md transition">
                                    <div className="text-2xl font-bold text-ferrari-red mb-1">
                                        €{car.price?.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted">Çmimi në Kore</div>
                                </div>
                                <div className="bg-surface rounded-xl p-4 text-center border border-medium shadow-sm hover:shadow-md transition">
                                    <div className="text-2xl font-bold text-primary mb-1">{car.year}</div>
                                    <div className="text-xs text-muted">Viti</div>
                                </div>
                                <div className="bg-surface rounded-xl p-4 text-center border border-medium shadow-sm hover:shadow-md transition">
                                    <div className="text-2xl font-bold text-primary mb-1">{car.mileage?.toLocaleString()} km</div>
                                    <div className="text-xs text-muted">Kilometrazha</div>
                                </div>
                                <div className="bg-surface rounded-xl p-4 text-center border border-medium shadow-sm hover:shadow-md transition">
                                    <div className="text-2xl font-bold text-primary mb-1">
                                        {car.fuelType === 'Diesel' ? 'Naftë' : car.fuelType}
                                    </div>
                                    <div className="text-xs text-muted">Karburanti</div>
                                </div>
                            </div>

                            {/* Warranty Showcase */}
                            {car.warranty && <WarrantyShowcase warranty={car.warranty} />}

                            {/* Popularity Meter - Fixed with null checks */}
                            {(car.viewCount && car.viewCount > 0) || (car.subscriberCount && car.subscriberCount > 0) ? (
                                <PopularityMeter
                                    views={car.viewCount ?? 0}
                                    subscribers={car.subscriberCount ?? 0}
                                />
                            ) : null}

                            {/* Key Features */}
                            <div className="bg-surface rounded-2xl p-6 border border-medium shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-primary">Karakteristikat kryesore</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                        <Calendar size={20} className="text-ferrari-red" />
                                        <div>
                                            <p className="text-xs text-muted">Viti</p>
                                            <p className="font-medium text-primary">{car.year}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                        <Gauge size={20} className="text-ferrari-red" />
                                        <div>
                                            <p className="text-xs text-muted">Kilometrazha</p>
                                            <p className="font-medium text-primary">{car.mileage?.toLocaleString()} km</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                        <Fuel size={20} className="text-ferrari-red" />
                                        <div>
                                            <p className="text-xs text-muted">Karburanti</p>
                                            <p className="font-medium text-primary">{car.fuelType === 'Diesel' ? 'Naftë' : car.fuelType}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                        <Settings size={20} className="text-ferrari-red" />
                                        <div>
                                            <p className="text-xs text-muted">Transmisioni</p>
                                            <p className="font-medium text-primary">{car.transmission === 'Automatic' ? 'Automatik' : 'Manuel'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                        <MapPin size={20} className="text-ferrari-red" />
                                        <div>
                                            <p className="text-xs text-muted">Ngjyra</p>
                                            <p className="font-medium text-primary">{car.exteriorColor || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                        <Shield size={20} className="text-ferrari-red" />
                                        <div>
                                            <p className="text-xs text-muted">Garancia</p>
                                            <p className="font-medium text-primary">{car.warranty?.bodyMonth ? `${car.warranty.bodyMonth} muaj` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Full Specifications */}
                            <CarSpecs car={car} />

                            {/* Description */}
                            {car.description && (
                                <div className="bg-surface rounded-2xl p-6 border border-medium shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4 text-primary">Përshkrimi i plotë</h2>
                                    <div className="prose max-w-none text-secondary whitespace-pre-line leading-relaxed">
                                        {car.description}
                                    </div>
                                </div>
                            )}

                            {/* Features Grid */}
                            {car.features && car.features.length > 0 && (
                                <div className="bg-surface rounded-2xl p-6 border border-medium shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4 text-primary">Pajisjet dhe opsionet</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {car.features.map((feature: string, index: number) => (
                                            <div key={index} className="flex items-center gap-2 p-2">
                                                <CheckCircle size={18} className="text-ferrari-red shrink-0" />
                                                <span className="text-sm text-secondary">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Vehicle History */}
                            {car.vin && (
                                <div className="bg-surface rounded-2xl p-6 border border-medium shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4 text-primary">Historiku i makinës</h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                                            <span className="text-muted">VIN:</span>
                                            <span className="font-mono font-medium text-primary">{car.vin}</span>
                                        </div>
                                        {car.inspection && (
                                            <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                                                <span className="text-muted">Inspektimi:</span>
                                                <span className="text-success-text font-medium flex items-center gap-1">
                                                    <CheckCircle size={16} />
                                                    I kryer
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Price & Contact */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-40 space-y-6">
                                {/* Price Card */}
                                <div className="bg-linear-to-br from-surface to-secondary rounded-2xl p-6 border border-medium shadow-lg">
                                    <div className="text-4xl font-bold text-ferrari-red mb-2">
                                        €{car.price?.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted mb-6 flex items-center gap-1">
                                        <MapPin size={14} />
                                        Çmimi në Kore (pa shpenzime importi)
                                    </div>

                                    {/* Quick Actions */}
                                    <QuickActions car={car} />

                                    {/* Trust Badges */}
                                    <div className="mt-6 pt-6 border-t border-medium">
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-8 h-8 bg-info-bg rounded-full flex items-center justify-center">
                                                    <Truck size={16} className="text-info-text" />
                                                </div>
                                                <span className="text-muted">Import direkt</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-8 h-8 bg-success-bg rounded-full flex items-center justify-center">
                                                    <Shield size={16} className="text-success-text" />
                                                </div>
                                                <span className="text-muted">Inspektuar</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-8 h-8 bg-warning-bg rounded-full flex items-center justify-center">
                                                    <CheckCircle size={16} className="text-warning-text" />
                                                </div>
                                                <span className="text-muted">Garanci</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cost Calculator */}
                                <CostCalculator carPrice={car.price} />

                                {/* Dealer Badge */}
                                {car.dealer && <DealerBadge dealer={car.dealer} />}

                                {/* Seller Info */}
                                <div className="bg-surface rounded-2xl p-6 border border-medium shadow-sm">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                                        <Building2 size={18} className="text-ferrari-red" />
                                        Shitësi
                                    </h3>
                                    <SellerInfo
                                        dealer={car.dealer}
                                        sellerName={car.sellerName}
                                        sellerPhone={car.sellerPhone}
                                        sellerEmail={car.sellerEmail}
                                        sellerLocation={car.sellerLocation}
                                    />
                                </div>

                                {/* Warranty */}
                                {car.warranty && (
                                    <WarrantyInfo warranty={car.warranty} />
                                )}

                                {/* Contact Form */}
                                <div className="bg-surface rounded-2xl p-6 border border-medium shadow-sm">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                                        <Mail size={18} className="text-ferrari-red" />
                                        Pyet për këtë makinë
                                    </h3>
                                    <ContactForm
                                        carId={car.id}
                                        carName={car.full_name}
                                    />
                                </div>

                                {/* Report */}
                                <div className="text-center">
                                    <button className="text-xs text-muted hover:text-ferrari-red transition">
                                        📢 Raporto këtë makinë
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Similar Cars */}
                    <div className="mt-16">
                        <SimilarCars
                            currentCarId={car.id}
                            make={car.make}
                            model={car.model}
                            price={car.price}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}