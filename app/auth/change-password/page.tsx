'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle, CheckCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate
        if (newPassword !== confirmPassword) {
            setError('Passwordet e reja nuk përputhen');
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError('Passwordi i ri duhet të ketë të paktën 8 karaktere');
            setLoading(false);
            return;
        }

        try {
            // First verify current password by trying to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: (await supabase.auth.getUser()).data.user?.email || '',
                password: currentPassword,
            });

            if (signInError) {
                setError('Passwordi aktual është i gabuar');
                setLoading(false);
                return;
            }

            // Update password
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setSuccess(true);

            // Sign out and redirect after 3 seconds
            setTimeout(async () => {
                await supabase.auth.signOut();
                router.push('/auth/signin?passwordChanged=true');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Ndodhi një gabim');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-secondary py-12">
                <div className="container-custom max-w-md">
                    <div className="bg-surface rounded-lg shadow-md p-8 text-center">
                        <CheckCircle size={48} className="text-success-text mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Passwordi u ndryshua!</h1>
                        <p className="text-secondary mb-4">Passwordi juaj u ndryshua me sukses.</p>
                        <p className="text-sm text-secondary mb-4">Duke ju ridrejtuar te hyrja...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-secondary py-12">
            <div className="container-custom max-w-md">
                <Link href="/profile" className="inline-flex items-center text-sm text-secondary hover:text-ferrari-red mb-6">
                    <ArrowLeft size={16} className="mr-2" />
                    Kthehu te profili
                </Link>

                <div className="bg-surface rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold mb-6">Ndrysho passwordin</h1>

                    {error && (
                        <div className="bg-error-bg p-4 rounded-lg mb-6 flex items-start">
                            <AlertCircle size={18} className="text-error-text mr-2 mt-0.5" />
                            <p className="text-sm text-error-text">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Passwordi aktual</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-muted" size={18} />
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-12 py-2 border rounded-lg focus:border-ferrari-red"
                                />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-2.5">
                                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Passwordi i ri</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-muted" size={18} />
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-12 py-2 border rounded-lg focus:border-ferrari-red"
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5">
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Konfirmo passwordin e ri</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-muted" size={18} />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-12 py-2 border rounded-lg focus:border-ferrari-red"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5">
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Ndrysho passwordin'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}