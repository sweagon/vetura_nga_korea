'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, ChevronRight, Github } from 'lucide-react';

export default function SignInPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const error = searchParams.get('error');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                setFormError(result.error);
            } else {
                router.push(callbackUrl);
            }
        } catch (error) {
            setFormError('Ndodhi një gabim. Ju lutemi provoni përsëri.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-secondary py-12">
            <div className="container-custom max-w-md">
                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-ferrari-red">Formula Export</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <span className="text-ferrari-red">Hyr në llogari</span>
                </div>

                {/* Sign In Card */}
                <div className="bg-surface rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Hyr në llogari</h1>
                        <p className="text-gray-600">
                            Mirë se vini përsëri! Hyni për të vazhduar.
                        </p>
                    </div>

                    {/* Error Message */}
                    {(error || formError) && (
                        <div className="bg-red-50 p-4 rounded-lg mb-6 flex items-start">
                            <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-600">
                                {error === 'CredentialsSignin' ? 'Email ose password i gabuar' : formError}
                            </p>
                        </div>
                    )}

                    {/* Google Sign In */}
                    <button
                        onClick={() => signIn('google', { callbackUrl })}
                        className="w-full mb-4 px-4 py-3 border border-theme rounded-lg hover:bg-secondary transition flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Vazhdo me Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-theme"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-surface text-gray-500">ose</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red"
                                    placeholder="sh@formulaexport.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="rounded border-gray-300 text-ferrari-red focus:ring-ferrari-red" />
                                <span className="ml-2 text-sm text-gray-600">Më kujto</span>
                            </label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm text-ferrari-red hover:underline"
                            >
                                Ke harruar passwordin?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Duke hyrë...' : 'Hyr në llogari'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Nuk ke llogari?{' '}
                        <Link href="/auth/signup" className="text-ferrari-red hover:underline font-medium">
                            Regjistrohu
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}