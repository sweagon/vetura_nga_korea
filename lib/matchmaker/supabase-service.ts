// lib/matchmaker/supabase-service.ts
'use client';

import { createClient } from '@/lib/supabase/client';
import { type SupabaseClient } from '@supabase/supabase-js';

export interface CarView {
    car_id: number;
    make: string;
    model: string;
    year: number;
    price: number;
    fuelType: string;
    transmission: string;
}

export class SupabaseMatchmakerService {
    private supabase: SupabaseClient | null = null;
    private userId: string | null = null;

    constructor(userId?: string) {
        try {
            this.supabase = createClient();
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            this.supabase = null;
        }
        this.userId = userId || null;
    }

    // Track car view
    async trackCarView(car: CarView): Promise<void> {
        if (!this.userId || !this.supabase) {
            console.log('📝 Supabase not available, skipping tracking');
            return;
        }

        try {
            // Ensure car_id is a number and exists
            if (!car?.car_id) {
                console.warn('⚠️ No car_id provided for tracking');
                return;
            }

            const carId = typeof car.car_id === 'string'
                ? parseInt(car.car_id, 10)
                : car.car_id;

            // Validate carId is a valid number
            if (isNaN(carId)) {
                console.warn('⚠️ Invalid car_id format:', car.car_id);
                return;
            }

            const { error: insertError } = await this.supabase
                .from('car_views')
                .insert({
                    user_id: this.userId,
                    car_id: carId,
                    viewed_at: new Date().toISOString(),
                });

            if (insertError) {
                // ✅ FIXED: Safe error logging with null checks
                console.error('Supabase insert error:', {
                    message: insertError?.message || 'Unknown error',
                    details: insertError?.details || null,
                    code: insertError?.code || null,
                    hint: insertError?.hint || null
                });

                // If table doesn't exist, log it but don't crash
                if (insertError?.code === '42P01') { // undefined_table
                    console.log('ℹ️ car_views table may not exist - this is ok for now');
                }
            }
        } catch (error) {
            console.error('Error tracking car view:', error);
        }
    }

    // Get user preferences from database
    async getUserPreferences() {
        if (!this.userId || !this.supabase) return null;

        try {
            const { data, error } = await this.supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', this.userId)
                .maybeSingle();

            if (error) {
                console.error('Error getting preferences:', {
                    message: error.message,
                    details: error.details,
                    code: error.code
                });
                return null;
            }
            return data;
        } catch (error) {
            console.error('Error getting preferences:', error);
            return null;
        }
    }

    // Update user preferences
    async updateUserPreferences(preferences: any) {
        if (!this.userId || !this.supabase) return;

        try {
            const { error } = await this.supabase
                .from('user_preferences')
                .upsert({
                    user_id: this.userId,
                    ...preferences,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Error updating preferences:', {
                    message: error.message,
                    details: error.details,
                    code: error.code
                });
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
    }

    // Get view history
    async getViewHistory(limit = 50) {
        if (!this.userId || !this.supabase) return [];

        try {
            const { data, error } = await this.supabase
                .from('car_views')
                .select('*')
                .eq('user_id', this.userId)
                .order('viewed_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error getting view history:', {
                    message: error.message,
                    details: error.details,
                    code: error.code
                });
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('Error getting view history:', error);
            return [];
        }
    }

    // Get saved cars for matchmaker
    async getSavedCars() {
        if (!this.userId || !this.supabase) return [];

        try {
            const { data, error } = await this.supabase
                .from('saved_cars')
                .select('*')
                .eq('user_id', this.userId);

            if (error) {
                console.error('Error getting saved cars:', {
                    message: error.message,
                    details: error.details,
                    code: error.code
                });
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('Error getting saved cars:', error);
            return [];
        }
    }

    // Optional: Create car_views table if it doesn't exist (run this once)
    async ensureTablesExist() {
        if (!this.supabase) return;

        try {
            // Check if we can query the table
            const { error } = await this.supabase
                .from('car_views')
                .select('id')
                .limit(1);

            if (error && error.code === '42P01') {
                console.log('ℹ️ car_views table does not exist - please create it in Supabase dashboard');
                // You could also create it via SQL here if you have admin rights
            }
        } catch (error) {
            console.error('Error checking tables:', error);
        }
    }
}