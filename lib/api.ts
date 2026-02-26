// lib/api.ts
// Use environment variable for flexibility
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

// Helper to get full URL (important for server-side fetching)
const getFullUrl = (path: string) => {
    // If we're on the server and using a relative path, make it absolute
    if (typeof window === 'undefined' && path.startsWith('/')) {
        // Use localhost in development, actual domain in production
        const baseUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : (process.env.NEXTAUTH_URL || 'https://ferrari-export.com');
        return `${baseUrl}${path}`;
    }
    return path;
};

export async function fetchCars(params: any = {}) {
    try {
        const queryParams = new URLSearchParams();

        // Add all possible params
        if (params.search) queryParams.append('search', params.search);
        if (params.make) queryParams.append('make', params.make);
        if (params.model) queryParams.append('model', params.model);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice);
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
        if (params.minYear) queryParams.append('minYear', params.minYear);
        if (params.maxYear) queryParams.append('maxYear', params.maxYear);
        if (params.fuelType) queryParams.append('fuelType', params.fuelType);
        if (params.transmission) queryParams.append('transmission', params.transmission);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit || 12);

        const path = `/api/proxy/cars${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const url = getFullUrl(path);

        console.log('Fetching cars from:', url); // Debug log

        const response = await fetch(url, {
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            cars: data.cars || [],
            pagination: data.pagination || { page: 1, totalPages: 1, total: 0 }
        };
    } catch (error) {
        console.error('Error fetching cars:', error);
        return {
            cars: [],
            pagination: { page: 1, totalPages: 1, total: 0 }
        };
    }
}

export async function fetchCarDetails(carId: string) {
    try {
        const cleanId = carId.replace(/\D/g, '');
        const path = `/api/proxy/cars/${cleanId}`;
        const url = getFullUrl(path);

        const response = await fetch(url, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching car details:', error);
        return null;
    }
}

export async function fetchFilterData() {
    try {
        const path = `/api/proxy/cars/meta/types`;
        const url = getFullUrl(path);

        const response = await fetch(url, {
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching filter data:', error);
        // Return default data to prevent UI crashes
        return {
            makes: [],
            fuelTypes: ['Diesel', 'Gasoline', 'Electric', 'Hybrid'],
            transmissions: ['Automatic', 'Manual'],
            years: Array.from({ length: 10 }, (_, i) => 2026 - i)
        };
    }
}