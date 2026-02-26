// components/layout/Footer.tsx
import Link from 'next/link';
import {
    Facebook,
    Instagram,
    Mail,
    Phone,
    MapPin,
    Clock,
    ChevronRight,
    Heart,
    Car,
    Scale,
    Shield,
    MessageCircle
} from 'lucide-react';
import Newsletter from '@/components/ui/Newsletter'; // Import the Newsletter component
import SocialLinks from '../ui/SocialLinks';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white mt-20">
            {/* Main Footer */}
            <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Company Info - Largest Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-ferrari-red rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">F</span>
                            </div>
                            <span className="text-2xl font-bold">
                                Formula<span className="text-ferrari-red">Export</span>
                            </span>
                        </div>

                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Platforma më e madhe në Kosovë për import të makinave nga Korea.
                            Ne ju ndihmojmë të gjeni makinën e ëndrrave tuaja me çmime konkurruese
                            dhe proces të garantuar.
                        </p>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="bg-surface/10 px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
                                <Shield size={12} className="text-ferrari-red" />
                                Import direkt
                            </span>
                            <span className="bg-surface/10 px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
                                <Scale size={12} className="text-ferrari-red" />
                                Garanci ligjore
                            </span>
                            <span className="bg-surface/10 px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
                                <Heart size={12} className="text-ferrari-red" />
                                500+ klientë
                            </span>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="w-8 h-8 bg-ferrari-red/10 rounded-lg flex items-center justify-center">
                                    <Phone size={16} className="text-ferrari-red" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Telefon</p>
                                    <a href="tel:+38345255388" className="hover:text-ferrari-red transition">
                                        +383 45 528 033
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="w-8 h-8 bg-ferrari-red/10 rounded-lg flex items-center justify-center">
                                    <Mail size={16} className="text-ferrari-red" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <a href="mailto:info@formulaexport.com" className="hover:text-ferrari-red transition">
                                        info@formulaexport.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="w-8 h-8 bg-ferrari-red/10 rounded-lg flex items-center justify-center">
                                    <MapPin size={16} className="text-ferrari-red" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Adresa</p>
                                    <p>Prishtinë, Kosovë</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 relative">
                            Linke të shpejta
                            <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-ferrari-red"></span>
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { href: '/cars', label: 'Të gjitha makinat' },
                                { href: '/offers', label: 'Ofertat e javës' },
                                { href: '/brands', label: 'Markat' },
                                { href: '/how-it-works', label: 'Si funksionon' },
                                { href: '/compare', label: 'Krahaso makina' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-ferrari-red transition flex items-center gap-2 group"
                                    >
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 relative">
                            Mbështetje
                            <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-ferrari-red"></span>
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/faq" className="text-gray-400 hover:text-ferrari-red transition flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-ferrari-red rounded-full"></span>
                                    Pyetje të shpeshta
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-ferrari-red transition flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-ferrari-red rounded-full"></span>
                                    Na kontaktoni
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-ferrari-red transition flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-ferrari-red rounded-full"></span>
                                    Politika e privatësisë
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-ferrari-red transition flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-ferrari-red rounded-full"></span>
                                    Termat e përdorimit
                                </Link>
                            </li>
                        </ul>

                        {/* Working Hours */}
                        <div className="mt-6 pt-6 border-t border-gray-800">
                            <div className="flex items-center gap-2 text-gray-400 mb-3">
                                <Clock size={16} className="text-ferrari-red" />
                                <span className="font-medium">Orari i punës</span>
                            </div>
                            <p className="text-sm text-gray-500">Hënë - Premte: 09:00 - 18:00</p>
                            <p className="text-sm text-gray-500">Shtunë: 10:00 - 14:00</p>
                        </div>
                    </div>

                    {/* Newsletter - Using the Newsletter component */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 relative">
                            Na ndiqni
                            <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-ferrari-red"></span>
                        </h4>

                        {/* Social Links */}
                        <SocialLinks variant="footer" />

                        {/* Newsletter Component */}
                        <Newsletter />
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800/60 bg-gray-950/50">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Copyright */}
                        <p className="text-sm text-gray-500">
                            © {currentYear} Formula Export. Të gjitha të drejtat e rezervuara.
                        </p>

                        {/* Payment Methods */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-600">Ne pranojmë:</span>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-surface/5 rounded text-xs text-gray-400">Visa</span>
                                <span className="px-2 py-1 bg-surface/5 rounded text-xs text-gray-400">Mastercard</span>
                                <span className="px-2 py-1 bg-surface/5 rounded text-xs text-gray-400">Bank Transfer</span>
                            </div>
                        </div>

                        {/* Legal Links */}
                        <div className="flex gap-6 text-xs">
                            <Link href="/privacy" className="text-gray-600 hover:text-ferrari-red transition">
                                Privatësia
                            </Link>
                            <Link href="/terms" className="text-gray-600 hover:text-ferrari-red transition">
                                Termat
                            </Link>
                            <Link href="/cookies" className="text-gray-600 hover:text-ferrari-red transition">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}