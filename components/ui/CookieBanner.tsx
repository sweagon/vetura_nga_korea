'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie, Shield, ChevronRight } from 'lucide-react';

export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem('cookieConsent', 'all');
        setShowBanner(false);
        // Here you could initialize analytics, etc.
    };

    const acceptEssential = () => {
        localStorage.setItem('cookieConsent', 'essential');
        setShowBanner(false);
    };

    const declineAll = () => {
        localStorage.setItem('cookieConsent', 'none');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Backdrop for mobile */}
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => setShowBanner(false)} />

            {/* Banner */}
            <div className="relative bg-surface border-t border-theme shadow-2xl">
                <div className="container-custom py-6">
                    {/* Close button */}
                    <button
                        onClick={declineAll}
                        className="absolute top-4 right-4 text-muted hover:text-secondary transition"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                        {/* Icon */}
                        <div className="hidden lg:flex w-12 h-12 bg-ferrari-red/10 rounded-full items-center justify-center flex-shrink-0">
                            <Cookie className="text-ferrari-red" size={24} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Cookie className="text-ferrari-red lg:hidden" size={20} />
                                <h3 className="font-bold text-lg">Cookies në Formula Export</h3>
                            </div>

                            <p className="text-secondary text-sm mb-3">
                                Ne përdorim cookies për të përmirësuar përvojën tuaj,
                                për të personalizuar rekomandimet dhe për të analizuar trafikun.
                            </p>

                            {/* Details toggle */}
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-ferrari-red text-sm hover:underline flex items-center mb-3"
                            >
                                {showDetails ? 'Më pak detaje' : 'Më shumë detaje'}
                                <ChevronRight
                                    size={16}
                                    className={`ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`}
                                />
                            </button>

                            {/* Detailed information */}
                            {showDetails && (
                                <div className="bg-secondary p-4 rounded-lg mb-4 space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <Shield size={16} className="text-ferrari-red mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium">Cookies esenciale:</span>
                                            <p className="text-secondary">Ruajnë preferencat tuaja, makinat e ruajtura dhe kërkimet e fundit.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Shield size={16} className="text-ferrari-red mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium">Cookies funksionale:</span>
                                            <p className="text-secondary">Mundësojnë Matchmaker-in të mësojë preferencat tuaja.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Shield size={16} className="text-ferrari-red mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium">Cookies analitike:</span>
                                            <p className="text-secondary">Na ndihmojnë të kuptojmë se si përdorni faqen.</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-secondary mt-2">
                                        Për më shumë informacion, lexoni{' '}
                                        <Link href="/privacy" className="text-ferrari-red hover:underline">
                                            Politikën e Privatësisë
                                        </Link>
                                        {' '}dhe{' '}
                                        <Link href="/terms" className="text-ferrari-red hover:underline">
                                            Termat e Përdorimit
                                        </Link>.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <button
                                onClick={acceptEssential}
                                className="px-6 py-3 border-2 border-ferrari-red text-ferrari-red rounded-lg font-medium hover:bg-ferrari-red/5 transition whitespace-nowrap"
                            >
                                Vetëm esenciale
                            </button>
                            <button
                                onClick={acceptAll}
                                className="px-6 py-3 bg-ferrari-red text-primary rounded-lg font-medium hover:bg-ferrari-dark transition whitespace-nowrap"
                            >
                                Pranoj të gjitha
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
