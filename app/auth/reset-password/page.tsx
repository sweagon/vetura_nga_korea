'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check if we have a session (user came from email link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/signin');
            }
        };
        checkSession();
    }, [router, supabase.auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwordet nuk përputhen');
            setLoading(false);
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            setError('Passwordi duhet të ketë të paktën 8 karaktere');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);

            // Sign out after password change
            await supabase.auth.signOut();

            // Redirect to signin after 3 seconds
            setTimeout(() => {
                router.push('/auth/signin?passwordChanged=true');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Ndodhi një gabim gjatë ndryshimit të passwordit');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-secondary py-12">
                <div className="container-custom max-w-md">
                    <div className="bg-surface rounded-lg shadow-md p-8 text-center">
                        <div className="w-20 h-20 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-success-text" />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Passwordi u ndryshua!</h1>
                        <p className="text-secondary mb-6">
                            Passwordi juaj u ndryshua me sukses. Tani mund të hyni në llogari me passwordin e ri.
                        </p>
                        <p className="text-sm text-secondary mb-4">
                            Duke ju ridrejtuar te faqja e hyrjes...
                        </p>
                        <Link href="/auth/signin" className="btn-primary inline-block">
                            Vazhdo te hyrja
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-secondary py-12">
            <div className="container-custom max-w-md">
                <div className="bg-surface rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Ndrysho passwordin</h1>
                        <p className="text-secondary">
                            Shkruani passwordin tuaj të ri.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-error-bg p-4 rounded-lg mb-6 flex items-start">
                            <AlertCircle size={18} className="text-error-text mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-error-text">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Password i ri <span className="text-ferrari-red">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-muted" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full pl-10 pr-12 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red disabled:bg-secondary disabled:cursor-not-allowed"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-muted hover:text-secondary"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-secondary mt-1">
                                Të paktën 8 karaktere
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Konfirmo passwordin e ri <span className="text-ferrari-red">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-muted" size={18} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full pl-10 pr-12 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red disabled:bg-secondary disabled:cursor-not-allowed"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-2.5 text-muted hover:text-secondary"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    Duke ndryshuar...
                                </>
                            ) : (
                                'Ndrysho passwordin'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
