// hooks/useSavedCars.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { PostgrestError } from '@supabase/supabase-js';

interface SavedCar {
    id: string;
    car_id: number;
    car_data: any;
    notes: string | null;
    created_at: string;
}

interface SupabaseError {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
}

export const useSavedCars = () => {
    const { data: session, status } = useSession();
    const supabase = createClient();
    const { showToast } = useToast();

    const [savedCars, setSavedCars] = useState<SavedCar[]>([]);
    const [loading, setLoading] = useState(true);
    const [savedCarIds, setSavedCarIds] = useState<Set<number>>(new Set());
    const [authChecked, setAuthChecked] = useState(false);
    const syncAttemptedRef = useRef(false);

    // Check if user is authenticated with Supabase
    const checkSupabaseAuth = useCallback(async () => {
        try {
            const { data: { session: supabaseSession } } = await supabase.auth.getSession();
            return !!supabaseSession;
        } catch (error) {
            console.error('Error checking Supabase auth:', error);
            return false;
        }
    }, [supabase]);

    // Get current user from NextAuth and ensure Supabase session
    const ensureAuth = useCallback(async () => {
        if (!session?.user?.id) return false;

        try {
            // Check if we have a Supabase session
            const { data: { session: supabaseSession } } = await supabase.auth.getSession();

            if (supabaseSession) {
                console.log('✅ Valid Supabase session exists');
                return true;
            }

            // Try to sign in with NextAuth session
            console.log('🔄 No Supabase session, attempting to sign in...');

            // You might need to implement a custom sign-in here
            // For now, we'll return false and rely on localStorage
            return false;

        } catch (error) {
            console.error('Error ensuring auth:', error);
            return false;
        }
    }, [session, supabase]);

    // Load saved cars from Supabase
    const loadSavedCars = useCallback(async () => {
        setLoading(true);
        try {
            // Handle guest users
            if (!session?.user?.id) {
                console.log('👤 Guest user, loading from localStorage');
                const localSaved = localStorage.getItem('savedCars');
                if (localSaved) {
                    try {
                        const parsed = JSON.parse(localSaved);
                        if (Array.isArray(parsed)) {
                            const cars = parsed.map((id: number) => ({
                                car_id: id,
                                id: `local-${id}`,
                                car_data: null,
                                notes: null,
                                created_at: new Date().toISOString()
                            } as SavedCar));
                            setSavedCars(cars);
                            setSavedCarIds(new Set(parsed));
                        }
                    } catch (e) {
                        console.error('Error parsing local saved cars:', e);
                    }
                }
                setLoading(false);
                setAuthChecked(true);
                return;
            }

            // For logged-in users, check auth first
            const isAuthed = await ensureAuth();

            if (!isAuthed) {
                console.log('⚠️ No valid Supabase session, using localStorage fallback');
                const localSaved = localStorage.getItem('savedCars');
                if (localSaved) {
                    try {
                        const parsed = JSON.parse(localSaved);
                        if (Array.isArray(parsed)) {
                            const cars = parsed.map((id: number) => ({
                                car_id: id,
                                id: `local-${id}`,
                                created_at: new Date().toISOString()
                            } as SavedCar));
                            setSavedCars(cars);
                            setSavedCarIds(new Set(parsed));
                        }
                    } catch (e) {
                        console.error('Error parsing local saved cars:', e);
                    }
                }
                setLoading(false);
                setAuthChecked(true);
                return;
            }

            // Load saved cars from Supabase
            const { data, error } = await supabase
                .from('saved_cars')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading from Supabase:', error);

                // Check if it's an auth error
                if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
                    console.log('🔑 Auth error, falling back to localStorage');
                    const localSaved = localStorage.getItem('savedCars');
                    if (localSaved) {
                        const parsed = JSON.parse(localSaved);
                        setSavedCars(parsed.map((id: number) => ({
                            car_id: id,
                            id: `local-${id}`,
                            created_at: new Date().toISOString()
                        } as SavedCar)));
                        setSavedCarIds(new Set(parsed));
                    }
                } else {
                    // Show error toast for other errors
                    showToast('error', 'Nuk mund të ngarkoheshin makinat e ruajtura');
                }
            } else {
                console.log(`✅ Loaded ${data?.length || 0} saved cars from Supabase`);
                setSavedCars(data || []);
                setSavedCarIds(new Set(data?.map((car: SavedCar) => car.car_id) || []));

                // Also sync to localStorage as backup
                if (data && data.length > 0) {
                    localStorage.setItem('savedCars', JSON.stringify(data.map((c: SavedCar) => c.car_id)));
                }
            }
        } catch (error) {
            console.error('Error loading saved cars:', error);
            showToast('error', 'Ndodhi një gabim gjatë ngarkimit');
        } finally {
            setLoading(false);
            setAuthChecked(true);
        }
    }, [session?.user?.id, supabase, showToast, ensureAuth]);

    // Load on mount and when session changes
    useEffect(() => {
        loadSavedCars();
    }, [loadSavedCars]);

    // Save car
    const saveCar = async (carId: number, carData?: any) => {
        if (!session?.user?.id) {
            // Guest: use localStorage
            try {
                const localSaved = JSON.parse(localStorage.getItem('savedCars') || '[]');
                if (!localSaved.includes(carId)) {
                    const updated = [...localSaved, carId];
                    localStorage.setItem('savedCars', JSON.stringify(updated));
                    setSavedCarIds(new Set(updated));
                    setSavedCars(prev => [...prev, {
                        car_id: carId,
                        car_data: carData,
                        id: `local-${carId}`,
                        notes: null,
                        created_at: new Date().toISOString()
                    } as SavedCar]);
                    showToast('success', 'Makina u ruajt në këtë pajisje');
                }
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                showToast('error', 'Nuk mund të ruhej makina');
            }
            return;
        }

        try {
            // Check if already saved
            const { data: existing, error: checkError } = await supabase
                .from('saved_cars')
                .select('id')
                .eq('user_id', session.user.id)
                .eq('car_id', carId)
                .maybeSingle();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existing) {
                showToast('info', 'Makina është tashmë e ruajtur');
                return;
            }

            // Save to Supabase
            const { data, error } = await supabase
                .from('saved_cars')
                .insert({
                    user_id: session.user.id,
                    car_id: carId,
                    car_data: carData,
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);

                // Check if it's an auth error
                if (error.code === '42501' || error.message?.includes('JWT')) {
                    console.log('🔑 Auth error, saving to localStorage instead');
                    // Fallback to localStorage
                    const localSaved = JSON.parse(localStorage.getItem('savedCars') || '[]');
                    if (!localSaved.includes(carId)) {
                        const updated = [...localSaved, carId];
                        localStorage.setItem('savedCars', JSON.stringify(updated));
                        setSavedCarIds(new Set(updated));
                        setSavedCars(prev => [...prev, {
                            car_id: carId,
                            car_data: carData,
                            id: `local-${carId}`,
                            notes: null,
                            created_at: new Date().toISOString()
                        } as SavedCar]);
                        showToast('success', 'Makina u ruajt në këtë pajisje');
                    }
                    return;
                }

                showToast('error', 'Nuk mund të ruhej makina');
                return;
            }

            // Update state
            setSavedCars(prev => [data, ...prev]);
            setSavedCarIds(prev => new Set([...prev, carId]));

            // Also update localStorage as backup
            const localSaved = JSON.parse(localStorage.getItem('savedCars') || '[]');
            if (!localSaved.includes(carId)) {
                localStorage.setItem('savedCars', JSON.stringify([...localSaved, carId]));
            }

            showToast('success', 'Makina u ruajt në llogarinë tuaj');
        } catch (error) {
            console.error('Error saving car:', error);
            showToast('error', 'Nuk mund të ruhej makina');
        }
    };

    // Remove saved car
    const removeSavedCar = async (carId: number) => {
        // Optimistically update UI
        const previousCars = savedCars;
        const previousIds = savedCarIds;

        setSavedCars(prev => prev.filter(car => car.car_id !== carId));
        setSavedCarIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(carId);
            return newSet;
        });

        if (!session?.user?.id) {
            // Guest: use localStorage
            try {
                const localSaved = JSON.parse(localStorage.getItem('savedCars') || '[]');
                const updated = localSaved.filter((id: number) => id !== carId);
                localStorage.setItem('savedCars', JSON.stringify(updated));
                showToast('success', 'Makina u hoq nga të ruajturat');
            } catch (error) {
                // Revert on error
                setSavedCars(previousCars);
                setSavedCarIds(previousIds);
                console.error('Error removing from localStorage:', error);
                showToast('error', 'Nuk mund të hiqej makina');
            }
            return;
        }

        try {
            const { error } = await supabase
                .from('saved_cars')
                .delete()
                .eq('user_id', session.user.id)
                .eq('car_id', carId);

            if (error) {
                console.error('Supabase delete error:', error);

                // Check if it's an auth error
                if (error.code === '42501' || error.message?.includes('JWT')) {
                    // Remove from localStorage anyway since it's an auth issue
                    const localSaved = JSON.parse(localStorage.getItem('savedCars') || '[]');
                    const updated = localSaved.filter((id: number) => id !== carId);
                    localStorage.setItem('savedCars', JSON.stringify(updated));
                    showToast('success', 'Makina u hoq nga të ruajturat');
                    return;
                }

                // Revert on error
                setSavedCars(previousCars);
                setSavedCarIds(previousIds);
                showToast('error', 'Nuk mund të hiqej makina');
                return;
            }

            // Also remove from localStorage
            const localSaved = JSON.parse(localStorage.getItem('savedCars') || '[]');
            const updated = localSaved.filter((id: number) => id !== carId);
            localStorage.setItem('savedCars', JSON.stringify(updated));

            showToast('success', 'Makina u hoq nga të ruajturat');
        } catch (error) {
            // Revert on error
            setSavedCars(previousCars);
            setSavedCarIds(previousIds);
            console.error('Error removing saved car:', error);
            showToast('error', 'Nuk mund të hiqej makina');
        }
    };

    // Check if car is saved
    const isCarSaved = (carId: number): boolean => {
        return savedCarIds.has(carId);
    };

    // Toggle save
    const toggleSave = async (carId: number, carData?: any) => {
        if (isCarSaved(carId)) {
            await removeSavedCar(carId);
        } else {
            await saveCar(carId, carData);
        }
    };

    // Sync localStorage to Supabase when user logs in
    const syncLocalToSupabase = useCallback(async () => {
        if (!session?.user?.id) return;

        const localSaved = localStorage.getItem('savedCars');
        if (!localSaved) return;

        // Prevent multiple sync attempts
        if (syncAttemptedRef.current) {
            console.log('🔄 Sync already attempted, skipping');
            return;
        }
        syncAttemptedRef.current = true;

        try {
            const localIds = JSON.parse(localSaved);
            if (!Array.isArray(localIds) || localIds.length === 0) return;

            // Check auth first
            const isAuthed = await ensureAuth();
            if (!isAuthed) {
                console.log('⚠️ Cannot sync: No valid Supabase session');
                return;
            }

            // Get existing saved cars from Supabase
            const { data: existing, error: fetchError } = await supabase
                .from('saved_cars')
                .select('car_id')
                .eq('user_id', session.user.id);

            if (fetchError) {
                console.error('Error fetching existing saved cars:', fetchError);
                return;
            }

            const existingIds = new Set(existing?.map((e: { car_id: number }) => e.car_id) || []);
            const newIds = localIds.filter((id: number) => !existingIds.has(id));

            if (newIds.length === 0) {
                // Nothing to sync, just clear localStorage
                localStorage.removeItem('savedCars');
                return;
            }

            // Sync in batches to avoid overwhelming the API
            const batchSize = 10;
            let syncedCount = 0;
            let hasError = false;

            for (let i = 0; i < newIds.length; i += batchSize) {
                const batch = newIds.slice(i, i + batchSize);
                const { error: insertError } = await supabase
                    .from('saved_cars')
                    .insert(batch.map((car_id: number) => ({
                        user_id: session.user.id,
                        car_id,
                        car_data: null,
                    })));

                if (insertError) {
                    console.error('Error syncing batch:', {
                        batch,
                        error: {
                            message: insertError?.message || 'Unknown error',
                            code: insertError?.code || null
                        }
                    });

                    // If it's a duplicate error, count them as synced
                    if (insertError.code === '23505') {
                        syncedCount += batch.length;
                        continue;
                    }

                    hasError = true;
                    break;
                }

                syncedCount += batch.length;
            }

            if (syncedCount > 0) {
                // Clear localStorage and reload
                localStorage.removeItem('savedCars');
                await loadSavedCars();
                showToast('success', `${syncedCount} makina u sinkronizuan`);
            } else if (hasError) {
                showToast('error', 'Sinkronizimi dështoi. Të dhënat janë ruajtur lokalish.');
            }

        } catch (error) {
            console.error('Error in sync process:', error);
        }
    }, [session?.user?.id, supabase, loadSavedCars, showToast, ensureAuth]);

    // Reset sync when user logs out
    useEffect(() => {
        if (!session?.user?.id) {
            syncAttemptedRef.current = false;
        }
    }, [session?.user?.id]);

    // Sync when user logs in - ONCE only
    useEffect(() => {
        if (session?.user?.id && authChecked && !syncAttemptedRef.current) {
            syncLocalToSupabase();
        }
    }, [session?.user?.id, authChecked, syncLocalToSupabase]);

    return {
        savedCars,
        savedCarIds,
        loading,
        saveCar,
        removeSavedCar,
        isCarSaved,
        toggleSave,
        reloadSavedCars: loadSavedCars,
    };
};