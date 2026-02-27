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

    // Add ref to prevent multiple sync attempts
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

    // Load saved cars from Supabase
    const loadSavedCars = useCallback(async () => {
        setLoading(true);
        try {
            if (!session?.user?.id) {
                // Guest: only use localStorage
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

            // Check Supabase session
            const hasSupabaseAuth = await checkSupabaseAuth();
            if (!hasSupabaseAuth) {
                // Try to refresh
                const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
                if (!refreshedSession) {
                    console.log('No valid Supabase session, loading from localStorage');
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
                    setLoading(false);
                    setAuthChecked(true);
                    return;
                }
            }

            // Load from Supabase
            const { data, error } = await supabase
                .from('saved_cars')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading from Supabase:', error);
                // Fallback to localStorage
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
                setSavedCars(data || []);
                setSavedCarIds(new Set(data?.map((car: SavedCar) => car.car_id) || []));

                // Update localStorage to match Supabase (ensures cache is clean)
                if (data && data.length > 0) {
                    localStorage.setItem('savedCars', JSON.stringify(data.map((c: SavedCar) => c.car_id)));
                } else {
                    // If Supabase has no cars, clear localStorage
                    localStorage.removeItem('savedCars');
                }
            }
        } catch (error) {
            console.error('Error loading saved cars:', error);
        } finally {
            setLoading(false);
            setAuthChecked(true);
        }
    }, [session?.user?.id, supabase, checkSupabaseAuth]);

    // Load on mount and when session changes
    useEffect(() => {
        loadSavedCars();
    }, [loadSavedCars]);

    // Save car
    const saveCar = async (carId: number, carData?: any) => {
        if (!session?.user?.id) {
            // Guest: use localStorage
            return saveToLocalStorage(carId, carData);
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

            // Save to Supabase with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const { data, error } = await supabase
                .from('saved_cars')
                .insert({
                    user_id: session.user.id,
                    car_id: carId,
                    car_data: carData,
                })
                .select()
                .single();

            clearTimeout(timeoutId);

            if (error) {
                // Handle specific error codes
                switch (error.code) {
                    case '23505': // Unique violation
                        showToast('info', 'Makina është tashmë e ruajtur');
                        return;

                    case '42501': // Permission denied
                    case 'PGRST301': // JWT expired
                    case 'PGRST302': // JWT invalid
                        console.log('Auth error, falling back to localStorage');
                        await saveToLocalStorage(carId, carData);
                        return;

                    case '42P01': // Table doesn't exist
                    case '3F000': // Schema error
                        console.error('Database schema error:', error);
                        showToast('error', 'Gabim në sistem. Makina u ruajt lokalish.');
                        await saveToLocalStorage(carId, carData);
                        return;

                    default:
                        // Network or other errors
                        console.error('Supabase error:', error);
                        await saveToLocalStorage(carId, carData);
                        showToast('warning', 'Lidhja me serverin dështoi. Makina u ruajt lokalish.');
                }
                return;
            }

            // Success - update state and localStorage
            setSavedCars(prev => [data, ...prev]);
            setSavedCarIds(prev => new Set([...prev, carId]));

            // Update localStorage as backup
            const localSaved = JSON.parse(localStorage.getItem('savedCars') || '[]');
            if (!localSaved.includes(carId)) {
                localStorage.setItem('savedCars', JSON.stringify([...localSaved, carId]));
            }

            showToast('success', 'Makina u ruajt në llogarinë tuaj');

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Request timeout');
                await saveToLocalStorage(carId, carData);
                showToast('warning', 'Kërkesa zgjati shumë. Makina u ruajt lokalish.');
            } else {
                console.error('Unexpected error saving car:', error);
                await saveToLocalStorage(carId, carData);
                showToast('error', 'Ndodhi një gabim. Makina u ruajt lokalish.');
            }
        }
    };

    // Helper function for localStorage saves
    const saveToLocalStorage = async (carId: number, carData?: any) => {
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
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
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

                // Also clear from any backup cache
                localStorage.removeItem(`saved_car_${carId}`);

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
                // Revert on error
                setSavedCars(previousCars);
                setSavedCarIds(previousIds);
                showToast('error', 'Nuk mund të hiqej makina');
                return;
            }

            // Also remove from localStorage (backup)
            const localSaved = JSON.parse(localStorage.getItem('savedCars') || '[]');
            const updated = localSaved.filter((id: number) => id !== carId);
            localStorage.setItem('savedCars', JSON.stringify(updated));

            // Clear any cached car details
            localStorage.removeItem(`saved_car_${carId}`);

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
    // Sync localStorage to Supabase when user logs in
    const syncLocalToSupabase = useCallback(async () => {
        if (!session?.user?.id) return;

        const localSaved = localStorage.getItem('savedCars');
        if (!localSaved) return;

        try {
            const localIds = JSON.parse(localSaved);
            if (!Array.isArray(localIds) || localIds.length === 0) return;

            // Check connection first
            const { error: healthCheck } = await supabase.from('saved_cars').select('id').limit(1);
            if (healthCheck) {
                console.log('Supabase unavailable, skipping sync');
                return;
            }

            // Get existing saved cars from Supabase
            const { data: existing, error: fetchError } = await supabase
                .from('saved_cars')
                .select('car_id')
                .eq('user_id', session.user.id);

            if (fetchError) {
                console.error('Error fetching existing saved cars:', {
                    message: fetchError?.message || 'Unknown error',
                    code: fetchError?.code || null
                });

                // Don't show toast for auth errors
                if (fetchError.code === '42501' || fetchError.code === 'PGRST301') {
                    return;
                }

                showToast('error', 'Nuk mund të sinkronizoheshin makinat.');
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

                    // If it's a duplicate error, continue with next batch
                    if (insertError.code === '23505') {
                        syncedCount += batch.length;
                        continue;
                    }

                    // Stop on other errors
                    break;
                }

                syncedCount += batch.length;
            }

            if (syncedCount > 0) {
                // Clear localStorage and reload
                localStorage.removeItem('savedCars');
                await loadSavedCars();
                showToast('success', `${syncedCount} makina u sinkronizuan`);
            }

        } catch (error) {
            console.error('Error in sync process:', error);
            // Don't show toast for background sync errors
        }
    }, [session?.user?.id, supabase, loadSavedCars, showToast]);

    // Sync when user logs in - ONCE only
    useEffect(() => {
        if (session?.user?.id && authChecked && !syncAttemptedRef.current) {
            syncAttemptedRef.current = true;
            syncLocalToSupabase();
        }
    }, [session?.user?.id, authChecked, syncLocalToSupabase]);

    // Reset sync when user logs out
    useEffect(() => {
        if (!session?.user?.id) {
            syncAttemptedRef.current = false;
        }
    }, [session?.user?.id]);

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