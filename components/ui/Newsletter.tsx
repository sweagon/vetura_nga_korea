// components/ui/Newsletter.tsx
'use client';

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setEmail('');
                setName('');
                setTimeout(() => setSuccess(false), 5000);
            } else {
                setError(data.error || 'Ndodhi një gabim');
            }
        } catch (error) {
            setError('Gabim gjatë regjistrimit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface/5 rounded-xl p-5">
            <h5 className="font-medium mb-2">Qëndro i informuar</h5>
            <p className="text-xs text-muted mb-4">
                Regjistrohu për të marrë ofertat më të reja
            </p>

            {success && (
                <div className="bg-success-bg0/20 p-3 rounded-lg mb-4 flex items-start gap-2">
                    <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-400">
                        Faleminderit! U regjistruat me sukses.
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-error-bg0/20 p-3 rounded-lg mb-4 flex items-start gap-2">
                    <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
                <input
                    type="text"
                    placeholder="Emri juaj (opsional)"
                    className="w-full px-4 py-2 bg-surface/10 border border-light/20 rounded-lg text-sm text-primary placeholder-gray-500 focus:outline-none focus:border-ferrari-red transition"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    required
                    placeholder="Email-i juaj"
                    className="w-full px-4 py-2 bg-surface/10 border border-light/20 rounded-lg text-sm text-primary placeholder-gray-500 focus:outline-none focus:border-ferrari-red transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-ferrari-red text-primary py-2 rounded-lg text-sm font-medium hover:bg-ferrari-dark transition disabled:opacity-50"
                >
                    {loading ? 'Duke regjistruar...' : 'Abonohu'}
                </button>
            </form>
        </div>
    );
}
