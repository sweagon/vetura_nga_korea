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
    sellerName?: string;
    sellerPhone?: string;
    sellerEmail?: string;
    sellerLocation?: string;
    dealer?: {
        name: string;
        firm: string;
        location: string;
        phone: string;
    };
    warranty?: {
        bodyMonth: number;
        bodyMileage: number;
        transmissionMonth: number;
        transmissionMileage: number;
    };
    car_id?: string;
    vehicle_id?: string;
    isFeatured?: boolean;
    sold?: boolean;
    viewCount?: number;
    subscriberCount?: number;
    features?: string[];
    vin?: string;
    inspection?: any;
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

// Helper to get the base URL for server-side requests
const getBaseUrl = (): string => {
    // 1. Check for explicitly set NEXTAUTH_URL (production)
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    }
    // 2. Fallback for Vercel deployment
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // 3. Final fallback for local development
    return 'http://localhost:3000';
};

// Helper to get full URL for server-side fetching
const getFullUrl = (path: string): string => {
    // If we're in the browser, a relative URL is perfect
    if (typeof window !== 'undefined') {
        return path;
    }

    // --- Server-side logic (Node.js environment) ---
    // We ALWAYS need an absolute URL on the server
    const baseUrl = getBaseUrl();
    // Remove trailing slash from baseUrl if present, and ensure path starts with one
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const absoluteUrl = `${cleanBaseUrl}${cleanPath}`;

    // Log for debugging (helpful for production)
    console.log(`🌐 Server fetching from: ${absoluteUrl} (${process.env.NODE_ENV})`);

    return absoluteUrl;
};

// Utility for fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

export async function fetchCars(params: Record<string, any> = {}): Promise<FetchCarsResponse> {
    try {
        const queryParams = new URLSearchParams();

        // Map of parameter names to handle different naming conventions
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
            limit: 'limit',
            inStock: 'inStock'
        };

        // Add all params with proper mapping
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                const paramKey = paramMappings[key] || key;
                queryParams.append(paramKey, String(value));
            }
        });

        // Set defaults if not provided
        if (!params.limit) queryParams.append('limit', '12');
        if (!params.page) queryParams.append('page', '1');
        if (!params.sort) queryParams.append('sort', 'price_desc');

        const path = `/api/proxy/cars${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const url = getFullUrl(path);

        console.log(`🔍 [${typeof window === 'undefined' ? 'SERVER' : 'CLIENT'}] Fetching cars from:`, url);

        const response = await fetchWithTimeout(url, {
            // Only add caching options on client side
            ...(typeof window !== 'undefined'
                ? { next: { revalidate: 60 } }
                : { cache: 'no-store' })
        }, 15000);

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
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('❌ Request timeout for cars fetch');
        } else {
            console.error('❌ Error fetching cars:', error);
        }
        return {
            cars: [],
            pagination: { page: 1, totalPages: 1, total: 0 }
        };
    }
}

export async function fetchCarDetails(carId: string): Promise<Car | null> {
    try {
        // Extract numeric ID (remove any non-numeric characters)
        const cleanId = carId.toString().replace(/\D/g, '');

        if (!cleanId) {
            console.warn(`⚠️ Invalid car ID format: ${carId}`);
            return null;
        }

        const path = `/api/proxy/cars/${cleanId}`;
        const url = getFullUrl(path);

        console.log(`🔍 [${typeof window === 'undefined' ? 'SERVER' : 'CLIENT'}] Fetching car details for ID: ${cleanId}`);

        const response = await fetchWithTimeout(url, {
            ...(typeof window !== 'undefined'
                ? { next: { revalidate: 3600 } }
                : { cache: 'no-store' })
        }, 10000);

        if (response.status === 404) {
            console.log(`📭 Car not found (404): ${cleanId} - This car may have been sold or removed`);
            return null;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
            console.warn(`⚠️ Empty response for car ID: ${cleanId}`);
            return null;
        }

        return data;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error(`❌ Request timeout for car ID: ${carId}`);
        } else {
            console.error('❌ Error fetching car details:', error);
        }
        return null;
    }
}

export async function fetchFilterData(): Promise<FilterData> {
    try {
        const path = `/api/proxy/cars/meta/types`;
        const url = getFullUrl(path);

        console.log(`🔍 [${typeof window === 'undefined' ? 'SERVER' : 'CLIENT'}] Fetching filter data from:`, url);

        const response = await fetchWithTimeout(url, {
            ...(typeof window !== 'undefined'
                ? { next: { revalidate: 300 } }
                : { cache: 'no-store' })
        }, 10000);

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
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('❌ Request timeout for filter data');
        } else {
            console.error('❌ Error fetching filter data:', error);
        }
        // Return default data to prevent UI crashes
        return {
            makes: [],
            fuelTypes: ['Diesel', 'Gasoline', 'Electric', 'Hybrid'],
            transmissions: ['Automatic', 'Manual'],
            years: Array.from({ length: 10 }, (_, i) => 2026 - i)
        };
    }
}

export async function fetchSoldStatus(carId: string): Promise<boolean> {
    try {
        const cleanId = carId.toString().replace(/\D/g, '');
        const path = `/api/proxy/encar/sold-status?carId=${cleanId}`;
        const url = getFullUrl(path);

        const response = await fetchWithTimeout(url, {}, 5000);
        const data = await response.json();
        return data?.sold || false;
    } catch (error) {
        console.error('Error checking sold status:', error);
        return false;
    }
}

export async function fetchVehicleInfo(carId: string) {
    try {
        const cleanId = carId.toString().replace(/\D/g, '');
        const path = `/api/proxy/encar/vehicle/${cleanId}`;
        const url = getFullUrl(path);

        const response = await fetchWithTimeout(url, {}, 5000);
        return await response.json();
    } catch (error) {
        console.error('Error fetching vehicle info:', error);
        return null;
    }
}

// Helper function to check if API is healthy
export async function checkApiHealth(): Promise<boolean> {
    try {
        const path = `/api/proxy/cars?limit=1`;
        const url = getFullUrl(path);
        const response = await fetchWithTimeout(url, {}, 5000);
        return response.ok;
    } catch {
        return false;
    }
}

// Helper function to get makes array from filter data
export async function getMakesArray(): Promise<string[]> {
    try {
        const filterData = await fetchFilterData();
        return filterData.makes;
    } catch {
        return [];
    }
}

// Helper function to get models for a specific make
export async function getModelsForMake(make: string): Promise<string[]> {
    try {
        const filterData = await fetchFilterData();
        return filterData.modelsByMake?.[make] || [];
    } catch {
        return [];
    }
}

// Helper function to format price
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('sq-AL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Helper function to format mileage
export function formatMileage(mileage: number): string {
    return new Intl.NumberFormat('sq-AL').format(mileage) + ' km';
}

// Helper function to get fuel type in Albanian
export function getFuelTypeAlbanian(fuelType: string): string {
    const fuelMap: Record<string, string> = {
        'Diesel': 'Naftë',
        'Gasoline': 'Benzinë',
        'Electric': 'Elektrik',
        'Hybrid': 'Hibrid',
        'LPG': 'LPG',
        'CNG': 'CNG'
    };
    return fuelMap[fuelType] || fuelType;
}

// Helper function to get transmission in Albanian
export function getTransmissionAlbanian(transmission: string): string {
    const transMap: Record<string, string> = {
        'Automatic': 'Automatik',
        'Manual': 'Manuel',
        'CVT': 'CVT',
        'Semi-Automatic': 'Gjysmë-automatik',
        'Auto': 'Automatik'
    };
    return transMap[transmission] || transmission;
}