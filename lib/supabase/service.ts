import { createClient } from './client';
import type { Profile, SavedCar, Inquiry, UserPreferences, CarView } from './types';

// Profiles
export const getProfile = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error(`❌ Failed to fetch profile for user ${userId}:`, error);
        throw error;
    }
    return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error(`❌ Failed to update profile for user ${userId}:`, error);
        throw error;
    }
    return data as Profile;
};

// Saved Cars
export const getSavedCars = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('saved_cars')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`❌ Failed to fetch saved cars for user ${userId}:`, error);
        throw error;
    }
    return data as SavedCar[];
};

export const saveCar = async (userId: string, carId: number, carData?: any) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('saved_cars')
        .insert({ user_id: userId, car_id: carId, car_data: carData })
        .select()
        .single();

    if (error) {
        console.error(`❌ Failed to save car ${carId} for user ${userId}:`, error);
        throw error;
    }
    return data as SavedCar;
};

export const removeSavedCar = async (userId: string, carId: number) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('saved_cars')
        .delete()
        .eq('user_id', userId)
        .eq('car_id', carId);

    if (error) {
        console.error(`❌ Failed to remove car ${carId} for user ${userId}:`, error);
        throw error;
    }
};

export const isCarSaved = async (userId: string, carId: number) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('saved_cars')
        .select('id')
        .eq('user_id', userId)
        .eq('car_id', carId)
        .maybeSingle();

    if (error) {
        console.error(`❌ Failed to check if car ${carId} is saved for user ${userId}:`, error);
        throw error;
    }
    return !!data;
};

// Inquiries
export const createInquiry = async (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'status'>) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('inquiries')
        .insert(inquiry)
        .select()
        .single();

    if (error) {
        console.error(`❌ Failed to create inquiry:`, error);
        throw error;
    }
    return data as Inquiry;
};

export const getInquiries = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`❌ Failed to fetch inquiries for user ${userId}:`, error);
        throw error;
    }
    return data as Inquiry[];
};

// User Preferences
export const getUserPreferences = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error(`❌ Failed to fetch preferences for user ${userId}:`, error);
        throw error;
    }
    return data as UserPreferences | null;
};

export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
    const supabase = createClient();

    // Check if preferences exist
    const existing = await getUserPreferences(userId);

    let result;
    if (existing) {
        const { data, error } = await supabase
            .from('user_preferences')
            .update(preferences)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) throw error;
        result = data;
    } else {
        const { data, error } = await supabase
            .from('user_preferences')
            .insert({ user_id: userId, ...preferences })
            .select()
            .single();
        if (error) throw error;
        result = data;
    }

    return result as UserPreferences;
};

// Car Views
export const trackCarView = async (userId: string | null, carId: number) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('car_views')
        .insert({ user_id: userId, car_id: carId });

    if (error) {
        console.error(`❌ Failed to track car view for car ${carId}:`, error);
        throw error;
    }
};

export const getCarViews = async (userId: string, limit = 50) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('car_views')
        .select('*')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error(`❌ Failed to fetch car views for user ${userId}:`, error);
        throw error;
    }
    return data as CarView[];
};