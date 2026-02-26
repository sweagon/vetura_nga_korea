import axios from 'axios';

const API_BASE_URL = 'https://autokoreakosova.com/api';

// Cache for filter data
let filterDataCache: any = null;
let filterDataTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchCars(params: any = {}) {
    try {
        const queryParams = new URLSearchParams();

        // Map all possible params including search
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

        // Pagination
        queryParams.append('page', String(params.page || 1));
        queryParams.append('limit', String(params.limit || 12));

        const response = await axios.get(`${API_BASE_URL}/cars?${queryParams.toString()}`);

        return {
            cars: response.data.cars || [],
            pagination: response.data.pagination || { page: 1, totalPages: 1, total: 0 }
        };
    } catch (error) {
        console.error('Error fetching cars:', error);
        return { cars: [], pagination: { page: 1, totalPages: 1, total: 0 } };
    }
}

export async function fetchCarDetails(carId: string) {
    try {
        // Make sure we're using the correct ID format
        // The API might expect a numeric ID
        const cleanId = carId.replace(/\D/g, ''); // Remove non-numeric characters if any

        console.log('Fetching car details for ID:', cleanId);

        const response = await axios.get(`${API_BASE_URL}/cars/${cleanId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching car ${carId}:`, error);

        // Try alternative endpoint if the main one fails
        try {
            console.log('Trying alternative endpoint...');
            const response = await axios.get(`${API_BASE_URL}/cars?car_id=${carId}`);
            if (response.data.cars && response.data.cars.length > 0) {
                return response.data.cars[0];
            }
        } catch (altError) {
            console.error('Alternative endpoint also failed:', altError);
        }

        return null;
    }
}

export async function fetchFilterData() {
    // Return cached data if still valid
    if (filterDataCache && Date.now() - filterDataTimestamp < CACHE_DURATION) {
        return filterDataCache;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/cars/meta/types`);
        filterDataCache = response.data;
        filterDataTimestamp = Date.now();
        return response.data;
    } catch (error) {
        console.error('Error fetching filter data:', error);
        // Return default structure to prevent crashes
        return {
            makes: [],
            fuelTypes: ['Diesel', 'Gasoline', 'Electric', 'Hybrid'],
            transmissions: ['Automatic', 'Manual'],
            years: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]
        };
    }
}

export async function fetchSoldStatus(carId: string) {
    try {
        const cleanId = carId.replace(/\D/g, '');
        const response = await axios.get(`${API_BASE_URL}/encar/sold-status?carId=${cleanId}`);
        return response.data?.sold || false;
    } catch (error) {
        console.error('Error checking sold status:', error);
        return false;
    }
}

export async function fetchVehicleInfo(carId: string) {
    try {
        const cleanId = carId.replace(/\D/g, '');
        const response = await axios.get(`${API_BASE_URL}/encar/vehicle/${cleanId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle info:', error);
        return null;
    }
}

const axiosInstance = axios.create({
    timeout: 10000, // 10 seconds
});

// FIX: Add retry logic
const fetchWithRetry = async (url: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await axiosInstance.get(url);
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * i));
        }
    }
};