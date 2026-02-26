'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // First, send reset email via Supabase
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);

            // Optional: Send additional notification to admin
            // await fetch('/api/notify-password-reset', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email })
            // });

        } catch (err: any) {
            setError(err.message || 'Ndodhi një gabim. Ju lutemi provoni përsëri.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-secondary py-12">
            <div className="container-custom max-w-md">
                {/* Back to Sign In */}
                <Link
                    href="/auth/signin"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-ferrari-red mb-6 transition"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Kthehu te hyrja
                </Link>

                <div className="bg-surface rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Keni harruar passwordin?</h1>
                        <p className="text-gray-600">
                            Shkruani email-in tuaj dhe ne do t'ju dërgojmë një link për të ndryshuar passwordin.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 p-4 rounded-lg mb-6 flex items-start">
                            <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {success ? (
                        <div className="bg-green-50 p-6 rounded-lg text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-500" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Email u dërgua!</h2>
                            <p className="text-gray-600 mb-4">
                                Ne kemi dërguar një email në <strong>{email}</strong> me udhëzime për të ndryshuar passwordin.
                            </p>
                            <p className="text-sm text-gray-500">
                                Nëse nuk e gjeni email-in, kontrolloni dosjen e spam-it.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email <span className="text-ferrari-red">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red disabled:bg-secondary disabled:cursor-not-allowed"
                                        placeholder="sh@formulaexport.com"
                                    />
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
                                        Duke dërguar...
                                    </>
                                ) : (
                                    'Dërgo email-in'
                                )}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Mos harroni?{' '}
                        <Link href="/auth/signin" className="text-ferrari-red hover:underline font-medium">
                            Kthehu te hyrja
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}