// lib/api.ts
export interface Car {
  id: number;
  year: number;
  title: string;
  vin: string;
  manufacturer: {
    id: number;
    name: string;
  };
  model: {
    id: number;
    name: string;
    manufacturer_id: number;
  };
  generation?: {
    id: number;
    name: string;
  };
  body_type?: {
    name: string;
    id: number;
  };
  color: {
    name: string;
    id: number;
  };
  engine?: {
    id: number;
    name: string;
  };
  transmission: {
    name: string;
    id: number;
  };
  drive_wheel?: {
    name: string;
    id: number;
  };
  vehicle_type: {
    name: string;
    id: number;
  };
  fuel: {
    name: string;
    id: number;
  };
  cylinders: number | null;
  lots: Lot[];
  hp?: number;
}

export interface Lot {
  id: number;
  lot: string;
  domain: {
    name: string;
    id: number;
  };
  odometer: {
    km: number;
    mi: number;
    status: {
      name: string;
      id: number;
    };
  };
  buy_now: number | null;
  bid: number | null;
  status: {
    name: string;
    id: number;
  };
  images: {
    id: number;
    normal: string[];
    big: string[];
    downloaded?: string[];
  };
  location: {
    country: {
      iso: string;
      name: string;
    };
    city?: {
      id: number;
      name: string;
    };
  };
}

export interface FetchCarsResponse {
  data: Car[];
  links: {
    first: string;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface Manufacturer {
  id: number;
  name: string;
  cars_qty?: number;
  image?: string;
  models_qty?: number;
  cars?: boolean;
  motorcycles?: boolean;
}

export interface Model {
  id: number;
  name: string;
  manufacturer_id: number;
  cars_qty?: number;
  generations_qty?: number;
}

export interface Generation {
  id: number;
  name: string;
  model_id: number;
  manufacturer_id: number;
  cars_qty?: number;
}

export interface FilterData {
  manufacturers: Manufacturer[];
  models: Model[];
  generations: Generation[];
  fuelTypes: Array<{ id: number; name: string }>;
  transmissions: Array<{ id: number; name: string }>;
  years: number[];
  bodyTypes: Array<{ id: number; name: string }>;
  colors: Array<{ id: number; name: string }>;
}

// API Base URL - using NEXT_PUBLIC_ for client-side access
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bestautomarket.com/api';

// Helper to construct full URLs for server-side requests
const getFullUrl = (path: string): string => {
  // In browser, always use relative paths
  if (typeof window !== 'undefined') {
    return path;
  }

  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3000${path}`;
  }

  // In production on Vercel, use the VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`;
  }

  // Final fallback - relative path (works on Vercel)
  return path;
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

/**
 * Fetch cars list with filters - Works for grid view
 */
export async function fetchCars(params: Record<string, any> = {}): Promise<FetchCarsResponse> {
  try {
    // Build query string with all possible filters
    const queryParams: Record<string, string> = {};

    if (params.manufacturer_id) queryParams.manufacturer_id = params.manufacturer_id;
    if (params.model_id) queryParams.model_id = params.model_id;
    if (params.generation_id) queryParams.generation_id = params.generation_id;
    if (params.from_year) queryParams.from_year = params.from_year;
    if (params.to_year) queryParams.to_year = params.to_year;
    if (params.year) queryParams.year = params.year;
    if (params.vehicle_type) queryParams.vehicle_type = params.vehicle_type;
    if (params.buy_now) queryParams.buy_now = params.buy_now;
    if (params.domain_id) queryParams.domain_id = params.domain_id;
    if (params.search_query) queryParams.search_query = params.search_query;
    if (params.status) queryParams.status = params.status;
    if (params.vin) queryParams.vin = params.vin;
    if (params.name) queryParams.name = params.name;
    if (params.cylinders) queryParams.cylinders = params.cylinders;
    if (params.body_type) queryParams.body_type = params.body_type;
    if (params.color) queryParams.color = params.color;
    if (params.transmission) queryParams.transmission = params.transmission;
    if (params.drive_wheel) queryParams.drive_wheel = params.drive_wheel;
    if (params.country) queryParams.country = params.country;
    if (params.fuel_type) queryParams.fuel_type = params.fuel_type;
    if (params.condition) queryParams.condition = params.condition;
    if (params.odometer_from_km) queryParams.odometer_from_km = params.odometer_from_km;
    if (params.odometer_to_km) queryParams.odometer_to_km = params.odometer_to_km;
    if (params.buy_now_price_from) queryParams.buy_now_price_from = params.buy_now_price_from;
    if (params.buy_now_price_to) queryParams.buy_now_price_to = params.buy_now_price_to;
    if (params.page) queryParams.page = params.page;
    if (params.per_page) queryParams.per_page = params.per_page;

    // Default values
    if (!queryParams.per_page) queryParams.per_page = '12';
    if (!queryParams.vehicle_type) queryParams.vehicle_type = '1';

    const queryString = new URLSearchParams(queryParams).toString();
    const path = `/api/proxy/cars${queryString ? `?${queryString}` : ''}`;
    const url = getFullUrl(path);

    console.log('📡 Fetching cars from proxy:', url);

    const response = await fetchWithTimeout(url, {
      ...(typeof window !== 'undefined'
        ? { next: { revalidate: 60 } }
        : { cache: 'no-store' })
    }, 15000);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Process pagination data
    if (data.data && Array.isArray(data.data)) {
      if (!data.meta) {
        data.meta = {
          current_page: Number(params.page) || 1,
          from: 1,
          path: '',
          per_page: Number(params.per_page) || 12,
          to: data.data.length,
          total: data.data.length
        };
      } else {
        // Ensure all meta fields exist
        data.meta.current_page = data.meta.current_page || Number(params.page) || 1;
        data.meta.per_page = data.meta.per_page || Number(params.per_page) || 12;
        data.meta.from = data.meta.from || ((data.meta.current_page - 1) * data.meta.per_page + 1);
        data.meta.to = data.meta.to || Math.min(data.meta.current_page * data.meta.per_page, data.meta.total || data.data.length);
        data.meta.total = data.meta.total || data.data.length;
      }
    }

    return data;
  } catch (error) {
    console.error('Error fetching cars:', error);
    return {
      data: [],
      links: { first: '', last: null, prev: null, next: null },
      meta: {
        current_page: Number(params.page) || 1,
        from: 0,
        path: '',
        per_page: Number(params.per_page) || 12,
        to: 0,
        total: 0
      },
    };
  }
}

/**
 * Get single car by VIN - API only works with search_query parameter
 */
export async function getCarByVin(vin: string): Promise<Car | null> {
  try {
    if (!vin || vin.length < 10) {
      console.error('Invalid VIN provided:', vin);
      return null;
    }

    const path = `/api/proxy/cars?search_query=${encodeURIComponent(vin)}`;
    const url = getFullUrl(path);

    console.log('📡 Fetching car by VIN:', vin);

    const response = await fetchWithTimeout(url, {
      ...(typeof window !== 'undefined'
        ? { next: { revalidate: 60 } }
        : { cache: 'no-store' })
    }, 10000);

    if (!response.ok) {
      console.log(`❌ API responded with status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Handle different API response structures
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data[0];
    }

    if (data.id && data.vin) {
      return data;
    }

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    console.log('🚗 Car not found for VIN:', vin);
    return null;

  } catch (error) {
    console.error('Error fetching car by VIN:', error);
    return null;
  }
}

/**
 * Helper to extract VIN from URL parameter
 */
export function extractVinFromParam(param: string): string {
  // VINs are 17 characters, alphanumeric (excluding I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;

  if (vinRegex.test(param)) {
    return param;
  }

  if (/^\d+$/.test(param)) {
    console.warn('⚠️ Using numeric ID - this will not work. VIN required.');
  }

  return param;
}

export async function fetchManufacturers(type: string = 'cars'): Promise<Manufacturer[]> {
  try {
    const path = `/api/proxy/manufacturers/${type}`;
    const url = getFullUrl(path);

    console.log('📡 Fetching manufacturers from proxy:', url);

    const response = await fetchWithTimeout(url, {
      ...(typeof window !== 'undefined'
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' })
    }, 10000);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return [];
  }
}

export async function fetchModels(manufacturerId: number, type: string = 'cars'): Promise<Model[]> {
  try {
    const path = `/api/proxy/models/${manufacturerId}/${type}`;
    const url = getFullUrl(path);

    console.log('📡 Fetching models from proxy:', url);

    const response = await fetchWithTimeout(url, {
      ...(typeof window !== 'undefined'
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' })
    }, 10000);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

export async function fetchGenerations(modelId: number, type: string = 'cars'): Promise<Generation[]> {
  try {
    const path = `/api/proxy/generations/${modelId}/${type}`;
    const url = getFullUrl(path);

    console.log('📡 Fetching generations from proxy:', url);

    const response = await fetchWithTimeout(url, {
      ...(typeof window !== 'undefined'
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' })
    }, 10000);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching generations:', error);
    return [];
  }
}

export async function fetchFilterData(): Promise<FilterData> {
  const defaultManufacturers: Manufacturer[] = [
    { id: 16, name: 'BMW', cars_qty: 12375 },
    { id: 147, name: 'Volkswagen', cars_qty: 1951 },
    { id: 58, name: 'Hyundai', cars_qty: 45514 },
    { id: 70, name: 'Kia', cars_qty: 41009 },
    { id: 232, name: 'Genesis', cars_qty: 9310 },
    { id: 26, name: 'Chevrolet', cars_qty: 7168 },
    { id: 123, name: 'Renault Samsung', cars_qty: 5514 },
    { id: 131, name: 'SsangYong', cars_qty: 6995 },
    { id: 9, name: 'Audi', cars_qty: 0 },
    { id: 3, name: 'Mercedes-Benz', cars_qty: 0 },
    { id: 5, name: 'Toyota', cars_qty: 584 },
    { id: 56, name: 'Honda', cars_qty: 437 },
    { id: 48, name: 'Ford', cars_qty: 1203 },
  ];

  try {
    const manufacturers = await fetchManufacturers('cars');
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

    return {
      manufacturers: manufacturers.length > 0 ? manufacturers : defaultManufacturers,
      models: [],
      generations: [],
      fuelTypes: [
        { id: 1, name: 'diesel' },
        { id: 2, name: 'electric' },
        { id: 3, name: 'hybrid' },
        { id: 4, name: 'gasoline' }
      ],
      transmissions: [
        { id: 1, name: 'automatic' },
        { id: 2, name: 'manual' }
      ],
      years,
      bodyTypes: [
        { id: 1, name: 'sedan' },
        { id: 2, name: 'wagon' },
        { id: 3, name: 'coupe' },
        { id: 5, name: 'suv' },
        { id: 7, name: 'van' },
        { id: 11, name: 'hatchback' }
      ],
      colors: [
        { id: 1, name: 'silver' },
        { id: 2, name: 'purple' },
        { id: 3, name: 'orange' },
        { id: 4, name: 'green' },
        { id: 5, name: 'red' },
        { id: 6, name: 'gold' },
        { id: 8, name: 'brown' },
        { id: 9, name: 'grey' },
        { id: 11, name: 'blue' },
        { id: 13, name: 'white' },
        { id: 15, name: 'black' },
        { id: 16, name: 'yellow' }
      ]
    };
  } catch (error) {
    console.error('Error in fetchFilterData:', error);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

    return {
      manufacturers: defaultManufacturers,
      models: [],
      generations: [],
      fuelTypes: [
        { id: 1, name: 'diesel' },
        { id: 2, name: 'electric' },
        { id: 3, name: 'hybrid' },
        { id: 4, name: 'gasoline' }
      ],
      transmissions: [
        { id: 1, name: 'automatic' },
        { id: 2, name: 'manual' }
      ],
      years,
      bodyTypes: [
        { id: 1, name: 'sedan' },
        { id: 2, name: 'wagon' },
        { id: 3, name: 'coupe' },
        { id: 5, name: 'suv' },
        { id: 7, name: 'van' },
        { id: 11, name: 'hatchback' }
      ],
      colors: [
        { id: 1, name: 'silver' },
        { id: 2, name: 'purple' },
        { id: 3, name: 'orange' },
        { id: 4, name: 'green' },
        { id: 5, name: 'red' },
        { id: 6, name: 'gold' },
        { id: 8, name: 'brown' },
        { id: 9, name: 'grey' },
        { id: 11, name: 'blue' },
        { id: 13, name: 'white' },
        { id: 15, name: 'black' },
        { id: 16, name: 'yellow' }
      ]
    };
  }
}

// Helper function to format mileage
export function formatMileage(mileage: number): string {
  if (!mileage && mileage !== 0) return 'N/A';
  const formatted = mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} km`;
}

// Helper function to get fuel type in Albanian
export function getFuelTypeAlbanian(fuelType: string): string {
  const fuelMap: Record<string, string> = {
    'diesel': 'Naftë',
    'gasoline': 'Benzinë',
    'petrol': 'Benzinë',
    'electric': 'Elektrik',
    'hybrid': 'Hibrid',
    'gas': 'LPG'
  };
  return fuelMap[fuelType.toLowerCase()] || fuelType;
}

// Helper function to get transmission in Albanian
export function getTransmissionAlbanian(transmission: string): string {
  const transMap: Record<string, string> = {
    'automatic': 'Automatik',
    'manual': 'Manuel'
  };
  return transMap[transmission.toLowerCase()] || transmission;
}

// Helper function to get color in Albanian
export function getColorAlbanian(color: string): string {
  const colorMap: Record<string, string> = {
    'black': 'Zi',
    'white': 'Bardhë',
    'silver': 'Argjend',
    'grey': 'Gri',
    'gray': 'Gri',
    'blue': 'Kaltër',
    'red': 'Kuq',
    'green': 'Gjelbër',
    'brown': 'Kafe',
    'beige': 'Bezhë',
    'yellow': 'Verdhë',
    'orange': 'Portokalli',
    'purple': 'Vjollcë',
    'gold': 'Arë'
  };
  return colorMap[color.toLowerCase()] || color;
}

// Helper function to get body type in Albanian
export function getBodyTypeAlbanian(bodyType: string): string {
  const bodyMap: Record<string, string> = {
    'sedan': 'Sedan',
    'suv': 'SUV',
    'coupe': 'Kupe',
    'hatchback': 'Hatchback',
    'wagon': 'Kombi',
    'van': 'Furgon',
    'pickup': 'Pickup',
    'cabrio': 'Kabriolet'
  };
  return bodyMap[bodyType.toLowerCase()] || bodyType;
}