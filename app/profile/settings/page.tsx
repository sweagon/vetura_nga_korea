'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Bell, Globe, Moon, Shield, ChevronLeft, Check } from 'lucide-react';

export default function ProfileSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [language, setLanguage] = useState('sq');
    const [theme, setTheme] = useState('system');
    const [notifications, setNotifications] = useState(true);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="container-custom py-12">
                <div className="animate-pulse">
                    <div className="h-8 bg-tertiary rounded w-48 mb-8"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/profile" className="inline-flex items-center text-sm text-secondary hover:text-ferrari-red mb-6 transition">
                    <ChevronLeft size={16} className="mr-1" />
                    Kthehu te profili
                </Link>

                <h1 className="text-3xl font-bold mb-6">Cilësimet</h1>

                <div className="bg-surface rounded-lg shadow-md divide-y">
                    {/* Notifications */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <Bell className="text-ferrari-red mr-4" size={20} />
                            <div>
                                <h3 className="font-medium">Njoftimet</h3>
                                <p className="text-sm text-secondary">Merr njoftime për oferta</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-ferrari-red' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                    {/* Language */}
                    <div className="p-6">
                        <button
                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Globe className="text-ferrari-red mr-4" size={20} />
                                <div className="text-left">
                                    <h3 className="font-medium">Gjuha</h3>
                                    <p className="text-sm text-secondary">
                                        {language === 'sq' ? 'Shqip' : 'English'}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className={`text-muted transition-transform ${showLanguageMenu ? 'rotate-90' : ''}`} size={20} />
                        </button>

                        {showLanguageMenu && (
                            <div className="mt-3 ml-9 space-y-2">
                                <button
                                    onClick={() => { setLanguage('sq'); setShowLanguageMenu(false); }}
                                    className="flex items-center justify-between w-full p-2 hover:bg-secondary rounded"
                                >
                                    <span>Shqip</span>
                                    {language === 'sq' && <Check size={16} className="text-ferrari-red" />}
                                </button>
                                <button
                                    onClick={() => { setLanguage('en'); setShowLanguageMenu(false); }}
                                    className="flex items-center justify-between w-full p-2 hover:bg-secondary rounded"
                                >
                                    <span>English</span>
                                    {language === 'en' && <Check size={16} className="text-ferrari-red" />}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Theme */}
                    <div className="p-6">
                        <button
                            onClick={() => setShowThemeMenu(!showThemeMenu)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Moon className="text-ferrari-red mr-4" size={20} />
                                <div className="text-left">
                                    <h3 className="font-medium">Tema</h3>
                                    <p className="text-sm text-secondary">
                                        {theme === 'light' ? 'E çelët' : theme === 'dark' ? 'E errët' : 'Automatike'}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className={`text-muted transition-transform ${showThemeMenu ? 'rotate-90' : ''}`} size={20} />
                        </button>

                        {showThemeMenu && (
                            <div className="mt-3 ml-9 space-y-2">
                                <button onClick={() => { setTheme('light'); setShowThemeMenu(false); }} className="flex items-center justify-between w-full p-2 hover:bg-secondary rounded">
                                    <span>E çelët</span>
                                    {theme === 'light' && <Check size={16} className="text-ferrari-red" />}
                                </button>
                                <button onClick={() => { setTheme('dark'); setShowThemeMenu(false); }} className="flex items-center justify-between w-full p-2 hover:bg-secondary rounded">
                                    <span>E errët</span>
                                    {theme === 'dark' && <Check size={16} className="text-ferrari-red" />}
                                </button>
                                <button onClick={() => { setTheme('system'); setShowThemeMenu(false); }} className="flex items-center justify-between w-full p-2 hover:bg-secondary rounded">
                                    <span>Automatike</span>
                                    {theme === 'system' && <Check size={16} className="text-ferrari-red" />}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Privacy */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <Shield className="text-ferrari-red mr-4" size={20} />
                            <div>
                                <h3 className="font-medium">Privatësia</h3>
                                <p className="text-sm text-secondary">Menaxho të dhënat personale</p>
                            </div>
                        </div>
                        <Link href="/privacy" className="text-ferrari-red hover:underline text-sm">
                            Shiko
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}