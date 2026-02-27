'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    User,
    Mail,
    Phone,
    LogOut,
    Settings,
    Heart,
    Clock,
    ChevronRight,
    Edit,
    Save,
    X,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [editForm, setEditForm] = useState({
        full_name: '',
        phone: '',
    });

    // Load profile data
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (session?.user?.id) {
            loadProfile();
        }
    }, [session, status, router]);

    const loadProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session?.user?.id)
                .single();

            if (error) throw error;

            setProfile(data);
            setEditForm({
                full_name: data.full_name || '',
                phone: data.phone || '',
            });
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setEditing(false);
        setEditForm({
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
        });
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editForm.full_name,
                    phone: editForm.phone,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', session?.user?.id);

            if (error) throw error;

            setProfile({
                ...profile!,
                full_name: editForm.full_name,
                phone: editForm.phone,
            });
            setSuccess('Profili u përditësua me sukses!');
            setEditing(false);
        } catch (error: any) {
            setError(error.message || 'Ndodhi një gabim gjatë përditësimit');
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth/signin');
    };

    // if (status === 'loading' || loading) {
    //     return (
    //         <div className="container-custom py-12">
    //             <div className="max-w-3xl mx-auto">
    //                 <div className="animate-pulse">
    //                     <div className="h-8 bg-tertiary rounded w-48 mb-8"></div>
    //                     <div className="bg-surface rounded-lg shadow-md p-6">
    //                         <div className="h-32 bg-tertiary rounded mb-4"></div>
    //                         <div className="h-10 bg-tertiary rounded w-32"></div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="container-custom py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Profili im</h1>
                    <p className="text-secondary">
                        Menaxho informacionet personale dhe preferencat
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-success-bg border border-success-border text-green-700 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-error-bg border border-error-border text-error-text px-4 py-3 rounded-lg mb-6 flex items-start">
                        <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="md:col-span-2">
                        <div className="bg-surface rounded-lg shadow-md overflow-hidden">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-ferrari-red to-ferrari-dark p-6 text-primary">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-surface/20 rounded-full flex items-center justify-center text-2xl font-bold">
                                        {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-xl font-semibold">
                                            {profile?.full_name || 'Përdorues'}
                                        </h2>
                                        <p className="text-primary/80 text-sm">{profile?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="p-6">
                                {!editing ? (
                                    // View Mode
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-start p-3 bg-secondary rounded-lg">
                                                <User className="text-ferrari-red mr-3 mt-1" size={18} />
                                                <div>
                                                    <p className="text-sm text-secondary">Emri i plotë</p>
                                                    <p className="font-medium">
                                                        {profile?.full_name || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start p-3 bg-secondary rounded-lg">
                                                <Mail className="text-ferrari-red mr-3 mt-1" size={18} />
                                                <div>
                                                    <p className="text-sm text-secondary">Email</p>
                                                    <p className="font-medium">{profile?.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start p-3 bg-secondary rounded-lg">
                                                <Phone className="text-ferrari-red mr-3 mt-1" size={18} />
                                                <div>
                                                    <p className="text-sm text-secondary">Telefoni</p>
                                                    <p className="font-medium">
                                                        {profile?.phone || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start p-3 bg-secondary rounded-lg">
                                                <Clock className="text-ferrari-red mr-3 mt-1" size={18} />
                                                <div>
                                                    <p className="text-sm text-secondary">Anëtar që nga</p>
                                                    <p className="font-medium">
                                                        {profile?.created_at
                                                            ? new Date(profile.created_at).toLocaleDateString('sq-AL')
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleEdit}
                                            className="flex items-center text-ferrari-red hover:text-ferrari-dark transition"
                                        >
                                            <Edit size={16} className="mr-2" />
                                            Ndrysho profilin
                                        </button>
                                    </div>
                                ) : (
                                    // Edit Mode
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Emri i plotë
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.full_name}
                                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                                className="w-full px-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red"
                                                placeholder="Shkruani emrin tuaj"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Telefoni
                                            </label>
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full px-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red"
                                                placeholder="+383 45 528 033"
                                            />
                                        </div>

                                        <div className="flex space-x-3 pt-4">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center px-4 py-2 bg-ferrari-red text-primary rounded-lg hover:bg-ferrari-dark transition disabled:opacity-50"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                                        Duke ruajtur...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save size={16} className="mr-2" />
                                                        Ruaj ndryshimet
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="flex items-center px-4 py-2 border border-medium rounded-lg hover:bg-secondary transition"
                                            >
                                                <X size={16} className="mr-2" />
                                                Anulo
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="md:col-span-1">
                        <div className="bg-surface rounded-lg shadow-md p-6">
                            <h3 className="font-semibold mb-4">Menaxho</h3>
                            <div className="space-y-2">
                                <Link
                                    href="/saved"
                                    className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition group"
                                >
                                    <div className="flex items-center">
                                        <Heart size={18} className="text-ferrari-red mr-3" />
                                        <span>Makinat e ruajtura</span>
                                    </div>
                                    <ChevronRight size={16} className="text-muted group-hover:text-ferrari-red transition" />
                                </Link>

                                <Link
                                    href="/profile/settings"
                                    className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition group"
                                >
                                    <div className="flex items-center">
                                        <Settings size={18} className="text-ferrari-red mr-3" />
                                        <span>Cilësimet</span>
                                    </div>
                                    <ChevronRight size={16} className="text-muted group-hover:text-ferrari-red transition" />
                                </Link>

                                <Link
                                    href="/auth/change-password"
                                    className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition group"
                                >
                                    <div className="flex items-center">
                                        <Settings size={18} className="text-ferrari-red mr-3" />
                                        <span>Ndrysho passwordin</span>
                                    </div>
                                    <ChevronRight size={16} className="text-muted group-hover:text-ferrari-red transition" />
                                </Link>

                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center justify-between p-3 hover:bg-error-bg rounded-lg transition group text-left"
                                >
                                    <div className="flex items-center">
                                        <LogOut size={18} className="text-error-text mr-3" />
                                        <span className="text-error-text">Dil</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-gradient-to-br from-ferrari-red to-ferrari-dark text-primary rounded-lg shadow-md p-6 mt-6">
                            <h3 className="font-semibold mb-4">Statistikat</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-primary/80 text-sm">Makinat e ruajtura</p>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                                <div>
                                    <p className="text-primary/80 text-sm">Kërkimet e fundit</p>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                                <div>
                                    <p className="text-primary/80 text-sm">Krahasimet</p>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
