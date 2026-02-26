'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
    const router = useRouter();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [retryAfter, setRetryAfter] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError('');
        setSuccess(false);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwordet nuk përputhen');
            setLoading(false);
            return;
        }

        // Validate password strength
        if (formData.password.length < 8) {
            setError('Passwordi duhet të ketë të paktën 8 karaktere');
            setLoading(false);
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email-i nuk është valid');
            setLoading(false);
            return;
        }

        try {
            // Sign up with Supabase
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        phone: formData.phone,
                    },
                },
            });

            if (signUpError) {
                // Handle rate limiting
                if (signUpError.status === 429) {
                    setError('Keni bërë shumë përpjekje. Ju lutemi prisni 5 minuta para se të provoni përsëri.');
                    setRetryAfter(300); // 5 minutes
                    return;
                }

                // Handle duplicate email
                if (signUpError.message.includes('User already registered')) {
                    setError('Ky email është tashmë i regjistruar. Provoni të hyni në llogari.');
                    return;
                }

                throw signUpError;
            }

            if (data.user) {
                // Create profile in profiles table
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: data.user.id,
                    email: formData.email,
                    full_name: formData.name,
                    phone: formData.phone,
                });

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    // Still show success since auth user was created
                }

                setSuccess(true);

                // Redirect to signin after 3 seconds
                setTimeout(() => {
                    router.push('/auth/signin?registered=true');
                }, 3000);
            }
        } catch (err: any) {
            setError(err.message || 'Ndodhi një gabim gjatë regjistrimit');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-secondary py-12">
                <div className="container-custom max-w-md">
                    <div className="bg-surface rounded-lg shadow-md p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Regjistrimi i suksesshëm!</h1>
                        <p className="text-gray-600 mb-6">
                            Llogaria juaj u krijua me sukses. Tani mund të hyni në llogari.
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
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
                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-ferrari-red">Formula Export</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <span className="text-ferrari-red">Regjistrohu</span>
                </div>

                {/* Sign Up Card */}
                <div className="bg-surface rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Krijo llogari</h1>
                        <p className="text-gray-600">
                            Regjistrohu për të ruajtur makinat e preferuara dhe më shumë.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 p-4 rounded-lg mb-6 flex items-start">
                            <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-red-600">{error}</p>
                                {retryAfter > 0 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Mund të provoni përsëri pas {Math.floor(retryAfter / 60)} minutash.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Emri dhe Mbiemri <span className="text-ferrari-red">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red disabled:bg-secondary disabled:cursor-not-allowed"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email <span className="text-ferrari-red">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red disabled:bg-secondary disabled:cursor-not-allowed"
                                    placeholder="sh@formulaexport.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Telefoni
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red disabled:bg-secondary disabled:cursor-not-allowed"
                                    placeholder="+383 45 528 033"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Password <span className="text-ferrari-red">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red disabled:bg-secondary disabled:cursor-not-allowed"
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Të paktën 8 karaktere
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Konfirmo Passwordin <span className="text-ferrari-red">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red disabled:bg-secondary disabled:cursor-not-allowed"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                required
                                disabled={loading}
                                className="mt-1 rounded border-gray-300 text-ferrari-red focus:ring-ferrari-red"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                Pranoj{' '}
                                <Link href="/terms" className="text-ferrari-red hover:underline">
                                    Termat e Përdorimit
                                </Link>{' '}
                                dhe{' '}
                                <Link href="/privacy" className="text-ferrari-red hover:underline">
                                    Politikën e Privatësisë
                                </Link>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    Duke regjistruar...
                                </>
                            ) : (
                                'Regjistrohu'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Ke tashmë një llogari?{' '}
                        <Link href="/auth/signin" className="text-ferrari-red hover:underline font-medium">
                            Hyr këtu
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}