'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save,
    Settings,
    Truck,
    LogIn,
    Lock,
    Shield,
    AlertCircle,
    LogOut,
    Mail,
    Phone,
    Building2,
    ChevronDown,
    ChevronUp,
    Car,
    ToggleLeft,
    ToggleRight,
    Euro
} from 'lucide-react';
import { useConfig } from '@/lib/ConfigContext';

// Maximum number of login attempts
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minuta

// Vehicle types
const VEHICLE_TYPES = [
    { id: 'suv', label: 'SUV', description: 'Automjete të mëdha, kamioneta' },
    { id: 'sedan', label: 'Sedan', description: 'Makina familjare' },
    { id: 'hatchback', label: 'Hatchback', description: 'Makina kompakte' },
    { id: 'wagon', label: 'Kombi', description: 'Makina me hapësirë' },
    { id: 'coupe', label: 'Kupe', description: 'Makina sportive' },
    { id: 'van', label: 'Furgon', description: 'Automjete komerciale' },
    { id: 'pickup', label: 'Pickup', description: 'Kamioneta' },
    { id: 'default', label: 'Default', description: 'Vlerat standarde për të gjitha të tjerat' }
];

export default function AdminPage() {
    const router = useRouter();
    const { config, updateConfig, validateConfig } = useConfig();

    // Local state for form
    const [localConfig, setLocalConfig] = useState(config);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
    const [expandedVehicleType, setExpandedVehicleType] = useState<string | null>(null);

    // Security state
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Update local config when context config changes
    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    // Check if already authenticated via session cookie
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/admin/check-session', {
                    credentials: 'include'
                });
                const data = await response.json();
                setIsAuthenticated(data.authenticated);

                if (data.authenticated) {
                    console.log('✅ Valid session found');
                } else {
                    console.log('❌ No valid session');
                }
            } catch (error) {
                console.error('Session check error:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

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
                credentials: 'include',
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setLoginAttempts(0);
                setLockoutUntil(null);
                setIsAuthenticated(true);
                setSaveMessage({ text: '✅ Hyrja e suksesshme!', type: 'success' });
                setPassword('');

                // Redirect or update UI
                setTimeout(() => setSaveMessage({ text: '', type: '' }), 2000);
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

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/admin/verify', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setIsAuthenticated(false);
                setPassword('');
                setSaveMessage({ text: '✅ Jeni shkyçur me sukses', type: 'success' });
                setTimeout(() => setSaveMessage({ text: '', type: '' }), 2000);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            await updateConfig(localConfig);
            setSaveMessage({
                text: '✅ Cilësimet u ruajtën me sukses për të gjithë përdoruesit!',
                type: 'success'
            });
        } catch (error) {
            setSaveMessage({
                text: `Gabim: ${error instanceof Error ? error.message : 'Ruajtja dështoi'}`,
                type: 'error'
            });
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
        }
    };

    const handleReset = () => {
        if (confirm('A jeni i sigurt që doni të riktheni vlerat e paracaktuara?')) {
            const defaultConfig = {
                shippingCost: 3500,
                shippingToPristina: 350,
                contactEmail: 'blerart@outlook.com',
                contactPhone: '+383 49 195 414',
                siteName: 'Vetura Korea Kosovë',
                currency: 'EUR' as const,
                vehicleTypes: {
                    suv: { shippingCost: 4500, enabled: false },
                    sedan: { shippingCost: 3500, enabled: true },
                    hatchback: { shippingCost: 3500, enabled: true },
                    wagon: { shippingCost: 3500, enabled: true },
                    coupe: { shippingCost: 3500, enabled: true },
                    van: { shippingCost: 3800, enabled: true },
                    pickup: { shippingCost: 4000, enabled: true },
                    default: { shippingCost: 3500, enabled: true }
                }
            };
            setLocalConfig(defaultConfig);
            updateConfig(defaultConfig);
            setSaveMessage({ text: '✅ U rikthye në vlerat e paracaktuara', type: 'success' });
        }
    };

    const updateField = (field: keyof typeof localConfig, value: any) => {
        setLocalConfig(prev => ({ ...prev, [field]: value }));
    };

    const updateVehicleType = (type: string, field: string, value: any) => {
        setLocalConfig(prev => ({
            ...prev,
            vehicleTypes: {
                ...prev.vehicleTypes,
                [type]: {
                    ...(prev.vehicleTypes[type as keyof typeof prev.vehicleTypes] || {
                        shippingCost: 3500,
                        enabled: false
                    }),
                    [field]: value
                }
            }
        }));
    };

    const toggleVehicleType = (type: string) => {
        setLocalConfig(prev => {
            const currentConfig = prev.vehicleTypes[type as keyof typeof prev.vehicleTypes];
            return {
                ...prev,
                vehicleTypes: {
                    ...prev.vehicleTypes,
                    [type]: {
                        ...(currentConfig || {
                            shippingCost: 3500,
                            enabled: false
                        }),
                        enabled: !(currentConfig?.enabled || false)
                    }
                }
            };
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md relative">
                    {/* Security Badge */}
                    <div className="absolute -top-3 -right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Shield size={12} />
                        E Sigurt
                    </div>

                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                            <Lock className="w-10 h-10 text-orange-500" />
                            {loginAttempts > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                                    {loginAttempts}
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Hyrja për Administratorë</h1>
                        <p className="text-white/60 text-sm">Shkruani fjalëkalimin për të menaxhuar cilësimet</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="relative mb-6">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Shkruani fjalëkalimin"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-lg"
                                autoFocus
                                disabled={isLoading || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                            />
                            {lockoutUntil && Date.now() < lockoutUntil && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                            )}
                        </div>

                        {saveMessage.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm text-center ${saveMessage.type === 'error'
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                }`}>
                                {saveMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <p className="text-xs text-white/40">
                            ⚡ Maksimumi {MAX_ATTEMPTS} përpjekje | Bllokim {LOCKOUT_TIME / 60000} minuta
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Main Admin Panel
    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-500/20 rounded-xl">
                                <Settings className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Cilësimet e Faqes</h1>
                                <p className="text-sm text-white/60">Rregulloni transportin dhe kontaktet</p>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 transition border border-white/10"
                            >
                                Rikthe
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 transition border border-white/10 flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Dil
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {isSaving ? 'Duke ruajtur...' : 'Ruaj'}
                            </button>
                        </div>
                    </div>

                    {/* Success Message */}
                    {saveMessage.text && (
                        <div className={`mt-4 p-3 rounded-lg text-sm ${saveMessage.type === 'success'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                            {saveMessage.text}
                        </div>
                    )}
                </div>

                {/* Shipping Costs */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Truck className="text-orange-500" size={20} />
                        <span>Transporti</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Transporti Durrës */}
                        <div>
                            <label className="block text-sm text-white/70 mb-2">
                                Transporti Korea → Durrës (€)
                            </label>
                            <input
                                type="number"
                                value={localConfig.shippingCost}
                                onChange={(e) => updateField('shippingCost', Number(e.target.value))}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                step="100"
                                min="0"
                            />
                            <p className="text-xs text-white/40 mt-1">Transporti detar nga Korea në Durrës</p>
                        </div>

                        {/* Transporti Prishtinë */}
                        <div>
                            <label className="block text-sm text-white/70 mb-2">
                                Transporti Durrës → Prishtinë (€)
                            </label>
                            <input
                                type="number"
                                value={localConfig.shippingToPristina}
                                onChange={(e) => updateField('shippingToPristina', Number(e.target.value))}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                step="10"
                                min="0"
                            />
                            <p className="text-xs text-white/40 mt-1">Transporti tokësor nga Durrësi në Prishtinë</p>
                        </div>
                    </div>
                </div>
                {/* Vehicle Types */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Car className="text-orange-500" size={20} />
                        <span>Transporti sipas llojit të automjetit</span>
                    </h2>

                    <p className="text-sm text-white/60 mb-4">
                        Aktivizoni çmime të veçanta për lloje të ndryshme të automjeteve.
                    </p>

                    <div className="space-y-3">
                        {VEHICLE_TYPES.map((type) => {
                            const typeConfig = localConfig.vehicleTypes[type.id as keyof typeof localConfig.vehicleTypes];
                            const isExpanded = expandedVehicleType === type.id;

                            return (
                                <div
                                    key={type.id}
                                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                                >
                                    {/* Header */}
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => setExpandedVehicleType(isExpanded ? null : type.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleVehicleType(type.id);
                                                }}
                                                className="focus:outline-none"
                                            >
                                                {typeConfig?.enabled ? (
                                                    <ToggleRight className="w-6 h-6 text-orange-500" />
                                                ) : (
                                                    <ToggleLeft className="w-6 h-6 text-white/40" />
                                                )}
                                            </button>
                                            <div>
                                                <span className="font-medium text-white">{type.label}</span>
                                                <p className="text-xs text-white/40 mt-0.5">{type.description}</p>
                                            </div>
                                            {typeConfig?.enabled && (
                                                <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full">
                                                    Aktiv
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {typeConfig?.enabled && (
                                                <span className="text-sm text-white/60 hidden sm:block">
                                                    Transport: €{typeConfig.shippingCost}
                                                </span>
                                            )}
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-white/40" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-white/40" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && typeConfig && (
                                        <div className="p-4 border-t border-white/10 bg-white/5">
                                            <div className="max-w-xs">
                                                <label className="block text-sm text-white/70 mb-2">
                                                    Transporti (€)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={typeConfig.shippingCost}
                                                    onChange={(e) => updateVehicleType(type.id, 'shippingCost', Number(e.target.value))}
                                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    step="100"
                                                    min="0"
                                                    disabled={!typeConfig.enabled}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Building2 className="text-orange-500" size={20} />
                        <span>Informacionet e Kontaktit</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-white/70 mb-2">Emri i Faqes</label>
                            <input
                                type="text"
                                value={localConfig.siteName}
                                onChange={(e) => updateField('siteName', e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Vetura Korea Kosovë"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-white/70 mb-2 flex items-center gap-1">
                                <Mail size={14} /> Email-i
                            </label>
                            <input
                                type="email"
                                value={localConfig.contactEmail}
                                onChange={(e) => updateField('contactEmail', e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="blerart@outlook.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-white/70 mb-2 flex items-center gap-1">
                                <Phone size={14} /> Telefoni
                            </label>
                            <input
                                type="tel"
                                value={localConfig.contactPhone}
                                onChange={(e) => updateField('contactPhone', e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="+383 49 195 414"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-white/70 mb-2 flex items-center gap-1">
                                <Euro size={14} /> Valuta
                            </label>
                            <select
                                value={localConfig.currency}
                                onChange={(e) => updateField('currency', e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">USD ($)</option>
                                <option value="ALL">Lekë (Lek)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Parapamje e Çmimeve</h2>

                    <div className="bg-white/5 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sedan Example */}
                            <div>
                                <h3 className="text-sm font-medium text-white mb-3">Shembull: Sedan</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-white/70">
                                        <span>Makina (me transport):</span>
                                        <span className="text-white">
                                            €{(15000 + localConfig.shippingCost).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span>Transporti Prishtinë:</span>
                                        <span className="text-white">€{localConfig.shippingToPristina}</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-2 border-t border-white/10 text-white">
                                        <span>Totali:</span>
                                        <span className="text-orange-500">
                                            €{(15000 + localConfig.shippingCost + localConfig.shippingToPristina).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* SUV Example */}
                            <div>
                                <h3 className="text-sm font-medium text-white mb-3">Shembull: SUV</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-white/70">
                                        <span>Makina (me transport):</span>
                                        <span className="text-white">
                                            €{(25000 + (localConfig.vehicleTypes.suv?.enabled ? localConfig.vehicleTypes.suv.shippingCost : localConfig.shippingCost)).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span>Transporti Prishtinë:</span>
                                        <span className="text-white">€{localConfig.shippingToPristina}</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-2 border-t border-white/10 text-white">
                                        <span>Totali:</span>
                                        <span className="text-orange-500">
                                            €{(25000 + (localConfig.vehicleTypes.suv?.enabled ? localConfig.vehicleTypes.suv.shippingCost : localConfig.shippingCost) + localConfig.shippingToPristina).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-white/70">
                                <span className="font-medium text-orange-500">Sesion i Sigurt:</span> Do të dilni automatikisht pas 2 orësh pa aktivitet.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}