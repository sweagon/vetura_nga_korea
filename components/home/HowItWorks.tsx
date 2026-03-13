// components/home/HowItWorks.tsx
'use client';

import { motion } from 'framer-motion';
import { Search, FileCheck, Truck, Key, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
    const steps = [
        {
            icon: Search,
            title: '1. Zgjidh makinën',
            description: 'Shfleto katalogun tonë dhe zgjidh makinën që dëshiron.',
        },
        {
            icon: FileCheck,
            title: '2. Kontrata dhe pagesa',
            description: 'Nënshkruaj kontratën dhe bëj pagesën.',
        },
        {
            icon: Truck,
            title: '3. Transporti',
            description: 'Ne organizojmë transportin nga Korea në Prishtinë',
        },
        {
            icon: Key,
            title: '4. Marrja e makinës',
            description: 'Makina vjen dhe dorëzohet në doganë, dhe ju mund ta merrni direkt aty.',
        },
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-navy via-dark-blue to-dark-blue relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,107,0,0.1)_0%,transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,0,0.1)_0%,transparent_50%)]" />
            </div>

            <div className="container-swiss relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 bg-orange-10 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-20 mb-6">
                        <Sparkles size={16} className="text-orange-500" />
                        <span className="text-orange-500 text-sm font-medium tracking-wide">
                            PROCESI I BLERJES
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Si funksionon?
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Procesi i blerjes së makinës nga Korea është i thjeshtë dhe transparent.
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Connection Line (hidden on mobile) */}
                    <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500/30 via-orange-500 to-orange-500/30" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative"
                            >
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300 group">
                                    <div className="relative mb-6 inline-flex">
                                        <div className="w-20 h-20 rounded-full bg-orange-10 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <step.icon className="w-8 h-8 text-orange-500" />
                                        </div>
                                        {/* Step number badge */}
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full border-2 border-white/20 flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-white/60">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Arrow for desktop (except last) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                                        <ArrowRight className="w-6 h-6 text-orange-500" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}