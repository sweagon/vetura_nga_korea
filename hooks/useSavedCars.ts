'use client';

import { useState, useEffect, useCallback } from 'react';
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

// Custom error type for better handling
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
            // Handle guest users
            if (!session?.user?.id) {
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

            // Check if we have a valid Supabase session
            const hasSupabaseAuth = await checkSupabaseAuth();
            if (!hasSupabaseAuth) {
                const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
                if (!refreshedSession) {
                    console.log('No valid Supabase session');
                    setLoading(false);
                    setAuthChecked(true);
                    return;
                }
            }

            // Load saved cars from Supabase
            const { data, error } = await supabase
                .from('saved_cars')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                const supabaseError = error as SupabaseError;
                if (supabaseError.code === 'PGRST301' || supabaseError.code === '42501') {
                    console.log('Permission denied - loading from localStorage');
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
                    throw error;
                }
            } else {
                setSavedCars(data || []);
                setSavedCarIds(new Set(data?.map((car: SavedCar) => car.car_id) || []));
            }
        } catch (error) {
            console.error('Error loading saved cars:', error);
            // Fallback to localStorage
            const localSaved = localStorage.getItem('savedCars');
            if (localSaved) {
                try {
                    const parsed = JSON.parse(localSaved);
                    setSavedCars(parsed.map((id: number) => ({
                        car_id: id,
                        id: `local-${id}`,
                        created_at: new Date().toISOString()
                    } as SavedCar)));
                    setSavedCarIds(new Set(parsed));
                } catch (e) {
                    console.error('Error parsing local saved cars:', e);
                }
            }
        } finally {
            setLoading(false);
            setAuthChecked(true);
        }
    }, [session?.user?.id, supabase, showToast, checkSupabaseAuth]);

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

            if (checkError) {
                const typedError = checkError as SupabaseError;
                if (typedError.code !== 'PGRST116') {
                    throw checkError;
                }
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
                const typedError = error as SupabaseError;

                if (typedError.code === '42501') {
                    // Permission denied - fallback to localStorage
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
                throw error;
            }

            setSavedCars(prev => [data, ...prev]);
            setSavedCarIds(prev => new Set([...prev, carId]));
            showToast('success', 'Makina u ruajt në llogarinë tuaj');
        } catch (error) {
            console.error('Error saving car:', error);
            showToast('error', 'Nuk mund të ruhej makina');
        }
    };

    // Remove saved car
    const removeSavedCar = async (carId: number) => {
        if (!session?.user?.id) {
            // Guest: use localStorage
            try {
                const localSaved = JSON.parse(localStorage.getItem('savedCars') || '[]');
                const updated = localSaved.filter((id: number) => id !== carId);
                localStorage.setItem('savedCars', JSON.stringify(updated));
                setSavedCarIds(new Set(updated));
                setSavedCars(prev => prev.filter(car => car.car_id !== carId));
                showToast('success', 'Makina u hoq nga të ruajturat');
            } catch (error) {
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
                const typedError = error as SupabaseError;

                if (typedError.code === '42501') {
                    // Permission denied - fallback to localStorage
                    const localSaved = JSON.parse(localStorage.getItem('savedCars') || '[]');
                    const updated = localSaved.filter((id: number) => id !== carId);
                    localStorage.setItem('savedCars', JSON.stringify(updated));
                    setSavedCarIds(new Set(updated));
                    setSavedCars(prev => prev.filter(car => car.car_id !== carId));
                    showToast('success', 'Makina u hoq nga të ruajturat');
                    return;
                }
                throw error;
            }

            setSavedCars(prev => prev.filter(car => car.car_id !== carId));
            setSavedCarIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(carId);
                return newSet;
            });
            showToast('success', 'Makina u hoq nga të ruajturat');
        } catch (error) {
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

        // Check if we have a valid Supabase session
        const hasSupabaseAuth = await checkSupabaseAuth();
        if (!hasSupabaseAuth) {
            console.log('No valid Supabase session for sync');
            return;
        }

        const localSaved = localStorage.getItem('savedCars');
        if (!localSaved) return;

        try {
            const localIds = JSON.parse(localSaved);
            if (!Array.isArray(localIds) || localIds.length === 0) return;

            // Get existing saved cars from Supabase
            const { data: existing, error: fetchError } = await supabase
                .from('saved_cars')
                .select('car_id')
                .eq('user_id', session.user.id);

            if (fetchError) {
                const typedError = fetchError as SupabaseError;

                if (typedError.code === '42501') {
                    // Permission denied - can't sync
                    return;
                }
                throw fetchError;
            }

            const existingIds = new Set(existing?.map((e: { car_id: number }) => e.car_id) || []);
            // Find new cars to sync
            const newIds = localIds.filter((id: number) => !existingIds.has(id));

            if (newIds.length > 0) {
                // Insert new cars
                const { error: insertError } = await supabase
                    .from('saved_cars')
                    .insert(newIds.map((car_id: number) => ({
                        user_id: session.user.id,
                        car_id,
                        car_data: null,
                    })));

                if (insertError) {
                    const typedError = insertError as SupabaseError;

                    if (typedError.code !== '42501') {
                        throw insertError;
                    }
                    return;
                }

                // Clear localStorage after successful sync
                localStorage.removeItem('savedCars');

                // Reload saved cars
                await loadSavedCars();

                showToast('success', `${newIds.length} makina u sinkronizuan me llogarinë tuaj`);
            }
        } catch (error) {
            console.error('Error syncing saved cars:', error);
        }
    }, [session?.user?.id, supabase, loadSavedCars, showToast, checkSupabaseAuth]);

    // Sync when user logs in
    useEffect(() => {
        if (session?.user?.id && authChecked) {
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