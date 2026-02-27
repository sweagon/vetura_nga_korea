'use client';

import Link from 'next/link';
import { Heart, User, Menu, X, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import SearchBar from '@/components/search/SearchBar';
import { usePathname } from 'next/navigation';
import { useSavedCars } from '@/hooks/useSavedCars';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { savedCarIds, loading: savedLoading } = useSavedCars();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    if (!mounted) return null;

    const savedCount = savedCarIds.size;

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-ferrari-dark/95 shadow-lg backdrop-blur-md border-b border-ferrari-red/20'
                : 'bg-ferrari-dark'
            }`}>
            {/* Subtle gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-ferrari-red/30 to-transparent" />

            <div className="container-custom">
                {/* Top Bar */}
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="group relative">
                        <img src="/logo.webp" className='h-12 transition-transform group-hover:scale-105' alt="Formula Export" />
                    </Link>

                    <div className="hidden md:block flex-1 max-w-xl mx-8">
                        <SearchBar />
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        <ThemeToggle />

                        <Link
                            href="/saved"
                            className="p-2 hover:bg-ferrari-red/10 rounded-lg transition-all duration-300 relative group"
                            title="Të ruajtura"
                        >
                            <Heart size={20} className="text-white/70 group-hover:text-ferrari-red transition-colors" />
                            {!savedLoading && savedCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-ferrari-red text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-md animate-in zoom-in duration-200">
                                    {savedCount > 99 ? '99+' : savedCount}
                                </span>
                            )}
                        </Link>

                        {status === 'authenticated' ? (
                            <div className="relative group">
                                <button className="p-1 hover:bg-ferrari-red/10 rounded-lg transition-all duration-300">
                                    <div className="w-8 h-8 bg-gradient-to-br from-ferrari-red to-ferrari-dark rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-all">
                                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                                    </div>
                                </button>

                                <div className="absolute z-50 right-0 mt-2 w-56 bg-elevated rounded-xl shadow-xl border border-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                                    <div className="py-2">
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2.5 text-sm text-secondary hover:bg-ferrari-red/10 hover:text-ferrari-red transition-colors mx-2 rounded-lg"
                                        >
                                            Profili im
                                        </Link>
                                        <Link
                                            href="/saved"
                                            className="block px-4 py-2.5 text-sm text-secondary hover:bg-ferrari-red/10 hover:text-ferrari-red transition-colors mx-2 rounded-lg flex items-center justify-between"
                                        >
                                            <span>Makinat e ruajtura</span>
                                            {savedCount > 0 && (
                                                <span className="bg-ferrari-red text-white text-xs px-2 py-0.5 rounded-full">
                                                    {savedCount}
                                                </span>
                                            )}
                                        </Link>
                                        <Link
                                            href="/recently-viewed"
                                            className="block px-4 py-2.5 text-sm text-secondary hover:bg-ferrari-red/10 hover:text-ferrari-red transition-colors mx-2 rounded-lg"
                                        >
                                            Shikuar së fundmi
                                        </Link>
                                    </div>
                                    <div className="border-t border-medium py-2">
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="block w-full text-left px-4 py-2.5 text-sm text-error-text hover:bg-error-bg transition-colors mx-2 rounded-lg"
                                        >
                                            Dil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 ml-2">
                                <Link
                                    href="/auth/signin"
                                    className="px-4 py-2 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-ferrari-red hover:border-ferrari-red hover:text-white transition-all duration-300"
                                >
                                    Hyr
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="px-4 py-2 text-sm font-medium bg-ferrari-red text-white rounded-lg hover:bg-ferrari-dark transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    Regjistrohu
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-ferrari-red/10 rounded-lg transition-colors relative"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {!savedLoading && savedCount > 0 && !isMenuOpen && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-ferrari-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {savedCount > 9 ? '9+' : savedCount}
                            </span>
                        )}
                        {isMenuOpen ? <X size={24} className="text-white/70" /> : <Menu size={24} className="text-white/70" />}
                    </button>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden pb-4">
                    <SearchBar />
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-6 animate-slideDown">
                        <div className="bg-surface-2 rounded-xl p-3 border border-medium shadow-xl">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-medium mb-2">
                                <span className="text-sm text-secondary">Tema</span>
                                <ThemeToggle />
                            </div>

                            <Link
                                href="/saved"
                                className="flex items-center px-4 py-3 hover:bg-surface rounded-lg transition-colors group"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Heart size={18} className="mr-3 text-muted group-hover:text-ferrari-red" />
                                <span className="text-secondary group-hover:text-ferrari-red flex-1">Të ruajtura</span>
                                {savedCount > 0 && (
                                    <span className="bg-ferrari-red text-white text-xs px-2 py-0.5 rounded-full">
                                        {savedCount}
                                    </span>
                                )}
                            </Link>

                            <Link
                                href="/recently-viewed"
                                className="flex items-center px-4 py-3 hover:bg-surface rounded-lg transition-colors group"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="w-[18px] mr-3 text-muted group-hover:text-ferrari-red text-center">⌛</span>
                                <span className="text-secondary group-hover:text-ferrari-red">Shikuar së fundmi</span>
                            </Link>

                            {status === 'authenticated' ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="flex items-center px-4 py-3 hover:bg-surface rounded-lg transition-colors group"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <User size={18} className="mr-3 text-muted group-hover:text-ferrari-red" />
                                        <span className="text-secondary group-hover:text-ferrari-red">Llogaria ime</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            signOut({ callbackUrl: '/' });
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center px-4 py-3 hover:bg-surface rounded-lg transition-colors group text-left"
                                    >
                                        <LogIn size={18} className="mr-3 text-error-text rotate-180" />
                                        <span className="text-error-text">Dil</span>
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-medium">
                                    <Link
                                        href="/auth/signin"
                                        className="px-4 py-3 text-center text-ferrari-red border border-ferrari-red/30 rounded-lg hover:bg-ferrari-red hover:text-white transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Hyr
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="px-4 py-3 text-center bg-ferrari-red text-white rounded-lg hover:bg-ferrari-dark transition-colors shadow-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Regjistrohu
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:block bg-ferrari-red/95 backdrop-blur-sm border-t border-ferrari-red/20">
                <div className="container-custom">
                    <ul className="flex items-center space-x-8 py-3">
                        {[
                            { href: '/cars', label: 'Të gjitha makinat' },
                            { href: '/brands', label: 'Markat' },
                            { href: '/offers', label: 'Ofertat e javës' },
                            { href: '/how-it-works', label: 'Si funksionon' },
                            { href: '/compare', label: 'Krahaso' },
                        ].map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`relative text-sm font-medium transition-colors py-1.5 px-2 rounded-lg ${pathname === item.href
                                            ? 'text-white bg-white/10'
                                            : 'text-white/70 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </header>
    );
}