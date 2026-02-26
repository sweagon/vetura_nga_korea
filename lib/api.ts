// lib/api.ts
export interface Car {
    id: number;
    full_name: string;
    make: string;
    model: string;
    grade?: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    engineSize?: number;
    displacement?: number;
    images: string[];
    exteriorColor?: string;
    interiorColor?: string;
    description?: string;
    [key: string]: any;
}

export interface FetchCarsResponse {
    cars: Car[];
    pagination: {
        page: number;
        totalPages: number;
        total: number;
    };
}

export interface FilterData {
    makes: string[];
    fuelTypes: string[];
    transmissions: string[];
    years: number[];
    modelsByMake?: Record<string, string[]>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

// Helper for server-side fetching
const getFullUrl = (path: string): string => {
    if (typeof window === 'undefined' && path.startsWith('/')) {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        return `${baseUrl}${path}`;
    }
    return path;
};

export async function fetchCars(params: Record<string, any> = {}): Promise<FetchCarsResponse> {
    try {
        const queryParams = new URLSearchParams();

        // Add all possible params
        const paramMappings: Record<string, string> = {
            search: 'search',
            make: 'make',
            model: 'model',
            minPrice: 'minPrice',
            maxPrice: 'maxPrice',
            minYear: 'minYear',
            maxYear: 'maxYear',
            fuelType: 'fuelType',
            transmission: 'transmission',
            sort: 'sort',
            page: 'page',
            limit: 'limit'
        };

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                const paramKey = paramMappings[key] || key;
                queryParams.append(paramKey, String(value));
            }
        });

        // Set defaults
        if (!params.limit) queryParams.append('limit', '12');
        if (!params.page) queryParams.append('page', '1');
        if (!params.sort) queryParams.append('sort', 'price_desc');

        const path = `/api/proxy/cars${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const url = getFullUrl(path);

        console.log('Fetching cars from:', url);

        const response = await fetch(url, {
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle different API response structures
        let cars: Car[] = [];
        let pagination = { page: 1, totalPages: 1, total: 0 };

        if (data.cars && Array.isArray(data.cars)) {
            cars = data.cars;
            pagination = data.pagination || pagination;
        } else if (Array.isArray(data)) {
            cars = data;
        } else if (data.data && Array.isArray(data.data)) {
            cars = data.data;
        }

        return { cars, pagination };
    } catch (error) {
        console.error('Error fetching cars:', error);
        return { cars: [], pagination: { page: 1, totalPages: 1, total: 0 } };
    }
}

export async function fetchCarDetails(carId: string): Promise<Car | null> {
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

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching car details:', error);
        return null;
    }
}

export async function fetchFilterData(): Promise<FilterData> {
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

        return {
            makes: data.makes || [],
            fuelTypes: data.fuelTypes || ['Diesel', 'Gasoline', 'Electric', 'Hybrid'],
            transmissions: data.transmissions || ['Automatic', 'Manual'],
            years: data.years || Array.from({ length: 10 }, (_, i) => 2026 - i),
            modelsByMake: data.modelsByMake || {}
        };
    } catch (error) {
        console.error('Error fetching filter data:', error);
        return {
            makes: [],
            fuelTypes: ['Diesel', 'Gasoline', 'Electric', 'Hybrid'],
            transmissions: ['Automatic', 'Manual'],
            years: Array.from({ length: 10 }, (_, i) => 2026 - i)
        };
    }
}