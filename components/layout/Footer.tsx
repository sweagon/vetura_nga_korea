// components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { Car, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { useConfig } from '@/lib/ConfigContext';

export default function Footer() {
    const { config } = useConfig();
    const currentYear = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navigation = {
        main: [
            { name: 'Ballina', href: '/' },
            { name: 'Makina', href: '/cars' },
            { name: 'Shikuar së fundmi', href: '/recently-viewed' },
        ],
        legal: [
            { name: 'Privatësia', href: '/privacy' },
            { name: 'Kushtet', href: '/terms' },
            { name: 'Cookies', href: '/cookies' },
        ],
    };

    return (
        <footer className="bg-surface border-t border-light mt-20">
            <div className="container-swiss py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <Car className="w-8 h-8 text-orange-primary" />
                            <span className="text-xl font-semibold text-primary">
                                {config.siteName}
                            </span>
                        </div>
                        <p className="text-secondary text-sm leading-relaxed mb-6">
                            Importoni makina cilësore nga Korea me çmime konkurruese.
                            BMW, Audi, Mercedes-Benz dhe makina të tjera direkt në Kosovë.
                        </p>
                        <div className="flex space-x-3">
                            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-orange-10 transition-colors cursor-pointer">
                                <span className="text-xs font-medium text-secondary hover:text-orange-primary">FB</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-orange-10 transition-colors cursor-pointer">
                                <span className="text-xs font-medium text-secondary hover:text-orange-primary">IG</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-orange-10 transition-colors cursor-pointer">
                                <span className="text-xs font-medium text-secondary hover:text-orange-primary">YT</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                            Navigimi
                        </h3>
                        <ul className="space-y-3">
                            {navigation.main.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-secondary hover:text-orange-primary transition-colors text-sm"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                            Ligjore
                        </h3>
                        <ul className="space-y-3">
                            {navigation.legal.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-secondary hover:text-orange-primary transition-colors text-sm"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                            Kontakti
                        </h3>
                        <ul className="space-y-3">
                            {process.env.NODE_ENV === 'development' && (
                                <li>
                                    <Link href="/admin" className="text-secondary hover:text-orange-primary transition-colors text-sm">
                                        Admin
                                    </Link>
                                </li>
                            )}
                            <li className="flex items-start gap-3">
                                <Mail size={16} className="text-muted mt-0.5" />
                                <a href={`mailto:${config.contactEmail}`} className="text-secondary hover:text-orange-primary transition-colors text-sm">
                                    {config.contactEmail}
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone size={16} className="text-muted mt-0.5" />
                                <a href={`tel:${config.contactPhone}`} className="text-secondary hover:text-orange-primary transition-colors text-sm">
                                    {config.contactPhone}
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={16} className="text-muted mt-0.5" />
                                <span className="text-secondary text-sm">
                                    Prishtinë, Kosovë
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-light flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-muted text-sm">
                        © {currentYear} {config.siteName}. Të gjitha të drejtat e rezervuara.
                    </p>
                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-2 text-sm text-secondary hover:text-orange-primary transition-colors group"
                    >
                        <span>Kthehu lart</span>
                        <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </footer>
    );
}