// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    LogIn,
    Lock,
    Shield,
    AlertCircle
} from 'lucide-react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

export default function AdminPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
    const [error, setError] = useState('');

    // Check if already authenticated
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/admin/check-session', {
                    credentials: 'include'
                });
                const data = await response.json();

                if (data.authenticated) {
                    router.push('/admin/pricing');
                }
            } catch (error) {
                console.error('Session check error:', error);
            }
        };

        checkAuth();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (lockoutUntil && Date.now() < lockoutUntil) {
            const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
            setError(`Shumë përpjekje. Provo përsëri pas ${minutesLeft} minutash.`);
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
                router.push('/admin/pricing');
            } else {
                const newAttempts = loginAttempts + 1;
                setLoginAttempts(newAttempts);

                if (newAttempts >= MAX_ATTEMPTS) {
                    const lockout = Date.now() + LOCKOUT_TIME;
                    setLockoutUntil(lockout);
                    setError('Shumë përpjekje të dështuara. Llogaria është bllokuar për 15 minuta.');
                } else {
                    setError(`Fjalëkalimi i gabuar. ${MAX_ATTEMPTS - newAttempts} përpjekje të mbetura.`);
                }
            }
        } catch (error) {
            setError('Hyrja dështoi. Provo përsëri.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 relative">
                <div className="absolute -top-3 -right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Shield size={12} />
                    E Sigurt
                </div>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                        <Lock className="w-10 h-10 text-orange-500" />
                        {loginAttempts > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-error-text rounded-full flex items-center justify-center text-white text-xs">
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
                                <AlertCircle className="w-5 h-5 text-error-text" />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg text-sm text-center bg-error-bg text-error-text border border-error-border">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                        className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-dark transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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