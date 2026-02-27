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
    const [authError, setAuthError] = useState(false);

    const [editForm, setEditForm] = useState({
        full_name: '',
        phone: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (session?.user?.id) {
            // First, check if Supabase session exists
            checkSupabaseSession();
        }
    }, [session, status, router]);

    const checkSupabaseSession = async () => {
        try {
            const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();

            if (error || !supabaseSession) {
                console.log('No valid Supabase session, attempting to sign out...');
                // Clear invalid session
                await supabase.auth.signOut();
                setAuthError(true);
                setError('Probleme me autentifikimin. Ju lutemi kyçuni përsëri.');
                setLoading(false);
                return;
            }

            // Valid session, load profile
            loadProfile();
        } catch (err) {
            console.error('Error checking session:', err);
            setAuthError(true);
            setLoading(false);
        }
    };

    const loadProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session?.user?.id)
                .single();

            if (error) {
                // Log the actual error
                console.error('Error loading profile:', {
                    message: error?.message || 'Unknown error',
                    details: error?.details || null,
                    code: error?.code || null
                });

                // Handle specific error codes
                if (error.code === 'PGRST116') {
                    // Profile doesn't exist - try to create it
                    await createProfile();
                    return;
                } else if (error.code === '42501' || error.message?.includes('JWT')) {
                    // Auth error - session might be invalid
                    setAuthError(true);
                    setError('Sesioni juaj ka skaduar. Ju lutemi kyçuni përsëri.');
                    setLoading(false);
                    return;
                }

                setError('Profili nuk u ngarkua. Provo përsëri.');
                return;
            }

            setProfile(data);
            setEditForm({
                full_name: data.full_name || '',
                phone: data.phone || '',
            });
        } catch (error: any) {
            console.error('Unexpected error:', {
                message: error?.message || 'Unknown error'
            });
            setError('Ndodhi një gabim i papritur.');
        } finally {
            setLoading(false);
        }
    };

    const createProfile = async () => {
        try {
            // Try to get the current Supabase user
            const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();

            if (userError || !supabaseUser) {
                console.error('No valid Supabase user');
                setAuthError(true);
                setError('Nuk mund të verifikohet përdoruesi. Ju lutemi kyçuni përsëri.');
                setLoading(false);
                return;
            }

            const fullName = session?.user?.name ||
                session?.user?.email?.split('@')[0] ||
                'User';

            const { error } = await supabase
                .from('profiles')
                .insert({
                    id: supabaseUser.id, // Use Supabase user ID, not NextAuth session ID
                    email: session?.user?.email,
                    full_name: fullName,
                });

            if (error) {
                console.error('Error creating profile:', {
                    message: error?.message || 'Unknown error',
                    code: error?.code || null,
                    details: error?.details || null
                });

                if (error.code === '23505') { // Duplicate key
                    // Profile already exists, try to load it
                    await loadProfile();
                    return;
                }

                setError('Profili nuk u krijua. Ju lutemi kontaktoni support.');
                setLoading(false);
                return;
            }

            // Success - reload profile
            await loadProfile();
        } catch (error: any) {
            console.error('Error in createProfile:', error?.message);
            setError('Profili nuk u krijua. Ju lutemi kontaktoni support.');
            setLoading(false);
        }
    };

    // Rest of your component remains the same...
    // (handleEdit, handleCancel, handleSave, handleSignOut functions)

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
            console.error('Error saving profile:', {
                message: error?.message || 'Unknown error',
                code: error?.code || null
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

    if (authError) {
        return (
            <div className="container-custom py-12">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-surface rounded-xl border border-medium p-8">
                        <div className="w-20 h-20 bg-error-bg rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} className="text-error-text" />
                        </div>
                        <h1 className="text-2xl font-bold text-primary mb-2">Problem me autentifikimin</h1>
                        <p className="text-secondary mb-6">
                            {error || 'Sesioni juaj ka skaduar. Ju lutemi kyçuni përsëri.'}
                        </p>
                        <button
                            onClick={() => router.push('/auth/signin')}
                            className="btn-primary"
                        >
                            Kyçu përsëri
                        </button>
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
                            <div className="bg-linear-to-r from-ferrari-red to-ferrari-dark p-6 text-white">
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
                        <div className="bg-linear-to-br from-ferrari-red to-ferrari-dark text-white rounded-xl border border-ferrari-red/20 shadow-lg p-6 mt-6">
                            <h3 className="font-semibold mb-4">Statistikat</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-white/80 text-sm">Makinat e ruajtura</p>
                                    <p className="text-2xl font-bold">0</p>
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