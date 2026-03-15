'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';

export default function ExchangeRatesPage() {
    const [rates, setRates] = useState({ usdToEur: 0.93, krwToEur: 0.00068 });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/exchange-rates');
            const data = await response.json();
            setRates(data.rates);
            setMessage('Kurset u rifreskuan');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error fetching rates:', error);
            setMessage('Gabim gjatë rifreskimit');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Here you would save to your database
        setMessage('Kurset u ruajtën');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <h1 className="text-2xl font-bold text-white mb-6">Kurset e Këmbimit</h1>

                    {message && (
                        <div className="mb-4 p-3 bg-green-500/20 text-green-500 rounded-lg">
                            {message}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-white/70 mb-2">USD → EUR</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={rates.usdToEur}
                                    onChange={(e) => setRates({ ...rates, usdToEur: parseFloat(e.target.value) })}
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                    step="0.01"
                                />
                                <button
                                    onClick={fetchRates}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                >
                                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/70 mb-2">KRW → EUR</label>
                            <input
                                type="number"
                                value={rates.krwToEur}
                                onChange={(e) => setRates({ ...rates, krwToEur: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                step="0.00001"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            Ruaj Ndryshimet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
