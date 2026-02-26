export type Profile = {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
};

export type SavedCar = {
    id: string;
    user_id: string;
    car_id: number;
    car_data: any | null;
    notes: string | null;
    created_at: string;
};

export type Inquiry = {
    id: string;
    user_id: string | null;
    name: string;
    email: string;
    phone: string | null;
    car_id: number | null;
    car_name: string | null;
    message: string;
    status: 'pending' | 'replied' | 'archived';
    created_at: string;
};

export type UserPreferences = {
    id: string;
    user_id: string;
    preferred_makes: string[];
    preferred_fuel_types: string[];
    preferred_transmissions: string[];
    min_price: number | null;
    max_price: number | null;
    min_year: number | null;
    max_year: number | null;
    updated_at: string;
};

export type CarView = {
    id: string;
    user_id: string | null;
    car_id: number;
    viewed_at: string;
};