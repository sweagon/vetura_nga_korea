// components/home/Hero.tsx (simplified)
'use client';

import { Sparkles, Shield, Truck, Clock } from 'lucide-react';
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
                    src="https://images.pexels.com/photos/220309/pexels-photo-220309.jpeg"
                    alt="Luxury cars background"
                    className="absolute inset-0 w-full h-full object-cover brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-blue/70 via-dark-blue/60 to-dark-blue/50" />
                <div className="absolute inset-0 opacity-30 mix-blend-overlay">
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
                        <Sparkles size={16} className="text-orange-primary" />
                        <span className="text-orange-primary text-sm font-medium tracking-wide">
                            IMPORT DIREKT NGA KOREA
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        variants={fadeInUp}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight text-center lg:text-left text-white"
                    >
                        Makina cilësore{' '}
                        <span className="text-orange-primary relative">
                            nga Korea{' '}
                            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-orange-primary/30 rounded-full hidden md:block" />
                        </span>
                        <br className="hidden md:block" />
                        në Kosovë
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-base md:text-xl text-white/80 mb-8 md:mb-10 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left leading-relaxed"
                    >
                        Vetura Nga Korea ju sjell makinat më të mira nga Korea me çmime konkurruese.
                        Inspektim të plotë, garanci dhe transport të sigurt.
                    </motion.p>

                    {/* Compact Search - Will show both desktop and mobile versions */}
                    <motion.div variants={fadeInUp} className="mb-12 md:mb-16">
                        <CompactSearch variant="hero" />
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={fadeInUp}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto lg:mx-0"
                    >
                        {[
                            { icon: Truck, value: '500+', label: 'Makina në stok' },
                            { icon: Shield, value: '98%', label: 'Klientë të kënaqur' },
                            { icon: Clock, value: '30 ditë', label: 'Transporti' },
                            { icon: Sparkles, value: '100%', label: 'Të inspektuara' }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -4 }}
                                className="flex flex-col items-center lg:items-start"
                            >
                                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                    <div className="p-1.5 md:p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                        <stat.icon size={16} className="md:w-5 md:h-5 text-orange-primary" />
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