// components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Car } from 'lucide-react';
import CompactSearch from '@/components/ui/CompactSearch';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
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
                ? 'bg-transparent backdrop-blur-xl border-b border-light/10 py-3'
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
                            <img src="/logo.webp" className='h-14' alt="Vetura Nga Korea" />
                            <motion.div
                                className="absolute inset-0 bg-orange-primary/20 blur-xl rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                        <span className="text-base md:text-lg font-semibold tracking-tight text-primary hidden sm:block">
                            Vetura Nga Korea
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
                                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(item.href)
                                    ? 'text-orange-primary bg-orange-10'
                                    : 'text-secondary hover:text-primary hover:bg-surface-2/50'
                                    }`}
                            >
                                {item.name}
                                {isActive(item.href) && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-primary rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden relative w-10 h-10 rounded-xl bg-surface-2/50 hover:bg-surface-2 transition-colors flex items-center justify-center"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-5 h-5 text-primary" />
                        ) : (
                            <Menu className="w-5 h-5 text-primary" />
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
                                            ? 'bg-orange-10 text-orange-primary'
                                            : 'text-secondary hover:text-primary hover:bg-surface-2/50'
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