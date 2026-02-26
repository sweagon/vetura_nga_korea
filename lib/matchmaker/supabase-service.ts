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
    private supabase: SupabaseClient;
    private userId: string | null = null;

    constructor(userId?: string) {
        this.supabase = createClient();
        this.userId = userId || null;
    }

    // Track car view
    async trackCarView(car: CarView): Promise<void> {
        if (!this.userId) return;

        try {
            const { error } = await this.supabase
                .from('car_views')
                .insert({
                    user_id: this.userId,
                    car_id: car.car_id,
                    viewed_at: new Date().toISOString(),
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error tracking car view:', error);
        }
    }

    // Get user preferences from database
    async getUserPreferences() {
        if (!this.userId) return null;

        try {
            const { data, error } = await this.supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', this.userId)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting preferences:', error);
            return null;
        }
    }

    // Update user preferences
    async updateUserPreferences(preferences: any) {
        if (!this.userId) return;

        try {
            const { error } = await this.supabase
                .from('user_preferences')
                .upsert({
                    user_id: this.userId,
                    ...preferences,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
    }

    // Get view history
    async getViewHistory(limit = 50) {
        if (!this.userId) return [];

        try {
            const { data, error } = await this.supabase
                .from('car_views')
                .select('*')
                .eq('user_id', this.userId)
                .order('viewed_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting view history:', error);
            return [];
        }
    }

    // Get saved cars for matchmaker
    async getSavedCars() {
        if (!this.userId) return [];

        try {
            const { data, error } = await this.supabase
                .from('saved_cars')
                .select('*')
                .eq('user_id', this.userId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting saved cars:', error);
            return [];
        }
    }
}