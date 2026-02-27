// components/home/FeaturedCars.tsx
'use client';

import { useEffect, useState } from 'react';
import CarCard from '@/components/cars/CarCard';
import { fetchCars, type Car } from '@/lib/api'; // ✅ Import Car type
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FeaturedCars() {
    const router = useRouter();
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentFilters, setCurrentFilters] = useState<any>({});

    useEffect(() => {
        loadFeaturedCars();
    }, []);

    const loadFeaturedCars = async () => {
        let featured: Car[] = [];
        let filters = {};

        // STRATEGY 1: German cars (priority)
        featured = await searchBroadGerman();
        if (featured.length >= 2) {
            filters = {
                make: ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen'].join(','),
                sort: 'price_asc',
                minPrice: 2000,
                maxPrice: 20000
            };
            setCurrentFilters(filters);
            setCars(featured.slice(0, 4));
            setLoading(false);
            return;
        }

        // STRATEGY 2: Diesel European
        featured = await searchEuropeanDiesel();
        if (featured.length >= 2) {
            filters = {
                fuelType: 'Diesel',
                sort: 'price_asc',
                minPrice: 2000,
                maxPrice: 15000
            };
            setCurrentFilters(filters);
            setCars(featured.slice(0, 4));
            setLoading(false);
            return;
        }

        // STRATEGY 3: Any European car
        featured = await searchAnyEuropean();
        if (featured.length > 0) {
            filters = {
                make: ['Renault', 'Peugeot', 'Citroen', 'Opel', 'Ford', 'Fiat'].join(','),
                sort: 'price_asc',
                minPrice: 2000,
                maxPrice: 15000
            };
            setCurrentFilters(filters);
            setCars(featured.slice(0, 4));
            setLoading(false);
            return;
        }

        // STRATEGY 4: Best value
        featured = await searchBestValue();
        if (featured.length > 0) {
            filters = {
                sort: 'price_asc',
                minPrice: 2000,
                maxPrice: 8000
            };
            setCurrentFilters(filters);
            setCars(featured.slice(0, 4));
            setLoading(false);
            return;
        }

        setCurrentFilters({});
        setCars([]);
        setLoading(false);
    };

    // Build URL with current filters
    const getSeeAllUrl = () => {
        if (Object.keys(currentFilters).length === 0) {
            return '/cars';
        }

        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value) params.append(key, String(value));
        });

        return `/cars?${params.toString()}`;
    };

    // Handle "See All" click
    const handleSeeAll = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push(getSeeAllUrl());
    };

    // STRATEGY 1: German cars
    const searchBroadGerman = async (): Promise<Car[]> => {
        const [bmw, audi, mercedes, vw] = await Promise.all([
            fetchCars({ make: 'BMW', limit: 5, sort: 'price_asc', minPrice: 2000, maxPrice: 20000 }),
            fetchCars({ make: 'Audi', limit: 5, sort: 'price_asc', minPrice: 2000, maxPrice: 20000 }),
            fetchCars({ make: 'Mercedes-Benz', limit: 5, sort: 'price_asc', minPrice: 2000, maxPrice: 20000 }),
            fetchCars({ make: 'Volkswagen', limit: 5, sort: 'price_asc', minPrice: 2000, maxPrice: 20000 })
        ]);

        const allGerman = [
            ...(bmw?.cars || []),
            ...(audi?.cars || []),
            ...(mercedes?.cars || []),
            ...(vw?.cars || [])
        ];

        return filterEuropeanCars(allGerman);
    };

    // STRATEGY 2: Diesel European
    const searchEuropeanDiesel = async (): Promise<Car[]> => {
        const [diesel1, diesel2] = await Promise.all([
            fetchCars({ fuelType: 'Diesel', limit: 10, sort: 'price_asc', minPrice: 2000, maxPrice: 15000 }),
            fetchCars({ fuelType: 'Diesel', limit: 10, sort: 'year_desc', minPrice: 2000, maxPrice: 15000 })
        ]);

        const allDiesel = [
            ...(diesel1?.cars || []),
            ...(diesel2?.cars || [])
        ];

        return filterEuropeanCars(allDiesel);
    };

    // STRATEGY 3: Any European
    const searchAnyEuropean = async (): Promise<Car[]> => {
        const europeanBrands = ['Renault', 'Peugeot', 'Citroen', 'Opel', 'Ford', 'Fiat'];

        const promises = europeanBrands.map(brand =>
            fetchCars({ make: brand, limit: 3, sort: 'price_asc', minPrice: 2000, maxPrice: 15000 })
        );

        const results = await Promise.all(promises);
        const allEuropean = results.flatMap(r => r?.cars || []);

        return filterEuropeanCars(allEuropean);
    };

    // STRATEGY 4: Best value
    const searchBestValue = async (): Promise<Car[]> => {
        const [lowPrice, lowMileage] = await Promise.all([
            fetchCars({ limit: 10, sort: 'price_asc', minPrice: 2000, maxPrice: 8000 }),
            fetchCars({ limit: 10, sort: 'mileage_asc', minPrice: 2000, maxPrice: 10000 })
        ]);

        const bestValue = [
            ...(lowPrice?.cars || []),
            ...(lowMileage?.cars || [])
        ];

        return filterEuropeanCars(bestValue);
    };

    // Filter European cars
    const filterEuropeanCars = (cars: any[]): Car[] => {
        const europeanBrands = [
            'BMW', 'Audi', 'Mercedes', 'Volkswagen', 'Porsche',
            'Renault', 'Peugeot', 'Citroen', 'Opel', 'Ford',
            'Fiat', 'Volvo', 'Mini', 'Seat', 'Skoda', 'Alfa Romeo',
            'DS', 'Jaguar', 'Land Rover'
        ];

        const excludeKeywords = [
            'ray', 'morning', 'twizy', 'k5', 'k7', 'k8', 'k9',
            'mohave', 'samsung', 'kg ', 'ssangyong', 'daewoo',
            'rexston', 'korando', 'tivoli', 'tiboli', '렉스턴', '코란도'
        ];

        const scored = cars
            .map((car: any) => {
                const brand = car.make || '';
                const model = car.model || '';
                const fullName = `${brand} ${model}`.toLowerCase();

                const isEuropean = europeanBrands.some(eb =>
                    brand.includes(eb) || fullName.includes(eb.toLowerCase())
                );
                if (!isEuropean) return null;

                if (excludeKeywords.some(keyword => fullName.includes(keyword))) {
                    return null;
                }

                let score = 0;

                if (brand.includes('BMW') || brand.includes('Mercedes') ||
                    brand.includes('Audi') || brand.includes('Porsche')) {
                    score += 50;
                }

                if (car.fuelType === 'Diesel') score += 30;

                const age = new Date().getFullYear() - car.year;
                if (age <= 5) score += 25;
                else if (age <= 8) score += 15;
                else if (age <= 10) score += 10;

                if (car.price < 5000) score += 20;
                else if (car.price < 8000) score += 15;
                else if (car.price < 10000) score += 10;

                if (car.mileage < 50000) score += 20;
                else if (car.mileage < 100000) score += 15;
                else if (car.mileage < 150000) score += 10;

                return { ...car, score };
            })
            .filter((car): car is Car => car !== null)
            .sort((a, b) => (b.score || 0) - (a.score || 0));

        return scored;
    };

    if (loading) {
        return (
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-primary">🚗 Makina të zgjedhura</h2>
                    <div className="h-6 w-24 bg-tertiary rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-tertiary h-48 rounded-t-lg"></div>
                            <div className="bg-surface p-4 rounded-b-lg">
                                <div className="h-4 bg-tertiary rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-tertiary rounded w-1/2 mb-2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (cars.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-primary">🚗 Makina të zgjedhura</h2>
                    <Link href="/offers" className="text-ferrari-red hover:underline">
                        Shiko ofertat →
                    </Link>
                </div>
                <div className="bg-gradient-to-r from-ferrari-red/10 to-transparent rounded-lg p-8 text-center border border-ferrari-red/20">
                    <p className="text-secondary mb-3">Për momentin nuk ka makina evropiane në stok.</p>
                    <p className="text-sm text-muted mb-4">
                        Por kemi shumë makina koreane të gatshme për import!
                    </p>
                    <Link href="/korea-import" className="btn-primary inline-block">
                        Shfleto makina koreane
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-primary">🚗 Makina të zgjedhura</h2>
                <button
                    onClick={handleSeeAll}
                    className="text-ferrari-red hover:underline cursor-pointer"
                >
                    Shiko të gjitha →
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cars.map((car: Car) => (
                    <div key={car.id} className="relative">
                        {(car.score && car.score > 70) ? (
                            <div className="absolute top-2 left-2 z-10 bg-ferrari-red text-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                🔥 Top Choice
                            </div>
                        ) : car.fuelType === 'Diesel' ? (
                            <div className="absolute top-2 left-2 z-10 bg-info-text text-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                ⛽ Diesel
                            </div>
                        ) : (
                            <div className="absolute top-2 left-2 z-10 bg-success-text text-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                🇪🇺 European
                            </div>
                        )}
                        <CarCard car={car} />
                    </div>
                ))}
            </div>

            {/* Show current filter info (optional) */}
            {Object.keys(currentFilters).length > 0 && (
                <p className="text-xs text-muted mt-2 text-right">
                    Duke shfaqur {cars.length} nga shumë të tjerë me të njëjtat filtra
                </p>
            )}
        </div>
    );
}
