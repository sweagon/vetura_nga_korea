'use client';

import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="bg-[url(https://png.pngtree.com/thumb_back/fw800/background/20251222/pngtree-sleek-red-sports-car-showcased-in-luxurious-showroom-reflected-on-glossy-image_20784512.webp)] bg-cover bg-center relative bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-75 bg-primary">
                <div className="absolute top-20 left-10 w-72 h-72 bg-ferrari-red/25 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-ferrari-red/50 rounded-full filter blur-3xl"></div>
            </div>

            <div className="container-custom relative py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl"
                >
                    <div className="flex items-center space-x-2 mb-6">
                        <Sparkles className="text-ferrari-red" size={24} />
                        <span className="text-ferrari-red font-semibold">Import direkt nga Korea</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Makina cilësore nga Korea{' '}
                        <span className="text-ferrari-red">në Kosovë</span>
                    </h1>

                    <p className="text-xl text-gray-300 mb-8">
                        Formula Export ju sjell makinat më të mira nga Korea me çmime konkurruese.
                        Inspektim të plotë, garanci dhe transport të sigurt.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/cars" className="btn-primary inline-flex items-center group">
                            Shfleto makinat
                            <ChevronRight className="ml-2 group-hover:translate-x-1 transition" size={20} />
                        </Link>
                        <Link href="/how-it-works" className="btn-secondary">
                            Mëso më shumë
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-16">
                        <div>
                            <div className="text-3xl font-bold text-ferrari-red">500+</div>
                            <div className="text-gray-400">Makina në stok</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-ferrari-red">98%</div>
                            <div className="text-gray-400">Klientë të kënaqur</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-ferrari-red">15 ditë</div>
                            <div className="text-gray-400">Transporti mesatar</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}