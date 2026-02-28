// app/profile/page.tsx
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
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import type { Profile } from '@/lib/supabase/types';

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
    const [savedCount, setSavedCount] = useState(0);

    const [editForm, setEditForm] = useState({
        full_name: '',
        phone: '',
    });

    // Debug session
    useEffect(() => {
        console.log('Session status:', status);
        console.log('Session data:', session);
        console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    }, [session, status]);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
    }, [status, router]);

    // Load profile when session is ready
    useEffect(() => {
        const loadUserData = async () => {
            // Wait for session to be loaded
            if (status === 'loading') return;

            // Check if we have a session
            if (!session?.user?.id) {
                console.error('No user ID in session');
                setError('Nuk u gjet ID e përdoruesit');
                setLoading(false);
                return;
            }

            try {
                await loadProfile();
                await fetchSavedCount();
            } catch (err) {
                console.error('Error loading user data:', err);
                setError('Ndodhi një gabim gjatë ngarkimit të të dhënave');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [session, status]);

    const fetchSavedCount = async () => {
        if (!session?.user?.id) return;

        try {
            const { count, error } = await supabase
                .from('saved_cars')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);

            if (!error && count !== null) {
                setSavedCount(count);
            }
        } catch (err) {
            console.error('Error fetching saved count:', err);
        }
    };

    const loadProfile = async () => {
        try {
            const userId = session?.user?.id;

            if (!userId) {
                console.error('No user ID found in session');
                setError('Nuk u gjet ID e përdoruesit');
                setLoading(false);
                return;
            }

            console.log('Loading profile for user:', userId);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Supabase error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });

                if (error.code === 'PGRST116') {
                    // Profile doesn't exist - create it
                    console.log('Profile not found, creating new one...');
                    await createProfile();
                    return;
                }

                setError('Profili nuk u ngarkua. Provo përsëri.');
                setLoading(false);
                return;
            }

            if (!data) {
                // No profile found - create one
                console.log('No profile data, creating new one...');
                await createProfile();
                return;
            }

            console.log('Profile loaded successfully:', data);
            setProfile(data);
            setEditForm({
                full_name: data.full_name || '',
                phone: data.phone || '',
            });
            setLoading(false);
        } catch (error: any) {
            console.error('Unexpected error in loadProfile:', {
                message: error?.message,
                stack: error?.stack
            });
            setError('Ndodhi një gabim i papritur.');
            setLoading(false);
        }
    };

    const createProfile = async () => {
        try {
            const userId = session?.user?.id;

            if (!userId) {
                console.error('No user ID found for profile creation');
                setError('Nuk u gjet ID e përdoruesit');
                setLoading(false);
                return;
            }

            const fullName = session?.user?.name ||
                session?.user?.email?.split('@')[0] ||
                'User';

            console.log('Creating profile for user:', userId, 'with name:', fullName);

            // First check if profile already exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', userId)
                .maybeSingle();

            if (existingProfile) {
                console.log('Profile already exists, loading instead');
                await loadProfile();
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: session?.user?.email,
                    full_name: fullName,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating profile:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });

                // Handle duplicate key error
                if (error.code === '23505') {
                    console.log('Profile already exists (duplicate key), loading instead');
                    await loadProfile();
                    return;
                }

                setError('Profili nuk u krijua. Ju lutemi kontaktoni support.');
                setLoading(false);
                return;
            }

            console.log('Profile created successfully:', data);
            setProfile(data);
            setEditForm({
                full_name: data.full_name || '',
                phone: data.phone || '',
            });
            setLoading(false);
        } catch (error: any) {
            console.error('Error in createProfile:', {
                message: error?.message,
                stack: error?.stack
            });
            setError('Profili nuk u krijua. Ju lutemi kontaktoni support.');
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
            const userId = session?.user?.id;

            if (!userId) {
                throw new Error('No user ID found');
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editForm.full_name,
                    phone: editForm.phone,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (error) throw error;

            setProfile({
                ...profile!,
                full_name: editForm.full_name,
                phone: editForm.phone,
            });

            setSuccess('Profili u përditësua me sukses!');
            setEditing(false);
        } catch (error: any) {
            console.error('Error saving profile:', {
                message: error?.message,
                code: error?.code
            });
            setError(error.message || 'Ndodhi një gabim gjatë përditësimit');
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth/signin');
    };

    if (status === 'loading' || loading) {
        return (
            <div className="container-custom py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="h-8 bg-surface-2 rounded w-48 mb-8 animate-pulse"></div>
                    <div className="bg-surface rounded-xl border border-medium p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 bg-surface-2 rounded-full animate-pulse"></div>
                            <div className="flex-1">
                                <div className="h-5 bg-surface-2 rounded w-32 mb-2 animate-pulse"></div>
                                <div className="h-4 bg-surface-2 rounded w-48 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-12 bg-surface-2 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-primary mb-2">Profili im</h1>
                    <p className="text-secondary">
                        Menaxho informacionet personale dhe preferencat
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-success-bg border border-success-border text-success-text px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-error-bg border border-error-border text-error-text px-4 py-3 rounded-lg mb-6 flex items-start">
                        <AlertCircle size={18} className="mr-2 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="md:col-span-2">
                        <div className="bg-surface rounded-xl border border-medium shadow-sm overflow-hidden">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-ferrari-red to-ferrari-dark p-6 text-white">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                        {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-xl font-semibold text-white">
                                            {profile?.full_name || 'Përdorues'}
                                        </h2>
                                        <p className="text-white/80 text-sm">{profile?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="p-6">
                                {!editing ? (
                                    // View Mode
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-start p-3 bg-secondary rounded-lg border border-medium">
                                                <User className="text-ferrari-red mr-3 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-muted">Emri i plotë</p>
                                                    <p className="font-medium text-primary">
                                                        {profile?.full_name || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start p-3 bg-secondary rounded-lg border border-medium">
                                                <Mail className="text-ferrari-red mr-3 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-muted">Email</p>
                                                    <p className="font-medium text-primary">{profile?.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start p-3 bg-secondary rounded-lg border border-medium">
                                                <Phone className="text-ferrari-red mr-3 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-muted">Telefoni</p>
                                                    <p className="font-medium text-primary">
                                                        {profile?.phone || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start p-3 bg-secondary rounded-lg border border-medium">
                                                <Clock className="text-ferrari-red mr-3 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-muted">Anëtar që nga</p>
                                                    <p className="font-medium text-primary">
                                                        {profile?.created_at
                                                            ? new Date(profile.created_at).toLocaleDateString('sq-AL')
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleEdit}
                                            className="flex items-center text-ferrari-red hover:text-ferrari-dark transition font-medium"
                                        >
                                            <Edit size={16} className="mr-2" />
                                            Ndrysho profilin
                                        </button>
                                    </div>
                                ) : (
                                    // Edit Mode
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-secondary mb-2">
                                                Emri i plotë
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.full_name}
                                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                                className="w-full px-4 py-2 bg-surface-2 border border-medium rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/50 text-primary"
                                                placeholder="Shkruani emrin tuaj"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-secondary mb-2">
                                                Telefoni
                                            </label>
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full px-4 py-2 bg-surface-2 border border-medium rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/50 text-primary"
                                                placeholder="+383 45 528 033"
                                            />
                                        </div>

                                        <div className="flex space-x-3 pt-4">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center px-4 py-2 bg-ferrari-red text-white rounded-lg hover:bg-ferrari-dark transition disabled:opacity-50"
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
                                                className="flex items-center px-4 py-2 bg-surface-2 text-secondary rounded-lg hover:bg-surface border border-medium transition"
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
                        <div className="bg-surface rounded-xl border border-medium shadow-sm p-6">
                            <h3 className="font-semibold text-primary mb-4">Menaxho</h3>
                            <div className="space-y-2">
                                <Link
                                    href="/saved"
                                    className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition group border border-medium"
                                >
                                    <div className="flex items-center">
                                        <Heart size={18} className="text-ferrari-red mr-3" />
                                        <span className="text-secondary group-hover:text-primary">Makinat e ruajtura</span>
                                    </div>
                                    <ChevronRight size={16} className="text-muted group-hover:text-ferrari-red transition" />
                                </Link>

                                <Link
                                    href="/profile/settings"
                                    className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition group border border-medium"
                                >
                                    <div className="flex items-center">
                                        <Settings size={18} className="text-ferrari-red mr-3" />
                                        <span className="text-secondary group-hover:text-primary">Cilësimet</span>
                                    </div>
                                    <ChevronRight size={16} className="text-muted group-hover:text-ferrari-red transition" />
                                </Link>

                                <Link
                                    href="/auth/change-password"
                                    className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition group border border-medium"
                                >
                                    <div className="flex items-center">
                                        <Settings size={18} className="text-ferrari-red mr-3" />
                                        <span className="text-secondary group-hover:text-primary">Ndrysho passwordin</span>
                                    </div>
                                    <ChevronRight size={16} className="text-muted group-hover:text-ferrari-red transition" />
                                </Link>

                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center justify-between p-3 hover:bg-error-bg rounded-lg transition group text-left border border-medium"
                                >
                                    <div className="flex items-center">
                                        <LogOut size={18} className="text-error-text mr-3" />
                                        <span className="text-error-text">Dil</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-gradient-to-br from-ferrari-red to-ferrari-dark text-white rounded-xl border border-ferrari-red/20 shadow-lg p-6 mt-6">
                            <h3 className="font-semibold mb-4">Statistikat</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-white/80 text-sm">Makinat e ruajtura</p>
                                    <p className="text-2xl font-bold">{savedCount}</p>
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm">Kërkimet e fundit</p>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm">Krahasimet</p>
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