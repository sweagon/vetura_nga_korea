// lib/recentlyViewed.ts

export interface RecentlyViewedCar {
    id: number;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    image?: string;
    viewedAt: string;
}

const MAX_RECENT_CARS = 10;
const STORAGE_KEY = 'recentlyViewed';

export const recentlyViewedService = {
    // Get all recently viewed cars
    get(): RecentlyViewedCar[] {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading recently viewed:', error);
            return [];
        }
    },

    // Add a car to recently viewed
    add(car: any): void {
        if (typeof window === 'undefined') return;

        try {
            const recent = this.get();

            // Create simplified car object
            const recentCar: RecentlyViewedCar = {
                id: car.id,
                make: car.make,
                model: car.model,
                year: car.year,
                price: car.price,
                mileage: car.mileage,
                fuelType: car.fuelType,
                transmission: car.transmission,
                image: car.images?.[0],
                viewedAt: new Date().toISOString()
            };

            // Remove if already exists (to move to front)
            const filtered = recent.filter(c => c.id !== car.id);

            // Add to beginning and limit to MAX_RECENT_CARS
            const updated = [recentCar, ...filtered].slice(0, MAX_RECENT_CARS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            // Dispatch event for other components to update
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('recentlyViewedUpdated'));
            }
        } catch (error) {
            console.error('Error adding to recently viewed:', error);
        }
    },

    // Clear all recently viewed
    clear(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEY);
        // Dispatch event for other components to update
        window.dispatchEvent(new Event('recentlyViewedUpdated'));
    },

    // Remove a specific car
    remove(id: number): void {
        if (typeof window === 'undefined') return;
        try {
            const recent = this.get();
            const updated = recent.filter(c => c.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            // Dispatch event for other components to update
            window.dispatchEvent(new Event('recentlyViewedUpdated'));
        } catch (error) {
            console.error('Error removing from recently viewed:', error);
        }
    },

    // Get count
    getCount(): number {
        return this.get().length;
    }
};