// components/ui/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Check, Settings } from 'lucide-react';
import Link from 'next/link';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [consents, setConsents] = useState({
        necessary: true, // Always true - can't disable
        analytics: false,
        marketing: false,
        preferences: false,
    });

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        } else {
            // Load saved consents
            const saved = JSON.parse(consent);
            setConsents(saved);

            // Update Google Consent Mode
            updateGoogleConsent(saved);
        }
    }, []);

    const updateGoogleConsent = (consentData: typeof consents) => {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                'ad_storage': consentData.marketing ? 'granted' : 'denied',
                'ad_user_data': consentData.marketing ? 'granted' : 'denied',
                'ad_personalization': consentData.marketing ? 'granted' : 'denied',
                'analytics_storage': consentData.analytics ? 'granted' : 'denied',
                'functionality_storage': consentData.preferences ? 'granted' : 'denied',
                'personalization_storage': consentData.preferences ? 'granted' : 'denied',
                'security_storage': 'granted', // Always granted for security
            });
        }
    };

    const handleAcceptAll = () => {
        const newConsents = {
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true,
        };
        setConsents(newConsents);
        localStorage.setItem('cookie-consent', JSON.stringify(newConsents));
        updateGoogleConsent(newConsents);
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleRejectAll = () => {
        const newConsents = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
        };
        setConsents(newConsents);
        localStorage.setItem('cookie-consent', JSON.stringify(newConsents));
        updateGoogleConsent(newConsents);
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleSaveSettings = () => {
        localStorage.setItem('cookie-consent', JSON.stringify(consents));
        updateGoogleConsent(consents);
        setIsVisible(false);
        setShowSettings(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-surface rounded-2xl shadow-2xl border border-medium overflow-hidden">
                    {!showSettings ? (
                        // Main Banner
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-ferrari-red/10 rounded-full flex items-center justify-center">
                                        <Cookie size={24} className="text-ferrari-red" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-primary mb-2">🍪 Cookies në Formula Export</h3>
                                    <p className="text-secondary text-sm mb-4">
                                        Ne përdorim cookies për të përmirësuar përvojën tuaj, për të personalizuar rekomandimet
                                        dhe për të analizuar trafikun. Duke klikuar "Prano të gjitha", ju pajtoheni me përdorimin
                                        e të gjitha cookies-ve. Mund të menaxhoni preferencat tuaja duke klikuar "Cilësimet".
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={handleAcceptAll}
                                            className="px-4 py-2 bg-ferrari-red text-white rounded-lg hover:bg-ferrari-dark transition flex items-center gap-2"
                                        >
                                            <Check size={16} />
                                            <span>Prano të gjitha</span>
                                        </button>
                                        <button
                                            onClick={() => setShowSettings(true)}
                                            className="px-4 py-2 bg-surface-2 text-secondary rounded-lg hover:bg-surface border border-medium transition flex items-center gap-2"
                                        >
                                            <Settings size={16} />
                                            <span>Cilësimet</span>
                                        </button>
                                        <Link
                                            href="/privacy"
                                            className="px-4 py-2 text-secondary hover:text-ferrari-red transition"
                                        >
                                            Mëso më shumë
                                        </Link>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRejectAll}
                                    className="flex-shrink-0 text-muted hover:text-ferrari-red transition"
                                    aria-label="Mbyll"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Settings Panel
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-primary">Cilësimet e cookies</h3>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="text-muted hover:text-ferrari-red transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                {/* Necessary Cookies - Always enabled */}
                                <div className="flex items-start justify-between p-3 bg-surface-2 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-primary">Të nevojshme</span>
                                            <span className="text-xs bg-ferrari-red/10 text-ferrari-red px-2 py-0.5 rounded-full">Gjithmonë aktive</span>
                                        </div>
                                        <p className="text-xs text-secondary">Këto cookies janë të domosdoshme për funksionimin e faqes.</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={consents.necessary}
                                            disabled
                                            className="w-5 h-5 rounded border-medium text-ferrari-red focus:ring-ferrari-red"
                                        />
                                    </div>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="flex items-start justify-between p-3 hover:bg-surface-2 rounded-lg transition">
                                    <div className="flex-1">
                                        <span className="font-medium text-primary block mb-1">Analitikë</span>
                                        <p className="text-xs text-secondary">Na ndihmojnë të kuptojmë se si vizitorët ndërveprojnë me faqen.</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={consents.analytics}
                                            onChange={(e) => setConsents({ ...consents, analytics: e.target.checked })}
                                            className="w-5 h-5 rounded border-medium text-ferrari-red focus:ring-ferrari-red"
                                        />
                                    </div>
                                </div>

                                {/* Marketing Cookies */}
                                <div className="flex items-start justify-between p-3 hover:bg-surface-2 rounded-lg transition">
                                    <div className="flex-1">
                                        <span className="font-medium text-primary block mb-1">Marketingu</span>
                                        <p className="text-xs text-secondary">Përdoren për të shfaqur reklama të personalizuara.</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={consents.marketing}
                                            onChange={(e) => setConsents({ ...consents, marketing: e.target.checked })}
                                            className="w-5 h-5 rounded border-medium text-ferrari-red focus:ring-ferrari-red"
                                        />
                                    </div>
                                </div>

                                {/* Preferences Cookies */}
                                <div className="flex items-start justify-between p-3 hover:bg-surface-2 rounded-lg transition">
                                    <div className="flex-1">
                                        <span className="font-medium text-primary block mb-1">Preferencat</span>
                                        <p className="text-xs text-secondary">Lejojnë faqen të mbajë mend zgjedhjet tuaja.</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={consents.preferences}
                                            onChange={(e) => setConsents({ ...consents, preferences: e.target.checked })}
                                            className="w-5 h-5 rounded border-medium text-ferrari-red focus:ring-ferrari-red"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 justify-end">
                                <button
                                    onClick={handleRejectAll}
                                    className="px-4 py-2 text-secondary hover:text-ferrari-red transition"
                                >
                                    Refuzo të gjitha
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="px-4 py-2 bg-ferrari-red text-white rounded-lg hover:bg-ferrari-dark transition"
                                >
                                    Prano të gjitha
                                </button>
                                <button
                                    onClick={handleSaveSettings}
                                    className="px-4 py-2 bg-surface-2 text-secondary rounded-lg hover:bg-surface border border-medium transition"
                                >
                                    Ruaj cilësimet
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}