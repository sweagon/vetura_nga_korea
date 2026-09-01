// app/admin/exchange-rates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    DollarSign,
    RefreshCw,
    Save,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

interface ExchangeRate {
    from: string;
    to: string;
    rate: number;
    lastUpdated: string;
    trend?: 'up' | 'down' | 'stable';
}

export default function ExchangeRatesPage() {
    const [rates, setRates] = useState<ExchangeRate[]>([
        { from: 'KRW', to: 'EUR', rate: 0.000628, lastUpdated: new Date().toISOString(), trend: 'stable' },
        { from: 'USD', to: 'EUR', rate: 0.93, lastUpdated: new Date().toISOString(), trend: 'stable' },
        { from: 'JPY', to: 'EUR', rate: 0.0059, lastUpdated: new Date().toISOString(), trend: 'stable' }
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: ''
    });

    useEffect(() => {
        let cancelled = false;

        const loadRates = async () => {
            try {
                const response = await fetch('/api/admin/exchange-rates', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    if (!cancelled && data.rates && Array.isArray(data.rates) && data.rates.length > 0) {
                        setRates(data.rates.map((r: { from: string; to: string; rate: number; lastUpdated: string }) => ({
                            from: r.from,
                            to: r.to,
                            rate: r.rate,
                            lastUpdated: r.lastUpdated || new Date().toISOString(),
                            trend: 'stable'
                        })));
                    }
                }
            } catch (error) {
                console.error('Failed to load exchange rates from server:', error);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadRates();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleRateChange = (index: number, newRate: number) => {
        const updated = [...rates];
        updated[index].rate = newRate;
        updated[index].lastUpdated = new Date().toISOString();
        setRates(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus({ type: null, message: '' });

        try {
            const response = await fetch('/api/admin/exchange-rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rates })
            });

            if (response.ok) {
                setSaveStatus({
                    type: 'success',
                    message: '✅ Kurset e këmbimit u ruajtën me sukses!'
                });
                setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
            } else {
                throw new Error('Ruajtja dështoi');
            }
        } catch (error) {
            setSaveStatus({
                type: 'error',
                message: '❌ Gabim gjatë ruajtjes së kurseve të këmbimit'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setSaveStatus({ type: null, message: '' });

        try {
            const response = await fetch('/api/admin/exchange-rates/refresh', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setRates(data.rates);
                setSaveStatus({
                    type: 'success',
                    message: '✅ Kurset e këmbimit u përditësuan automatikisht!'
                });
                setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
            } else {
                throw new Error('Përditësimi dështoi');
            }
        } catch (error) {
            setSaveStatus({
                type: 'error',
                message: '❌ Gabim gjatë përditësimit të kurseve'
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Kurset e Këmbimit</h1>
                        <p className="text-white/60 mt-1">
                            {isLoading ? 'Duke ngarkuar kurset aktuale...' : 'Menaxho kurset e këmbimit për llogaritjen e çmimeve'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                            {isRefreshing ? 'Duke përditësuar...' : 'Përditëso Automatikisht'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-dark transition flex items-center gap-2 disabled:opacity-50 font-medium"
                        >
                            <Save size={18} />
                            {isSaving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
                        </button>
                    </div>
                </div>

                {/* Status Message */}
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

            {/* Exchange Rates Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rates.map((rate, index) => (
                    <div
                        key={rate.from}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {rate.from} → {rate.to}
                                    </h3>
                                    <p className="text-xs text-white/40">
                                        Përditësuar: {new Date(rate.lastUpdated).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {rate.trend === 'up' && <TrendingUp className="w-5 h-5 text-success-text" />}
                            {rate.trend === 'down' && <TrendingDown className="w-5 h-5 text-error-text" />}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-white/70 mb-2">Kursi i Këmbimit</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={rate.rate}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            if (!isNaN(val)) handleRateChange(index, val);
                                        }}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                                        1 {rate.from} = ? {rate.to}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-white/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Shembull:</span>
                                    <span className="text-white">
                                        1,000,000 {rate.from} = {(1000000 * rate.rate).toLocaleString()} {rate.to}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Card */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-orange-500 mb-1">Informacion i Rëndësishëm</h3>
                        <p className="text-sm text-white/60">
                            Kurset e këmbimit ndikojnë drejtpërdrejt në llogaritjen e çmimeve të automjeteve.
                            Përdorni butonin "Përditëso Automatikisht" për të marrë kurset më të fundit nga burime të besueshme,
                            ose futni manualisht kurset e dëshiruara.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}