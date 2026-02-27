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

const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 10;

class RecentlyViewedService {
    get(): RecentlyViewedCar[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    add(car: any): void {
        try {
            const recent = this.get();

            // Create simplified car object
            const viewedCar: RecentlyViewedCar = {
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

            // Remove if already exists
            const filtered = recent.filter(c => c.id !== car.id);

            // Add to beginning
            const updated = [viewedCar, ...filtered].slice(0, MAX_ITEMS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error adding to recently viewed:', error);
        }
    }

    remove(id: number): void {
        try {
            const recent = this.get();
            const updated = recent.filter(c => c.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error removing from recently viewed:', error);
        }
    }

    clear(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing recently viewed:', error);
        }
    }
}

export const recentlyViewedService = new RecentlyViewedService();