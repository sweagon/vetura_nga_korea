// app/not-found.tsx
import Link from 'next/link';
import { Car } from 'lucide-react';

// This MUST be a server component - NO 'use client' directive
// NO useSearchParams, useState, useEffect, etc.
export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-primary">
            <div className="container-swiss max-w-2xl text-center">
                <Car className="w-24 h-24 text-orange-primary mx-auto mb-6" />
                <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                    404 - Faqja nuk u gjet
                </h1>
                <p className="text-lg text-secondary mb-8">
                    Na vjen keq, faqja që po kërkoni nuk ekziston.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-orange-primary text-white rounded-xl hover:bg-orange-dark transition-colors"
                >
                    Kthehu në fillim
                </Link>
            </div>
        </div>
    );
}