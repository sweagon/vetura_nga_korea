// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save,
    Settings,
    DollarSign,
    Truck,
    Percent,
    Globe,
    LogIn,
    Lock,
    Shield,
    AlertCircle,
    LogOut,
    Mail,
    Phone,
    Building2
} from 'lucide-react';
import { useConfig } from '@/lib/ConfigContext';

// Maximum number of login attempts
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minuta

export default function AdminPage() {
    const router = useRouter();
    const { config, updateConfig, validateConfig } = useConfig();

    // Local state for form (to allow editing before save)
    const [localConfig, setLocalConfig] = useState(config);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

    // Security state
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Update local config when context config changes
    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    // Check if already authenticated via session
    useEffect(() => {
        const checkAuth = () => {
            const session = localStorage.getItem('adminSession');
            if (session) {
                const { expires } = JSON.parse(session);
                if (Date.now() < expires) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('adminSession');
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check lockout
        if (lockoutUntil && Date.now() < lockoutUntil) {
            const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
            setSaveMessage({
                text: `Shumë përpjekje. Provo përsëri pas ${minutesLeft} minutash.`,
                type: 'error'
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setLoginAttempts(0);
                setLockoutUntil(null);

                const session = {
                    expires: Date.now() + 2 * 60 * 60 * 1000 // 2 orë
                };
                localStorage.setItem('adminSession', JSON.stringify(session));

                setIsAuthenticated(true);
                setSaveMessage({ text: '', type: '' });
            } else {
                const newAttempts = loginAttempts + 1;
                setLoginAttempts(newAttempts);

                if (newAttempts >= MAX_ATTEMPTS) {
                    const lockout = Date.now() + LOCKOUT_TIME;
                    setLockoutUntil(lockout);
                    setSaveMessage({
                        text: `Shumë përpjekje të dështuara. Llogaria është bllokuar për 15 minuta.`,
                        type: 'error'
                    });
                } else {
                    setSaveMessage({
                        text: `Fjalëkalimi i gabuar. ${MAX_ATTEMPTS - newAttempts} përpjekje të mbetura.`,
                        type: 'error'
                    });
                }
            }
        } catch (error) {
            setSaveMessage({ text: 'Hyrja dështoi. Provo përsëri.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminSession');
        setIsAuthenticated(false);
        setPassword('');
    };

    const handleSave = () => {
        setIsSaving(true);

        // Validate using the context's validation
        const { valid, errors } = validateConfig(localConfig);

        if (!valid) {
            setSaveMessage({
                text: `Gabim: ${errors.join(', ')}`,
                type: 'error'
            });
            setIsSaving(false);
            return;
        }

        // Additional business logic checks
        if (localConfig.markupPercentage === 0 && localConfig.minimumMarkup === 0) {
            if (!confirm('Jeni duke vendosur marzhë 0%. Vazhdoni?')) {
                setIsSaving(false);
                return;
            }
        }

        // Update config in context
        updateConfig(localConfig);

        setSaveMessage({ text: '✅ Cilësimet u ruajtën me sukses!', type: 'success' });
        setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
        setIsSaving(false);
    };

    const handleReset = () => {
        if (confirm('A jeni i sigurt që doni të riktheni vlerat e paracaktuara?')) {
            const defaultConfig = {
                shippingCost: 3500,
                markupPercentage: 15,
                minimumMarkup: 1000,
                contactEmail: 'info@vetura-nga-korea.com',
                contactPhone: '+383 44 123 456',
                siteName: 'Vetura Nga Korea',
                currency: 'EUR' as const
            };
            setLocalConfig(defaultConfig);
            updateConfig(defaultConfig);
            setSaveMessage({ text: '✅ U rikthye në vlerat e paracaktuara', type: 'success' });
        }
    };

    const updateField = (field: keyof typeof localConfig, value: any) => {
        setLocalConfig(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-primary border-t-transparent"></div>
            </div>
        );
    }

    // Login Screen - Albanian
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy flex items-center justify-center p-4">
                <div className="bg-surface/50 backdrop-blur-xl border border-light/20 rounded-2xl p-8 w-full max-w-md relative">
                    {/* Security Badge */}
                    <div className="absolute -top-3 -right-3 bg-orange-primary text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Shield size={12} />
                        E Sigurt
                    </div>

                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-orange-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                            <Lock className="w-10 h-10 text-orange-primary" />
                            {loginAttempts > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-error-text rounded-full flex items-center justify-center text-white text-xs">
                                    {loginAttempts}
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-primary mb-2">Hyrja për Administratorë</h1>
                        <p className="text-secondary text-sm">Shkruani fjalëkalimin për të menaxhuar cilësimet</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="relative mb-6">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Shkruani fjalëkalimin"
                                className="input text-center text-lg pr-10"
                                autoFocus
                                disabled={isLoading || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                            />
                            {lockoutUntil && Date.now() < lockoutUntil && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <AlertCircle className="w-5 h-5 text-error-text" />
                                </div>
                            )}
                        </div>

                        {saveMessage.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm text-center ${saveMessage.type === 'error'
                                ? 'bg-error-bg text-error-text border border-error-border'
                                : 'bg-success-bg text-success-text border border-success-border'
                                }`}>
                                {saveMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                            className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Duke verifikuar...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <LogIn className="w-5 h-5" />
                                    Hyr në Panelin Administrator
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-muted">
                            ⚡ Maksimumi {MAX_ATTEMPTS} përpjekje | Bllokim {LOCKOUT_TIME / 60000} minuta
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Main Admin Panel - Albanian
    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy py-12">
            <div className="container-swiss max-w-4xl">
                {/* Header with Logout */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="p-3 bg-orange-primary/10 rounded-xl shrink-0">
                            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-orange-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary truncate">
                                Cilësimet e Faqes
                            </h1>
                            <p className="text-xs sm:text-sm text-secondary truncate">
                                Rregulloni çmimet dhe informacionet e kontaktit
                            </p>
                        </div>
                    </div>

                    {/* Buttons - Stack vertically on mobile, horizontal on desktop */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleReset}
                            className="px-3 py-2 sm:px-4 sm:py-2 text-sm text-secondary hover:text-primary border border-light/20 rounded-lg hover:bg-surface-2 transition flex items-center justify-center gap-2"
                            title="Rikthe vlerat e paracaktuara"
                        >
                            <span>Rikthe</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2 sm:px-4 sm:py-2 text-sm text-secondary hover:text-primary border border-light/20 rounded-lg hover:bg-surface-2 transition flex items-center justify-center gap-2"
                        >
                            <LogOut size={16} />
                            <span>Dil</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 sm:px-6 sm:py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save size={16} />
                            <span>{isSaving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}</span>
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {saveMessage.text && (
                    <div className={`mb-6 p-4 rounded-xl ${saveMessage.type === 'success'
                        ? 'bg-success-bg border border-success-border text-success-text'
                        : 'bg-error-bg border border-error-border text-error-text'
                        }`}>
                        {saveMessage.text}
                    </div>
                )}

                {/* Pricing Cards */}
                {/* Pricing Cards - Fully Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                    {/* Transporti Card */}
                    <div className="bg-surface/30 backdrop-blur-sm border border-light/20 rounded-xl p-4 sm:p-5 md:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="p-1.5 sm:p-2 bg-orange-primary/10 rounded-lg">
                                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-orange-primary" />
                            </div>
                            <h3 className="text-sm sm:text-base font-medium text-primary">Transporti</h3>
                        </div>
                        <div className="relative">
                            <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted">€</span>
                            <input
                                type="number"
                                value={localConfig.shippingCost}
                                onChange={(e) => updateField('shippingCost', Number(e.target.value))}
                                className="input pl-6 sm:pl-8 text-base sm:text-lg font-semibold"
                                step="100"
                                min="0"
                            />
                        </div>
                        <p className="text-xs text-muted mt-2 leading-relaxed">Kosto fikse e transportit për makinë</p>
                    </div>

                    {/* Marzha % Card */}
                    <div className="bg-surface/30 backdrop-blur-sm border border-light/20 rounded-xl p-4 sm:p-5 md:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="p-1.5 sm:p-2 bg-orange-primary/10 rounded-lg">
                                <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-orange-primary" />
                            </div>
                            <h3 className="text-sm sm:text-base font-medium text-primary">Marzha %</h3>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={localConfig.markupPercentage}
                                onChange={(e) => updateField('markupPercentage', Number(e.target.value))}
                                className="input text-base sm:text-lg font-semibold pr-8"
                                step="0.5"
                                min="0"
                                max="100"
                            />
                            <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted">%</span>
                        </div>
                        <p className="text-xs text-muted mt-2 leading-relaxed">Përqindja që shtohet në total</p>
                    </div>

                    {/* Marzha Minimale Card */}
                    <div className="bg-surface/30 backdrop-blur-sm border border-light/20 rounded-xl p-4 sm:p-5 md:p-6 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="p-1.5 sm:p-2 bg-orange-primary/10 rounded-lg">
                                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-primary" />
                            </div>
                            <h3 className="text-sm sm:text-base font-medium text-primary">Marzha Minimale</h3>
                        </div>
                        <div className="relative">
                            <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted">€</span>
                            <input
                                type="number"
                                value={localConfig.minimumMarkup}
                                onChange={(e) => updateField('minimumMarkup', Number(e.target.value))}
                                className="input pl-6 sm:pl-8 text-base sm:text-lg font-semibold"
                                step="100"
                                min="0"
                            />
                        </div>
                        <p className="text-xs text-muted mt-2 leading-relaxed">Fitimi minimal për makinë</p>
                    </div>
                </div>

                {/* Contact Information - Responsive */}
                <div className="bg-surface/30 backdrop-blur-sm border border-light/20 rounded-xl p-4 sm:p-5 md:p-6 mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4 sm:mb-6 flex items-center gap-2">
                        <Building2 className="text-orange-primary w-5 h-5 sm:w-6 sm:h-6" size={20} />
                        <span>Informacionet e Kontaktit</span>
                    </h2>

                    {/* Form fields - Stack on mobile, 2 columns on tablet+ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-xs sm:text-sm text-muted">Emri i Faqes</label>
                            <input
                                type="text"
                                value={localConfig.siteName}
                                onChange={(e) => updateField('siteName', e.target.value)}
                                className="input text-sm sm:text-base"
                                placeholder="Vetura Nga Korea"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs sm:text-sm text-muted flex items-center gap-1">
                                <Mail size={14} className="shrink-0" />
                                <span>Email-i i Kontaktit</span>
                            </label>
                            <input
                                type="email"
                                value={localConfig.contactEmail}
                                onChange={(e) => updateField('contactEmail', e.target.value)}
                                className="input text-sm sm:text-base"
                                placeholder="info@vetura-nga-korea.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs sm:text-sm text-muted flex items-center gap-1">
                                <Phone size={14} className="shrink-0" />
                                <span>Telefoni i Kontaktit</span>
                            </label>
                            <input
                                type="tel"
                                value={localConfig.contactPhone}
                                onChange={(e) => updateField('contactPhone', e.target.value)}
                                className="input text-sm sm:text-base"
                                placeholder="+383 44 123 456"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs sm:text-sm text-muted">Valuta</label>
                            <select
                                value={localConfig.currency}
                                onChange={(e) => updateField('currency', e.target.value as 'EUR' | 'USD' | 'ALL')}
                                className="select text-sm sm:text-base"
                            >
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">Dollar Amerikan ($)</option>
                                <option value="ALL">Lekë Shqiptar (Lek)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Live Preview - Responsive */}
                <div className="bg-surface/30 backdrop-blur-sm border border-light/20 rounded-xl p-4 sm:p-5 md:p-6 mb-8">
                    <h2 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Parapamje e Çmimeve</h2>

                    <div className="bg-surface-2/50 rounded-lg p-4 sm:p-5 md:p-6">
                        {/* Base Price Display */}
                        <div className="text-center mb-4 sm:mb-6">
                            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-primary">
                                {new Intl.NumberFormat('sq-AL', {
                                    style: 'currency',
                                    currency: localConfig.currency,
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(15000)}
                            </span>
                            <span className="text-xs sm:text-sm text-muted block sm:inline sm:ml-2 mt-1 sm:mt-0">
                                çmimi bazë
                            </span>
                        </div>

                        {/* Price Breakdown - Responsive layout */}
                        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm max-w-md mx-auto">
                            {/* Base Price */}
                            <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-light/20">
                                <span className="text-muted">Çmimi Bazë:</span>
                                <span className="text-primary font-medium">
                                    {new Intl.NumberFormat('sq-AL', {
                                        style: 'currency',
                                        currency: localConfig.currency,
                                        minimumFractionDigits: 0
                                    }).format(15000)}
                                </span>
                            </div>

                            {/* Shipping */}
                            <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-light/20">
                                <span className="text-muted">Transporti:</span>
                                <span className="text-primary font-medium">
                                    {new Intl.NumberFormat('sq-AL', {
                                        style: 'currency',
                                        currency: localConfig.currency,
                                        minimumFractionDigits: 0
                                    }).format(localConfig.shippingCost)}
                                </span>
                            </div>

                            {/* Markup */}
                            <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-light/20">
                                <span className="text-muted">Marzha ({localConfig.markupPercentage}%):</span>
                                <span className="text-primary font-medium">
                                    {new Intl.NumberFormat('sq-AL', {
                                        style: 'currency',
                                        currency: localConfig.currency,
                                        minimumFractionDigits: 0
                                    }).format(Math.round((15000 + localConfig.shippingCost) * localConfig.markupPercentage / 100))}
                                </span>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center py-2 sm:py-3 font-bold">
                                <span className="text-primary">Totali:</span>
                                <span className="text-orange-primary text-base sm:text-lg md:text-xl">
                                    {new Intl.NumberFormat('sq-AL', {
                                        style: 'currency',
                                        currency: localConfig.currency,
                                        minimumFractionDigits: 0
                                    }).format(
                                        Math.max(
                                            15000 + localConfig.shippingCost +
                                            Math.round((15000 + localConfig.shippingCost) * localConfig.markupPercentage / 100),
                                            15000 + localConfig.minimumMarkup
                                        )
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Helper text */}
                        <p className="text-xs text-center text-muted mt-4 sm:mt-6 px-2">
                            Ky është shembull se si do të duken çmimet për klientët
                        </p>
                    </div>
                </div>

                {/* Security Notice - Albanian */}
                <div className="mt-8 p-4 bg-surface-2/30 rounded-lg border border-light/20">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-orange-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-secondary">
                                <span className="font-medium text-orange-primary">Sesion i Sigurt:</span> Do të dilni automatikisht pas 2 orësh pa aktivitet.
                            </p>
                            <p className="text-xs text-muted mt-1 flex flex-wrap gap-2">
                                <span>IP: Mbrojtur</span>
                                <span>•</span>
                                <span>Sesioni: I enkriptuar</span>
                                <span>•</span>
                                <span>Të gjitha ndryshimet regjistrohen</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Simple Instructions in Albanian */}
                <div className="mt-4 p-4 bg-surface-2/30 rounded-lg border border-light/20">
                    <p className="text-sm text-secondary">
                        <span className="font-medium text-orange-primary">💡 Si të përdorni:</span> Ndryshoni vlerat më lart dhe klikoni "Ruaj Ndryshimet".
                        Të gjitha cilësimet do të ruhen menjëherë dhe do të aplikohen në faqe.
                    </p>
                </div>
            </div>
        </div>
    );
}