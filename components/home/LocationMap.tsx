// components/home/LocationMap.tsx
'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Building2, Navigation, Sparkles } from 'lucide-react';

export default function LocationMap() {
    const contactInfo = [
        {
            icon: Building2,
            label: 'Adresa',
            value: 'Na vizitoni në Skenderaj, Kosovë',
        },
        {
            icon: Phone,
            label: 'Telefoni',
            value: '+383 49 195 414',
            href: 'tel:+38349195414',
        },
        {
            icon: Mail,
            label: 'Email',
            value: 'info@veturangakorea.com',
            href: 'mailto:info@veturangakorea.com',
        },
        {
            icon: Clock,
            label: 'Orari',
            value: 'E Hënë - E Shtunë: 09:00 - 18:00',
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
                            VENDNDODHJA JONË
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Na vizitoni në{' '}
                        <span className="text-orange-500">Prishtinë</span>
                    </h2>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <MapPin className="text-orange-500" size={20} />
                                Informacionet e kontaktit
                            </h3>

                            <div className="space-y-4">
                                {contactInfo.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-orange-10 rounded-lg flex items-center justify-center shrink-0">
                                            <item.icon size={16} className="text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/60">{item.label}</p>
                                            {item.href ? (
                                                <a
                                                    href={item.href}
                                                    className="text-sm text-white hover:text-orange-500 transition-colors"
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <p className="text-sm text-white">{item.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <a
                                    href="https://maps.google.com/?q=Prishtinë+Kosovë"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-orange-500 text-white w-full py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Navigation size={16} />
                                    Navigo në Google Maps
                                </a>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        {/* <div className="bg-orange-10 backdrop-blur-sm border border-orange-20 rounded-xl p-6">
                            <h4 className="text-sm font-medium text-orange-500 mb-3">
                                Pse të na vizitoni?
                            </h4>
                            <ul className="space-y-2 text-sm text-white/80">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    <span>Shikoni makinat personalisht</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    <span>Bisedoni me ekspertët tanë</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    <span>Testoni makinat para blerjes</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    <span>Përfundoni dokumentacionin menjëherë</span>
                                </li>
                            </ul>
                        </div> */}
                    </motion.div>

                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2 h-[400px] lg:h-[500px] overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2934.548144558233!2d21.165472315342!3d42.662422979167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13549ee8c3c5c1b7%3A0x8c9f1e1e1e1e1e1e!2sPrishtin%C3%AB!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0, borderRadius: '0.75rem' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Vetura Korea Kosovë Location"
                                className="w-full h-full"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}