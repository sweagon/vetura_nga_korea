'use client';

import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="bg-gradient-to-br from-primary to-primary/95 text-primary overflow-hidden relative">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{
                    backgroundImage: 'url(https://png.pngtree.com/thumb_back/fw800/background/20251222/pngtree-sleek-red-sports-car-showcased-in-luxurious-showroom-reflected-on-glossy-image_20784512.webp)'
                }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-transparent" />

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-ferrari-red/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-ferrari-red/20 rounded-full blur-3xl"></div>

            <div className="container-custom relative py-20 md:py-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 bg-ferrari-red/10 backdrop-blur-sm px-4 py-2 rounded-full border border-ferrari-red/20 mb-6"
                    >
                        <Sparkles className="text-ferrari-red" size={18} />
                        <span className="text-ferrari-red text-sm font-semibold tracking-wide">
                            IMPORT DIREKT NGA KOREA
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                    >
                        Makina cilësore nga Korea{' '}
                        <span className="text-ferrari-red relative inline-block">
                            në Kosovë
                            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-ferrari-red/30 rounded-full"></span>
                        </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-primary mb-8 max-w-2xl"
                    >
                        Formula Export ju sjell makinat më të mira nga Korea me çmime konkurruese.
                        Inspektim të plotë, garanci dhe transport të sigurt.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-4"
                    >
                        <Link
                            href="/cars"
                            className="group bg-ferrari-red hover:bg-ferrari-dark text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center"
                        >
                            Shfleto makinat
                            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="group bg-transparent hover:bg-white/10 text-white border-2 border-white/30 hover:border-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center"
                        >
                            Mëso më shumë
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-16"
                    >
                        {[
                            { value: '500+', label: 'Makina në stok' },
                            { value: '98%', label: 'Klientë të kënaqur' },
                            { value: '15 ditë', label: 'Transporti mesatar' }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                className="text-center md:text-left"
                            >
                                <div className="text-2xl md:text-3xl font-bold text-ferrari-red mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center gap-4 mt-12 pt-8 border-t border-white/10"
                    >
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-ferrari-red/20 border-2 border-white/20 flex items-center justify-center text-xs text-white">
                                    ✓
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-white/70">
                            <span className="text-white font-semibold">1000+</span> makina të importuara me sukses
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
