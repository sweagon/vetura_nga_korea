'use client';

import { Sparkles, Shield, Truck, Clock, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import CompactSearch from '@/components/ui/CompactSearch';

export default function Hero() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    const staggerChildren = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src="https://tgal.us/wp-content/uploads/2020/05/what-is-roro-shipping-2.jpg"
                    alt="Import direkt nga Korea - transport detar"
                    className="absolute inset-0 w-full h-full object-cover brightness-50"
                />
                {/* ADD THIS LINEAR GRADIENT OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/75 via-dark-blue/70 to-transparent" />

                {/* Keep your existing gradient and effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-dark-blue/70 via-dark-blue/60 to-dark-blue/50" />
                <div className="absolute inset-0 mix-blend-overlay">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,107,0,0.4)_0%,transparent_50%)]" />
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,0,0.4)_0%,transparent_50%)]" />
                </div>
            </div>

            <div className="container-swiss relative lg:text-left text-center">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={staggerChildren}
                    className="max-w-4xl mx-auto lg:mx-0"
                >
                    {/* Badge */}
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6 md:mb-8"
                    >
                        <Sparkles size={16} className="text-orange-500" />
                        <span className="text-orange-500 text-sm font-medium tracking-wide">
                            IMPORT DIREKT NGA KOREA
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        variants={fadeInUp}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight text-center lg:text-left text-white"
                    >
                        Vetura cilësore{' '}
                        <span className="text-orange-500 relative">
                            nga Korea{' '}
                            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-orange-500/30 rounded-full hidden md:block" />
                        </span>
                        <br className="hidden md:block" />
                        në Kosovë
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-base md:text-xl text-white/80 mb-8 md:mb-10 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left leading-relaxed"
                    >
                        Garanci në motorr, pa kilometra të ndërruara, pa aksidente.
                        20 ditë ose 1,000 km garanci.
                    </motion.p>

                    {/* Compact Search */}
                    <motion.div variants={fadeInUp} className="mb-12 md:mb-16">
                        <CompactSearch variant="hero" />
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={fadeInUp}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto lg:mx-0"
                    >
                        {[
                            { icon: Shield, value: '98%', label: 'Klientë të kënaqur' },
                            { icon: Truck, value: '35 ditë', label: 'Transport deri në Prishtinë' },
                            { icon: Sparkles, value: '100%', label: 'Të inspektuara' },
                            { icon: FileCheck, value: 'Historia', label: 'Dokumentacion i plotë' }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -4 }}
                                className="flex flex-col items-center lg:items-start"
                            >
                                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                    <div className="p-1.5 md:p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                        <stat.icon size={16} className="md:w-5 md:h-5 text-orange-500" />
                                    </div>
                                    <span className="text-lg md:text-2xl font-bold text-white">
                                        {stat.value}
                                    </span>
                                </div>
                                <span className="text-xs md:text-sm text-white/60 text-center lg:text-left">
                                    {stat.label}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
