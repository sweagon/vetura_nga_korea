// components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Car } from 'lucide-react';
import CompactSearch from '@/components/ui/CompactSearch';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfig } from '@/lib/ConfigContext';

export default function Header() {
    const { config } = useConfig();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const navigation = [
        { name: 'Ballina', href: '/' },
        { name: 'Makina', href: '/cars' },
        { name: 'Shikuar së fundmi', href: '/recently-viewed' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || isMenuOpen
                ? 'bg-surface/95 backdrop-blur-xl border-b border-light/10 py-3'
                : 'bg-orange-500 py-4 md:py-5'
                }`}
        >
            <nav className="container-swiss">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center space-x-3 group shrink-0"
                    >
                        <div className="relative">
                            <img src="./logo.webp" className="w-12 h-12" alt="Vetura Nga Korea Logo" />
                        </div>
                        <span className={`text-base md:text-lg font-semibold tracking-tight hidden sm:block ${scrolled ? 'text-primary' : 'text-white'
                            }`}>
                            {config.siteName}
                        </span>
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden lg:block flex-1 max-w-2xl mx-4">
                        <CompactSearch variant="header" />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-2 shrink-0">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${scrolled
                                    ? 'focus:ring-orange-primary/50 focus:ring-offset-surface'
                                    : 'focus:ring-white/50 focus:ring-offset-orange-500'
                                    } ${isActive(item.href)
                                        ? scrolled
                                            ? 'text-orange-primary bg-orange-10'
                                            : 'text-white bg-white/20'
                                        : scrolled
                                            ? 'text-secondary hover:text-primary hover:bg-surface-2/50'
                                            : 'text-white/90 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`lg:hidden relative w-10 h-10 rounded-xl transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 ${scrolled
                            ? 'bg-surface-2/50 hover:bg-surface-2 focus:ring-orange-primary/50 focus:ring-offset-surface'
                            : 'bg-white/10 hover:bg-white/20 focus:ring-white/50 focus:ring-offset-orange-500'
                            }`}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className={`w-5 h-5 ${scrolled ? 'text-primary' : 'text-white'}`} />
                        ) : (
                            <Menu className={`w-5 h-5 ${scrolled ? 'text-primary' : 'text-white'}`} />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="lg:hidden overflow-hidden"
                        >
                            <div className="py-4 mt-2 border-t border-light/10 space-y-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`block py-3 px-4 rounded-xl text-sm font-medium transition-all ${isActive(item.href)
                                            ? scrolled
                                                ? 'bg-orange-10 text-orange-primary'
                                                : 'bg-white/20 text-white'
                                            : scrolled
                                                ? 'text-secondary hover:text-primary hover:bg-surface-2/50'
                                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                                {/* Mobile Search */}
                                <div className="pt-4 mt-2 border-t border-light/10">
                                    <CompactSearch variant="header" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
}