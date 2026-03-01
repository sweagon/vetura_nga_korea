// app/cars/[id]/not-found.tsx
import Link from 'next/link';
import { Car, Search, Home, ArrowLeft } from 'lucide-react';

// This is a server component - NO 'use client' directive
// NO useState, useEffect, useSearchParams, etc.
export default function CarNotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-primary">
            <div className="container-swiss max-w-2xl">
                <div className="bg-surface rounded-2xl p-8 md:p-12 shadow-xl border border-medium">
                    {/* Icon */}
                    <div className="relative mb-8">
                        <div className="w-28 h-28 bg-orange-primary/10 rounded-2xl flex items-center justify-center mx-auto rotate-3">
                            <Car size={56} className="text-orange-primary" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-orange-primary rounded-full flex items-center justify-center text-white font-bold text-xl animate-pulse">
                            ?
                        </div>
                    </div>

                    {/* Text */}
                    <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-center">
                        Makina nuk u gjet
                    </h1>

                    <p className="text-lg text-secondary mb-8 text-center max-w-md mx-auto">
                        Makina që po kërkoni nuk ekziston, është shitur, ose ka një problem me lidhjen.
                    </p>

                    {/* REMOVED the debug section that uses process.env.NODE_ENV */}
                    {/* This was causing the issue during build */}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                        <Link
                            href="/cars"
                            className="group flex items-center justify-center gap-3 p-4 bg-orange-primary text-white rounded-xl hover:bg-orange-dark transition-all hover:scale-105"
                        >
                            <Search size={20} />
                            <span className="font-medium">Shfleto makina</span>
                        </Link>

                        <Link
                            href="/"
                            className="group flex items-center justify-center gap-3 p-4 bg-surface-2 text-primary hover:bg-surface-3 rounded-xl border border-light/20 transition-all hover:scale-105"
                        >
                            <Home size={20} />
                            <span className="font-medium">Kthehu në fillim</span>
                        </Link>
                    </div>

                    {/* Back link */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/cars"
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-orange-primary transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span>Kthehu te lista e makinave</span>
                        </Link>
                    </div>

                    {/* Support Link */}
                    <div className="mt-8 pt-8 border-t border-light/20 text-center">
                        <p className="text-sm text-muted">
                            Mendon se ky është një gabim?{' '}
                            <Link
                                href="/contact"
                                className="text-orange-primary hover:underline font-medium"
                            >
                                Na kontakto
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}