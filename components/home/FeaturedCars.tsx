// components/home/FeaturedCars.tsx
'use client';

import { useEffect, useState } from 'react';
import CarCard from '@/components/cars/CarCard';
import { type Car, fetchCars } from '@/lib/api';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { motion } from 'framer-motion';

export default function FeaturedCars() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedCars = async () => {
            try {
                // Use the existing fetchCars function with parameters
                // You can customize this based on what "featured" means in your app
                const response = await fetchCars({
                    per_page: 6, // Get only 6 cars
                    // Add any other filters for "featured" cars
                    // For example, if you have a "featured" flag or specific criteria
                });

                setCars(response.data || []);
            } catch (error) {
                console.error('Error fetching featured cars:', error);
                // Set empty array on error to prevent crash
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

    // Don't render if no cars
    if (!cars.length) {
        return null;
    }

    return (
        <section className="py-16 md:py-24 bg-surface/30 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-5 to-transparent pointer-events-none" />

            <div className="container-swiss relative z-10">
                {/* Section Header */}
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
                            Featured
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                        Makinat e fundit
                    </h2>
                    <p className="text-secondary max-w-2xl mx-auto">
                        Zbuloni makinat më të reja të shtuara në platformën tonë
                    </p>
                </motion.div>

                {/* Cars Grid */}
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

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/cars"
                        className="group inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-dark transition-all hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
                    >
                        <span>Shfleto të gjitha makinat</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}