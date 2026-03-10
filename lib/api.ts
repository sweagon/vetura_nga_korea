// lib/api.ts
import { STATIC_MANUFACTURERS } from './staticManufacturers';

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

export interface Accident {
  date: string;
  insuranceBenefit: number;
  laborCost: number;
  paintingCost: number;
  partCost: number;
  type: string;
}

export interface InsuranceV2 {
  accidentCnt: number;
  accidents: Accident[];
  myAccidentCnt: number;
  myAccidentCost: number;
  otherAccidentCnt: number;
  otherAccidentCost: number;
  totalLossCnt: number;
  floodTotalLossCnt: number;
  robberCnt: number;
  ownerChangeCnt: number;
}

export interface HistoryContent {
  title: string;
  sub?: string;
  flag?: string;
  Date_of_change?: string;
  Driving_distance_when_changing?: string;
  Transaction_type?: string;
  mileage?: string;
  maintenance_company?: string;
  total_repair_cost?: string;
  Defect_details?: string;
  Correction_method?: string;
  Recall_Post_Date?: string;
  target_device?: string;
  Correction_period?: string;
  Contact_us?: string;
}

export interface HistoryItem {
  content: HistoryContent[];
  date: string;
}

export interface InspectItem {
  attributes: string[];
  statusTypes: Array<{
    code: string;
    title: string;
  }>;
  type: {
    code: string;
    title: string;
  };
}

export interface FirstRegistration {
  year: number;
  month: number;
  day: number;
}

export interface Options {
  choice: string[];
  etc: string[];
  standard: string[];
  tuning: string[];
  type: string;
}

export interface CarDetails {
  engine_volume?: number;
  badge?: string;
  description_ko?: string;
  description_en?: string;
  seats_count?: number;
  insurance_v2?: InsuranceV2;
  history?: HistoryItem[];
  inspect_outer?: InspectItem[];
  first_registration?: FirstRegistration;
  options?: Options;
  original_price?: number;
  sell_type?: string;
  is_leasing?: boolean;
  month?: number;
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
  details?: CarDetails;
  condition?: {
    name: string;
    id: number;
  };
  keys_available?: boolean;
  airbags?: boolean | null;
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

// lib/api.ts - Ensure FilterData interface has all needed arrays
export interface FilterData {
  manufacturers: Manufacturer[];
  models: Model[];
  generations: Generation[];
  fuelTypes: Array<{ id: number; name: string }>;
  transmissions: Array<{ id: number; name: string }>;
  years: number[];
  bodyTypes: Array<{ id: number; name: string }>;
  colors: Array<{ id: number; name: string }>;
  // Add these if they exist in the statistics endpoint
  fuelStats?: Array<{ id: number; name: string; count: number }>;
  transmissionStats?: Array<{ id: number; name: string; count: number }>;
}

// API Base URL - using NEXT_PUBLIC_ for client-side access
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to construct full URLs for server-side requests
const getFullUrl = (path: string): string => {
  if (typeof window !== 'undefined') {
    return path;
  }

  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3000${path}`;
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXTAUTH_URL || 'https://vetura-nga-korea.vercel.app';

  return `${baseUrl}${path}`;
};

// Fetch with timeout - increased to 30 seconds for slow API
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 30000) => {
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

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Kërkesa zgjati shumë (${timeout / 1000} sekonda). Provo përsëri.`);
      }
    }

    throw error;
  }
};

// List of filters that the API actually supports
const API_SUPPORTED_FILTERS = [
  'manufacturer_id',
  'model_id',
  'from_year',
  'to_year',
  'buy_now_price_from',
  'buy_now_price_to',
  'odometer_from_km',
  'odometer_to_km',
  'page',
  'per_page',
  'vehicle_type'
];

// In lib/api.ts, update the fetchCars function:

export async function fetchCars(params: Record<string, any> = {}) {
  try {
    const queryParams: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = value.toString();
      }
    });

    if (!queryParams.per_page) queryParams.per_page = '12';
    if (!queryParams.vehicle_type) queryParams.vehicle_type = '1';

    const queryString = new URLSearchParams(queryParams).toString();
    const path = `/api/proxy/cars${queryString ? `?${queryString}` : ''}`;
    const url = getFullUrl(path);

    console.log('📡 Fetching cars with params:', queryParams);

    const response = await fetchWithTimeout(url, {
      ...(typeof window !== 'undefined'
        ? { next: { revalidate: 60 } }
        : { cache: 'no-store' })
    }, 30000);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // IMPORTANT: Ensure meta.total is preserved
    if (data.meta && typeof data.meta.total === 'undefined') {
      console.warn('⚠️ API response missing meta.total');
    }

    console.log('✅ API Response processed:', {
      dataLength: data.data?.length,
      total: data.meta?.total,
      current_page: data.meta?.current_page
    });

    return data;
  } catch (error) {
    console.error('Error fetching cars:', error);
    return {
      data: [],
      meta: {
        current_page: Number(params.page) || 1,
        per_page: Number(params.per_page) || 12,
        total: 0
      }
    };
  }
}

/**
 * Fetch car by VIN - Uses dedicated endpoint
 */
export async function fetchCarByVin(vin: string): Promise<Car | null> {
  try {
    if (!vin || vin.length < 10) {
      console.error('Invalid VIN provided:', vin);
      return null;
    }

    const path = `/api/proxy/vin/${encodeURIComponent(vin)}`;
    const url = getFullUrl(path);

    console.log('📡 Fetching car by VIN from proxy:', url);

    const response = await fetchWithTimeout(url, {
      ...(typeof window !== 'undefined'
        ? { next: { revalidate: 3600 } } // Cache for 1 hour
        : { cache: 'no-store' })
    }, 10000);

    if (response.status === 200) {
      const data = await response.json();
      return data;
    }

    if (response.status === 404) {
      console.log('❌ Car not found for VIN:', vin);
      return null;
    }

    throw new Error(`HTTP error! status: ${response.status}`);
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
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  // Convert static manufacturers to the expected Manufacturer format
  const manufacturers: Manufacturer[] = STATIC_MANUFACTURERS.map(m => ({
    id: m.id,
    name: m.name,
    // Optional: You could add cars_qty if you have that data
    cars_qty: undefined,
    image: undefined,
    models_qty: undefined
  }));

  // Return filter data with static manufacturers
  return {
    manufacturers, // Using static data instead of API call
    models: [], // Will be fetched when manufacturer is selected
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
    'cabrio': 'Kabriolet',
    'sport_car': 'Makinë Sportive'
  };
  return bodyMap[bodyType.toLowerCase()] || bodyType;
}