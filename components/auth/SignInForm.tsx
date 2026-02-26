// components/auth/SignInForm.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignInForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const callbackUrl = searchParams?.get('callbackUrl') || '/';
    const urlError = searchParams?.get('error');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl
            });

            if (result?.error) {
                setError('Email ose fjalëkalimi i gabuar');
            } else if (result?.url) {
                window.location.href = result.url;
            }
        } catch (err) {
            setError('Ndodhi një gabim. Provo përsëri.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface rounded-xl shadow-xl p-8 border border-medium">
            <h1 className="text-2xl font-bold text-primary mb-6">Hyr në llogari</h1>

            {(error || urlError) && (
                <div className="bg-error-bg text-error-text p-3 rounded-lg mb-4 text-sm">
                    {error || 'Email ose fjalëkalimi i gabuar'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-secondary text-sm mb-1 block">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-surface-2 border border-medium rounded-lg focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/50 text-primary"
                        placeholder="your@email.com"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="text-secondary text-sm mb-1 block">Fjalëkalimi</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-surface-2 border border-medium rounded-lg focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/50 text-primary"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-ferrari-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-ferrari-dark transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Duke hyrë...' : 'Hyr'}
                </button>
            </form>

            <div className="flex items-center justify-between mt-4 text-sm">
                <Link href="/auth/forgot-password" className="text-ferrari-red hover:underline">
                    Keni harruar fjalëkalimin?
                </Link>
                <Link href="/auth/signup" className="text-secondary hover:text-ferrari-red">
                    Regjistrohu
                </Link>
            </div>
        </div>
    );
}