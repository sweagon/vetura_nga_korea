'use client';

import { motion } from 'framer-motion';
import { Shield, Truck, Award, Users, Clock, ThumbsUp, Sparkles, FileCheck, Heart, TrendingUp, FileText } from 'lucide-react';

export default function AboutSection() {
    const features = [
        {
            icon: TrendingUp,
            title: 'Çmime konkurruese në treg',
            description: 'Falë bashkëpunimit direkt me tregun korean, ofrojmë çmime shumë të favorshme.',
        },
        {
            icon: Heart,
            title: 'Mbështetje gjatë gjithë procesit',
            description: 'Ju asistojmë nga zgjedhja e veturës deri te dorëzimi final në Kosovë.',
        },
        {
            icon: FileText,
            title: 'Dokumentacion i rregullt për import',
            description: 'Sigurojmë të gjitha dokumentet e nevojshme për transport dhe procedurat e importit.',
        },
        {
            icon: Users,
            title: 'Transparencë e plotë',
            description: 'Histori të verifikuara dhe inspektim të detajuar për çdo automjet.',
        },
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-dark-blue via-dark-blue to-navy relative overflow-hidden">
            {/* Background Pattern */}
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
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 bg-orange-10 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-20 mb-6">
                        <Sparkles size={16} className="text-orange-500" />
                        <span className="text-orange-500 text-sm font-medium tracking-wide">
                            RRETH NESH
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Pse të zgjidhni{' '}
                        <span className="text-orange-500">Vetura Korea Kosovë</span>
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Në Vetura Korea Kosovë sjellim vetura të përzgjedhura nga Korea me standarde të larta cilësie,
                        histori të verifikuar dhe transparencë të plotë në çdo hap të procesit.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-10 rounded-lg mb-4">
                                <feature.icon className="w-6 h-6 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-white/60">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}