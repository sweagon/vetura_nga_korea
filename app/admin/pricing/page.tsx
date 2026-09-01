// app/admin/pricing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    Save,
    Truck,
    Percent,
    Car,
    ToggleLeft,
    ToggleRight,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useConfig } from '@/lib/ConfigContext';
import { getProviderProfit } from '@/lib/pricing';
import Breadcrumb from '../components/Breadcrumb';

// Simple Number Input
const NumberInput = ({
    value,
    onChange,
    label,
    disabled = false,
    suffix = ''
}: {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    disabled?: boolean;
    suffix?: string;
}) => {
    const [localValue, setLocalValue] = useState(value.toString());

    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (newValue === '') return;

        const num = Number(newValue);
        if (!isNaN(num)) {
            onChange(num);
        }
    };

    const handleBlur = () => {
        if (localValue === '') {
            setLocalValue('0');
            onChange(0);
        } else {
            const num = Number(localValue);
            setLocalValue(num.toString());
        }
    };

    return (
        <div>
            {label && <label className="block text-sm text-white/70 mb-2">{label}</label>}
            <div className="relative">
                <input
                    type="text"
                    inputMode="numeric"
                    value={localValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
};

// Vehicle types with default shipping costs
const VEHICLE_TYPES = [
    { id: 'sedan', label: 'Sedan', description: 'Makina familjare', defaultShipping: 3500 },
    { id: 'suv', label: 'SUV', description: 'Automjete të mëdha', defaultShipping: 4500 },
    { id: 'hatchback', label: 'Hatchback', description: 'Makina kompakte', defaultShipping: 3500 },
    { id: 'wagon', label: 'Kombi', description: 'Makina me hapësirë', defaultShipping: 3500 },
    { id: 'coupe', label: 'Kupe', description: 'Makina sportive', defaultShipping: 3500 },
    { id: 'van', label: 'Furgon', description: 'Automjete komerciale', defaultShipping: 3800 },
    { id: 'pickup', label: 'Pickup', description: 'Kamioneta', defaultShipping: 4000 },
    { id: 'sport_car', label: 'Makinë Sportive', description: 'Ferrari, Lamborghini', defaultShipping: 3500 }
];

export default function PricingPage() {
    const { config, updateConfig, loading } = useConfig();

    const [localConfig, setLocalConfig] = useState(config);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: ''
    });
    const [expandedType, setExpandedType] = useState<string | null>(null);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus({ type: null, message: '' });

        try {
            await updateConfig(localConfig);
            setSaveStatus({
                type: 'success',
                message: '✅ Cilësimet u ruajtën me sukses!'
            });
            setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
        } catch (error) {
            setSaveStatus({
                type: 'error',
                message: `❌ Gabim: ${error instanceof Error ? error.message : 'Ruajtja dështoi'}`
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Global settings
    const updateGlobal = (field: string, value: any) => {
        setLocalConfig(prev => ({ ...prev, [field]: value }));
    };

    // Vehicle shipping cost only
    const updateVehicleShipping = (typeId: string, shippingCost: number) => {
        setLocalConfig(prev => ({
            ...prev,
            vehicleTypes: {
                ...prev.vehicleTypes,
                [typeId]: {
                    ...prev.vehicleTypes[typeId as keyof typeof prev.vehicleTypes],
                    shippingCost,
                    enabled: true
                }
            }
        }));
    };

    const toggleVehicle = (typeId: string) => {
        setLocalConfig(prev => {
            const current = prev.vehicleTypes[typeId as keyof typeof prev.vehicleTypes];
            return {
                ...prev,
                vehicleTypes: {
                    ...prev.vehicleTypes,
                    [typeId]: {
                        shippingCost: current?.shippingCost ??
                            VEHICLE_TYPES.find(t => t.id === typeId)?.defaultShipping ?? 3500,
                        enabled: !(current?.enabled ?? false)
                    }
                }
            };
        });
    };

    const getVehicleShipping = (typeId: string): number => {
        const typeConfig = localConfig.vehicleTypes[typeId as keyof typeof localConfig.vehicleTypes];
        if (typeConfig?.enabled && typeConfig.shippingCost) {
            return typeConfig.shippingCost;
        }
        return localConfig.shippingCost;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Cilësimet e Çmimeve</h1>
                        <p className="text-white/60 mt-1">Rregulloni marzhën globale dhe transportin për çdo lloj automjeti</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-dark transition flex items-center gap-2 disabled:opacity-50 font-medium"
                    >
                        <Save size={20} />
                        {isSaving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
                    </button>
                </div>

                {saveStatus.type && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${saveStatus.type === 'success'
                        ? 'bg-success-bg text-success-text border border-success-border'
                        : 'bg-error-bg text-error-text border border-error-border'
                        }`}>
                        {saveStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm">{saveStatus.message}</span>
                    </div>
                )}
            </div>

            {/* Global Margin Settings - ONE SETTING FOR ALL CARS */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Percent className="text-orange-500" size={20} />
                    <span>Marzha Globale (për të gjitha makinat)</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NumberInput
                        label="Përqindja e Marzhës (%)"
                        value={localConfig.defaultMarginPercentage}
                        onChange={(v) => updateGlobal('defaultMarginPercentage', v)}
                        suffix="%"
                    />
                    <NumberInput
                        label="Marzha Minimale (€)"
                        value={localConfig.defaultMinimumMargin}
                        onChange={(v) => updateGlobal('defaultMinimumMargin', v)}
                        suffix="€"
                    />
                </div>
                <p className="text-xs text-white/40 mt-2">
                    💡 Kjo marzhë aplikohet për TË GJITHA makinat. P.sh., për makinë me çmim 15,000€, marzha = maksimumi (15,000 × 15% = 2,250€ ose 1,000€)
                </p>
            </div>

            {/* KRW -> EUR Conversion */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Percent className="text-orange-500" size={20} />
                    <span>Konvertimi KRW → EUR</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NumberInput
                        label="Kursi i këmbimit (1 KRW = ? EUR)"
                        value={localConfig.krwToEurRate}
                        onChange={(v) => updateGlobal('krwToEurRate', v)}
                    />
                    <div className="flex items-end pb-1">
                        <p className="text-xs text-white/40">
                            💡 Çmimi bazë i makinës = Çmimi në Kore (KRW) × kjo kursi.
                            Plotësohet automatikisht nga tregu (BQE) te
                            Cilësimet → Kurset e Këmbimit → "Përditëso Automatikisht".
                        </p>
                    </div>
                </div>
            </div>

            {/* Transportation Costs */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Truck className="text-orange-500" size={20} />
                    <span>Transporti</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NumberInput
                        label="Transporti Korea - Durrës (€)"
                        value={localConfig.shippingCost}
                        onChange={(v) => updateGlobal('shippingCost', v)}
                        suffix="€"
                    />
                    <NumberInput
                        label="Transporti Durrës - Prishtinë (€)"
                        value={localConfig.shippingToPristina}
                        onChange={(v) => updateGlobal('shippingToPristina', v)}
                        suffix="€"
                    />
                </div>
                <p className="text-xs text-white/40 mt-2">
                    🚢 Transporti detar nga Korea në Durrës | 🚛 Transporti tokësor nga Durrësi në Prishtinë
                </p>
            </div>

            {/* Vehicle Type Shipping Costs */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Car className="text-orange-500" size={20} />
                    <span>Transporti sipas Llojit të Automjetit</span>
                </h2>
                <p className="text-sm text-white/60 mb-4">
                    Aktivizoni dhe rregulloni transportin për lloje të ndryshme automjetesh.
                    Nëse nuk aktivizohet, përdoret transporti global.
                </p>

                <div className="space-y-3">
                    {VEHICLE_TYPES.map((type) => {
                        const typeConfig = localConfig.vehicleTypes[type.id as keyof typeof localConfig.vehicleTypes];
                        const isEnabled = typeConfig?.enabled ?? false;
                        const shippingValue = typeConfig?.enabled ? typeConfig.shippingCost : localConfig.shippingCost;
                        const isExpanded = expandedType === type.id;

                        return (
                            <div
                                key={type.id}
                                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                            >
                                {/* Header */}
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => setExpandedType(isExpanded ? null : type.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleVehicle(type.id);
                                            }}
                                            className="focus:outline-none"
                                        >
                                            {isEnabled ? (
                                                <ToggleRight className="w-6 h-6 text-orange-500" />
                                            ) : (
                                                <ToggleLeft className="w-6 h-6 text-white/40" />
                                            )}
                                        </button>
                                        <div>
                                            <span className="font-medium text-white">{type.label}</span>
                                            <p className="text-xs text-white/40">{type.description}</p>
                                        </div>
                                        {isEnabled && (
                                            <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full">
                                                Transporti: {shippingValue}€
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-white/40" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-white/40" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content - Only shipping cost */}
                                {isExpanded && (
                                    <div className="p-4 border-t border-white/10 bg-white/5">
                                        <div className="max-w-md">
                                            <NumberInput
                                                label="Transporti për këtë lloj (€)"
                                                value={typeConfig?.shippingCost ?? type.defaultShipping}
                                                onChange={(v) => updateVehicleShipping(type.id, v)}
                                                disabled={!isEnabled}
                                                suffix="€"
                                            />
                                            <p className="text-xs text-white/40 mt-2">
                                                {isEnabled
                                                    ? `Ky lloj përdor transportin e personalizuar: ${typeConfig?.shippingCost ?? type.defaultShipping}€`
                                                    : `Ky lloj përdor transportin global: ${localConfig.shippingCost}€. Aktivizoni për të personalizuar.`}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Parapamje e Çmimeve</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sedan Example */}
                    <div className="bg-white/5 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-white mb-3">Sedan (15,000€)</h3>
                        {(() => {
                            const base = 15000;
                            const shipping = getVehicleShipping('sedan');
                            const providerProfit = getProviderProfit(base);
                            const margin = Math.max(
                                Math.round(base * localConfig.defaultMarginPercentage / 100),
                                localConfig.defaultMinimumMargin
                            );
                            const total = base + shipping + margin + localConfig.shippingToPristina;

                            return (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Çmimi bazë (Korea):</span>
                                        <span className="text-white">15,000€</span>
                                    </div>
                                    <div className="flex justify-between text-white/40">
                                        <span>− Marzha e providerit (e zbritur):</span>
                                        <span>−{providerProfit}€</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Transporti:</span>
                                        <span className="text-white">+{shipping}€</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Marzha jonë ({localConfig.defaultMarginPercentage}%):</span>
                                        <span className="text-white">+{margin}€</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Transporti Prishtinë:</span>
                                        <span className="text-white">+{localConfig.shippingToPristina}€</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                                        <span className="text-white">Totali:</span>
                                        <span className="text-orange-500 text-lg">{total.toLocaleString()}€</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* SUV Example */}
                    <div className="bg-white/5 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-white mb-3">SUV (25,000€)</h3>
                        {(() => {
                            const base = 25000;
                            const shipping = getVehicleShipping('suv');
                            const providerProfit = getProviderProfit(base);
                            const margin = Math.max(
                                Math.round(base * localConfig.defaultMarginPercentage / 100),
                                localConfig.defaultMinimumMargin
                            );
                            const total = base + shipping + margin + localConfig.shippingToPristina;

                            return (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Çmimi bazë (Korea):</span>
                                        <span className="text-white">25,000€</span>
                                    </div>
                                    <div className="flex justify-between text-white/40">
                                        <span>− Marzha e providerit (e zbritur):</span>
                                        <span>−{providerProfit}€</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Transporti:</span>
                                        <span className="text-white">+{shipping}€</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Marzha jonë ({localConfig.defaultMarginPercentage}%):</span>
                                        <span className="text-white">+{margin}€</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Transporti Prishtinë:</span>
                                        <span className="text-white">+{localConfig.shippingToPristina}€</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                                        <span className="text-white">Totali:</span>
                                        <span className="text-orange-500 text-lg">{total.toLocaleString()}€</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-xs text-orange-500">
                        📊 Formula: Çmimi bazë (KRW → EUR) + Transporti + Marzha jonë + Transporti Prishtinë. Marzha e providerit zbritet nga faturimi i ekspozuar.
                    </p>
                </div>
            </div>
        </div>
    );
}