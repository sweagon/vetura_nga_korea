// components/home/WhyChooseUs.tsx
'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Star, TrendingUp, Heart, Shield, Zap, Sparkles } from 'lucide-react';

export default function WhyChooseUs() {
    const benefits = [
        {
            icon: Star,
            title: 'Makina cilësore',
            description: 'Të gjitha makinat vijnë nga Korea me standarde të larta.',
        },
        {
            icon: Shield,
            title: 'Inspektim i plotë',
            description: 'Çdo makinë inspektohet nga ekspertët tanë para dërgesës.',
        },
        {
            icon: TrendingUp,
            title: 'Çmime konkurruese',
            description: 'Ofertat më të mira në treg për makina nga Korea.',
        },
        {
            icon: Heart,
            title: 'Kënaqësia e klientit',
            description: '98% e klientëve tanë kthehen ose na rekomandojnë.',
        },
    ];

    const testimonials = [
        {
            name: 'Besnik Krasniqi',
            comment: 'Bleva një Kia Sportage përmes tyre, shërbim profesional dhe transparent.',
            rating: 5,
        },
        {
            name: 'Arta Gashi',
            comment: 'Makina erdhi në gjendje perfekte, siç e kishin përshkruar. Rekomandoj!',
            rating: 5,
        },
        {
            name: 'Fatos Berisha',
            comment: 'Proces i lehtë dhe i shpejtë. Makina mbërriti brenda 20 ditëve.',
            rating: 5,
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
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left side - Benefits */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-orange-10 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-20 mb-6">
                            <Sparkles size={16} className="text-orange-primary" />
                            <span className="text-orange-primary text-sm font-medium tracking-wide">
                                PËRFITIMET
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Pse të zgjidhni{' '}
                            <span className="text-orange-primary">nes?</span>
                        </h2>
                        <p className="text-white/60 mb-8">
                            Ne ofrojmë një shërbim të plotë dhe transparent për importimin e makinave nga Korea.
                        </p>

                        <div className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                                >
                                    <div className="w-10 h-10 bg-orange-10 rounded-lg flex items-center justify-center shrink-0">
                                        <benefit.icon size={20} className="text-orange-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white mb-1">{benefit.title}</h3>
                                        <p className="text-sm text-white/60">{benefit.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right side - Testimonials */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} fill="currentColor" />
                                    ))}
                                </div>
                                <span className="text-sm text-white/60">(4.9/5 nga 120+ vlerësime)</span>
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-6">
                                Çfarë thonë klientët tanë
                            </h3>

                            <div className="space-y-4">
                                {testimonials.map((testimonial, index) => (
                                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} size={14} className="text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-sm text-white/80 mb-2">"{testimonial.comment}"</p>
                                        <p className="text-xs text-white/60">- {testimonial.name}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2 text-sm text-white">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>120+ klientë të kënaqur</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}