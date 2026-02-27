'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Cookie, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function CookiesPage() {
    const [settings, setSettings] = useState({
        essential: true,
        functional: false,
        analytics: false
    });
    const { showToast } = useToast();

    useEffect(() => {
        // Load current settings
        const consent = localStorage.getItem('cookieConsent');
        setSettings({
            essential: true, // Always true
            functional: consent === 'all' || consent === 'essential',
            analytics: consent === 'all'
        });
    }, []);

    const saveSettings = () => {
        if (settings.analytics) {
            localStorage.setItem('cookieConsent', 'all');
        } else if (settings.functional) {
            localStorage.setItem('cookieConsent', 'essential');
        } else {
            localStorage.setItem('cookieConsent', 'none');
        }
        showToast('success', 'Preferencat u ruajtën');
    };

    return (
        <div className="container-custom py-12 max-w-3xl">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-secondary mb-6">
                <Link href="/" className="hover:text-ferrari-red">Formula Export</Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-ferrari-red">Cilësimet e Cookies</span>
            </div>

            <h1 className="text-3xl font-bold mb-2">Cilësimet e Cookies</h1>
            <p className="text-secondary mb-8">
                Menaxhoni preferencat tuaja për cookies në Formula Export.
            </p>

            <div className="bg-surface rounded-lg shadow-md p-6 space-y-6">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={18} className="text-ferrari-red" />
                            <h3 className="font-semibold">Cookies esenciale</h3>
                        </div>
                        <p className="text-sm text-secondary">
                            Të nevojshme për funksionimin bazë të faqes. Nuk mund të çaktivizohen.
                        </p>
                    </div>
                    <div className="ml-4">
                        <span className="px-3 py-1 bg-success-bg text-green-700 rounded-full text-sm">
                            Gjithmonë aktive
                        </span>
                    </div>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Cookie size={18} className="text-ferrari-red" />
                            <h3 className="font-semibold">Cookies funksionale</h3>
                        </div>
                        <p className="text-sm text-secondary">
                            Mundësojnë Matchmaker-in të mësojë preferencat tuaja dhe të japë rekomandime të personalizuara.
                        </p>
                    </div>
                    <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.functional}
                                onChange={(e) => setSettings({ ...settings, functional: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ferrari-red/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-light after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-surface after:border-medium after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ferrari-red"></div>
                        </label>
                    </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={18} className="text-ferrari-red" />
                            <h3 className="font-semibold">Cookies analitike</h3>
                        </div>
                        <p className="text-sm text-secondary">
                            Na ndihmojnë të kuptojmë se si përdorni faqen, për ta përmirësuar atë.
                        </p>
                    </div>
                    <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.analytics}
                                onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ferrari-red/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-light after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-surface after:border-medium after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ferrari-red"></div>
                        </label>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-4">
                    <Link
                        href="/"
                        className="px-6 py-2 border border-medium rounded-lg hover:bg-secondary transition"
                    >
                        Anulo
                    </Link>
                    <button
                        onClick={saveSettings}
                        className="px-6 py-2 bg-ferrari-red text-primary rounded-lg hover:bg-ferrari-dark transition"
                    >
                        Ruaj ndryshimet
                    </button>
                </div>
            </div>

            <p className="text-sm text-secondary mt-6">
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
    );
}
