'use client';

import { useEffect, useState } from 'react';
import CarCard from '@/components/cars/CarCard';
import { type Car, fetchCars } from '@/lib/api';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { motion } from 'framer-motion';

// Popular manufacturers in Kosovo with their correct IDs from staticManufacturers.ts
const POPULAR_MANUFACTURERS = [
    { id: 88, name: 'Mercedes-Benz' },  // Very popular in Kosovo
    { id: 16, name: 'BMW' },             // Very popular in Kosovo
    { id: 9, name: 'Audi' },              // Very popular in Kosovo
    { id: 147, name: 'Volkswagen' },      // Very popular in Kosovo
    { id: 140, name: 'Toyota' },          // Reliable, popular
    { id: 48, name: 'Ford' },              // Popular work vehicles
    { id: 68, name: 'Jeep' },              // Popular SUVs
    { id: 70, name: 'Kia' },               // Good value
    { id: 58, name: 'Hyundai' },           // Good value
    { id: 74, name: 'Land Rover' },        // Luxury SUVs
    { id: 13, name: 'Bentley' },           // Ultra luxury (keep a few)
];

// Price ranges that sell well in Kosovo (in EUR)
const PRICE_RANGES = {
    MIN: 10000,
    MAX: 50000,
    // Popular segments:
    // €10k-20k: Affordable family cars
    // €20k-35k: Premium sedans/SUVs
    // €35k-50k: Luxury cars
};

export default function FeaturedCars() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedCars = async () => {
            try {
                setLoading(true);

                // Focus on the top 5 most popular brands in Kosovo
                const topBrands = POPULAR_MANUFACTURERS.slice(0, 5); // Mercedes, BMW, Audi, VW, Toyota

                // Fetch cars from each top manufacturer
                const fetchPromises = topBrands.map(brand =>
                    fetchCars({
                        manufacturer_id: brand.id,
                        per_page: 2, // Get 2 from each top brand
                        buy_now_price_from: PRICE_RANGES.MIN,
                        buy_now_price_to: PRICE_RANGES.MAX,
                        year_from: 2015, // Not too old
                        order_by: 'year_desc', // Newest first
                    }).catch(() => ({ data: [] }))
                );

                // Also get a few from premium/luxury brands
                const premiumBrands = POPULAR_MANUFACTURERS.slice(5, 8); // Jeep, Land Rover, Bentley
                const premiumPromises = premiumBrands.map(brand =>
                    fetchCars({
                        manufacturer_id: brand.id,
                        per_page: 1, // Just 1 each from premium brands
                        buy_now_price_from: 20000,
                        buy_now_price_to: PRICE_RANGES.MAX,
                        year_from: 2016,
                    }).catch(() => ({ data: [] }))
                );

                // Combine all promises
                const results = await Promise.all([...fetchPromises, ...premiumPromises]);

                // Combine all cars
                const allCars = results.flatMap(r => r.data || []);

                // Remove duplicates (by VIN)
                const uniqueCars = Array.from(
                    new Map(allCars.map(car => [car.vin, car])).values()
                );

                // Score cars based on Kosovo market preferences
                const scoredCars = uniqueCars.map(car => {
                    let score = 0;

                    // Prefer newer cars
                    if (car.year >= 2020) score += 30;
                    else if (car.year >= 2018) score += 20;
                    else if (car.year >= 2015) score += 10;

                    // Prefer lower mileage
                    const mileage = car.lots?.[0]?.odometer?.km || 0;
                    if (mileage < 50000) score += 25;
                    else if (mileage < 100000) score += 15;
                    else if (mileage < 150000) score += 5;

                    // Prefer automatic transmission
                    if (car.transmission?.name?.toLowerCase().includes('automatic')) {
                        score += 15;
                    }

                    // Prefer diesel (popular in Kosovo for fuel economy)
                    if (car.fuel?.name?.toLowerCase().includes('diesel')) {
                        score += 10;
                    }

                    // Extra points for popular models
                    const popularModels = ['A4', 'A6', 'Q5', '3 Series', '5 Series', 'X3', 'X5', 'C-Class', 'E-Class', 'GLC', 'Golf', 'Passat', 'Tiguan', 'Corolla', 'RAV4'];
                    const modelName = car.model?.name || '';
                    if (popularModels.some(m => modelName.includes(m))) {
                        score += 20;
                    }

                    return { car, score };
                });

                // Sort by score and take top 6
                const topCars = scoredCars
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 6)
                    .map(item => item.car);

                console.log('✅ Featured cars (Kosovo market):',
                    topCars.map(c => `${c.manufacturer?.name} ${c.model?.name} (${c.year}) - €${c.lots?.[0]?.buy_now}`)
                );

                setCars(topCars);
            } catch (error) {
                console.error('Error fetching featured cars:', error);
                setCars([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedCars();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <section className="py-16 md:py-24 bg-surface/30">
                <div className="container-swiss">
                    <div className="text-center mb-12">
                        <div className="h-8 bg-surface-2 rounded w-48 mx-auto mb-4 animate-pulse" />
                        <div className="h-4 bg-surface-2 rounded w-64 mx-auto animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <CarCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!cars.length) {
        return null;
    }

    return (
        <section className="py-16 md:py-24 bg-surface/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-5 to-transparent pointer-events-none" />

            <div className="container-swiss relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-10 rounded-full mb-4">
                        <Sparkles size={16} className="text-orange-500" />
                        <span className="text-xs font-medium text-orange-500 uppercase tracking-wider">
                            Të Reja
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                        Makinat e fundit
                    </h2>
                    <p className="text-secondary max-w-2xl mx-auto">
                        Zgjedhja më e mirë për tregun kosovar: Mercedes, BMW, Audi, Volkswagen dhe Toyota
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {cars.map((car) => (
                        <motion.div key={car.id} variants={itemVariants}>
                            <CarCard car={car} />
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/cars"
                        className="group inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                        <span>Shfleto të gjitha makinat</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}