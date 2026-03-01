// components/home/Hero.tsx
'use client';

import { ChevronRight, Sparkles, Shield, Truck, Clock } from 'lucide-react';
import Link from 'next/link';
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
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-dark-blue via-dark-blue to-navy">
            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,107,0,0.1)_0%,transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,0,0.1)_0%,transparent_50%)]" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />

            <div className="container-swiss relative">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={staggerChildren}
                    className="max-w-4xl"
                >
                    {/* Badge */}
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 bg-orange-10 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-20 mb-6 md:mb-8"
                    >
                        <Sparkles size={16} className="text-orange-primary" />
                        <span className="text-orange-primary text-sm font-medium tracking-wide">
                            IMPORT DIREKT NGA KOREA
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        variants={fadeInUp}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight"
                    >
                        Makina cilësore{' '}
                        <span className="text-orange-primary relative">
                            nga Korea
                            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-orange-primary/30 rounded-full hidden md:block" />
                        </span>
                        <br className="hidden md:block" />
                        në Kosovë
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-base md:text-xl text-secondary mb-6 md:mb-8 max-w-2xl leading-relaxed"
                    >
                        Vetura Nga Korea ju sjell makinat më të mira nga Korea me çmime konkurruese.
                        Inspektim të plotë, garanci dhe transport të sigurt.
                    </motion.p>

                    {/* Mobile Search - Visible only on mobile */}
                    <motion.div
                        variants={fadeInUp}
                        className="block lg:hidden mb-8"
                    >
                        <CompactSearch variant="hero" />
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-wrap gap-3 md:gap-4 mb-12 md:mb-16"
                    >
                        <Link
                            href="/cars"
                            className="group btn-primary text-sm md:text-base"
                        >
                            Shfleto makinat
                            <ChevronRight size={16} className="md:w-[18px] group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="group btn-secondary text-sm md:text-base"
                        >
                            Mëso më shumë
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={fadeInUp}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
                    >
                        {[
                            { icon: Truck, value: '500+', label: 'Makina në stok' },
                            { icon: Shield, value: '98%', label: 'Klientë të kënaqur' },
                            { icon: Clock, value: '15 ditë', label: 'Transporti' },
                            { icon: Sparkles, value: '100%', label: 'Të inspektuara' }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -4 }}
                                className="flex flex-col"
                            >
                                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                    <div className="p-1.5 md:p-2 bg-orange-10 rounded-lg">
                                        <stat.icon size={16} className="md:w-5 md:h-5 text-orange-primary" />
                                    </div>
                                    <span className="text-lg md:text-2xl font-bold text-primary">
                                        {stat.value}
                                    </span>
                                </div>
                                <span className="text-xs md:text-sm text-muted">
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