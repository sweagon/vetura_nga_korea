import { SiteConfig } from './config';
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
  price_with_margin_and_kosovo?: number;
  price_with_margin_no_discount?: number;
  step5?: number;
}

export function getBestPrice(lot: Lot | undefined): { price: number; source: string } {
  if (!lot) return { price: 0, source: 'none' };

  if (lot.price_with_margin_and_kosovo) {
    return { price: lot.price_with_margin_and_kosovo, source: 'api_euro' };
  }
  if (lot.step5) {
    return { price: lot.step5, source: 'step5' };
  }
  if (lot.buy_now) {
    return { price: lot.buy_now, source: 'buy_now_usd' };
  }
  return { price: 0, source: 'none' };
}

// ============ RAW KOREAN PRICING (NO MARGINS) ============

const KRW_TO_EUR = 0.000628; // Exchange rate: 1 KRW = 0.000628 EUR
const USD_TO_EUR = 0.93; // Approximate USD to EUR
const COMPETITOR_SHIPPING = 3500; // Their estimated shipping cost to Durrës

/**
 * Get the raw Korean price without any margins
 * This uses the original_price from the API (in KRW) and converts to EUR
 */
export function getRawKoreanPrice(lot: Lot | undefined): number {
  if (!lot) return 0;

  // Priority 1: Use original_price in KRW as base (no margins)
  if (lot.details?.original_price) {
    const priceInEur = Math.round(lot.details.original_price * KRW_TO_EUR);
    return priceInEur;
  }

  // Priority 2: Fallback to buy_now in USD if original_price not available
  if (lot.buy_now) {
    const priceInEur = Math.round(lot.buy_now * USD_TO_EUR);
    return priceInEur;
  }

  return 0;
}

/**
 * Get the old site's price (includes their margins)
 */
export function getOldSitePrice(lot: Lot | undefined): number {
  if (!lot) return 0;
  return lot.price_with_margin_and_kosovo || lot.step5 || 0;
}

/**
 * Calculate their actual margin (after subtracting estimated shipping)
 */
export function calculateTheirMargin(lot: Lot | undefined): number {
  if (!lot) return 0;

  const rawPrice = getRawKoreanPrice(lot);
  const theirPrice = getOldSitePrice(lot);

  if (rawPrice > 0 && theirPrice > 0) {
    // Their margin = their price - raw price - their shipping
    return theirPrice - rawPrice - COMPETITOR_SHIPPING;
  }

  return 0;
}

/**
 * Get their margin percentage
 */
export function getTheirMarginPercentage(lot: Lot | undefined): number {
  if (!lot) return 0;

  const rawPrice = getRawKoreanPrice(lot);
  const theirMargin = calculateTheirMargin(lot);

  if (rawPrice > 0) {
    return Math.round((theirMargin / rawPrice) * 100 * 10) / 10; // Round to 1 decimal
  }

  return 0;
}

/**
 * Calculate what they paid for the car (raw price + their shipping)
 */
export function getTheirCostPrice(lot: Lot | undefined): number {
  if (!lot) return 0;

  const rawPrice = getRawKoreanPrice(lot);
  return rawPrice + COMPETITOR_SHIPPING;
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
  fuelStats?: Array<{ id: number; name: string; count: number }>;
  transmissionStats?: Array<{ id: number; name: string; count: number }>;
}

// Kosovo market priority order for manufacturers
const KOSOVO_MANUFACTURER_ORDER = [
  'Volkswagen',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Opel',
  'Peugeot',
  'Citroen',
  'Renault',
  'Renault Samsung',
  'Dacia',
  'Skoda',
  'SEAT',
  'Land Rover',
  'Jaguar',
  'Fiat',
  'Alfa Romeo',
  'Toyota',
  'Honda',
  'Nissan',
  'Mazda',
  'Mitsubishi',
  'Suzuki',
  'Subaru',
  'Hyundai',
  'Kia',
  'SsangYong',
  'Volvo',
  'Ford',
  'Jeep',
  'Chevrolet',
  'Porsche',
  'Maserati',
  'Lexus',
  'Infiniti',
  'Acura',
  'Genesis',
  'Bentley',
  'Rolls-Royce',
  'Lamborghini',
  'Ferrari',
  'Aston Martin',
  'McLaren',
  'Lotus',
  'Cadillac',
  'Lincoln',
  'Mini',
  'Smart'
];

// API Base URL
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
    : process.env.NEXTAUTH_URL || 'https://vetura-korea-kosova.vercel.app';

  return `${baseUrl}${path}`;
};

// Fetch with timeout
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
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' })
    }, 15000);

    if (response.status === 200) {
      const data = await response.json();

      if (!data || !data.manufacturer) {
        console.warn('⚠️ API returned incomplete car data:', data);
        return null;
      }

      return data;
    }

    if (response.status === 404) {
      console.log('❌ Car not found for VIN:', vin);
      return null;
    }

    console.error(`❌ API returned status ${response.status} for VIN:`, vin);
    const errorText = await response.text().catch(() => 'No error details');
    console.error('Error details:', errorText);

    return null;
  } catch (error) {
    console.error('Error fetching car by VIN:', error);
    return null;
  }
}

export function extractVinFromParam(param: string): string {
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
    const manufacturers = data.data || data || [];

    // Sort manufacturers by Kosovo market priority
    return manufacturers.sort((a: Manufacturer, b: Manufacturer) => {
      const indexA = KOSOVO_MANUFACTURER_ORDER.indexOf(a.name);
      const indexB = KOSOVO_MANUFACTURER_ORDER.indexOf(b.name);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
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

  const manufacturers: Manufacturer[] = STATIC_MANUFACTURERS.map(m => ({
    id: m.id,
    name: m.name,
    cars_qty: undefined,
    image: undefined,
    models_qty: undefined
  }));

  // Sort static manufacturers by Kosovo priority
  const sortedManufacturers = [...manufacturers].sort((a, b) => {
    const indexA = KOSOVO_MANUFACTURER_ORDER.indexOf(a.name);
    const indexB = KOSOVO_MANUFACTURER_ORDER.indexOf(b.name);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  return {
    manufacturers: sortedManufacturers,
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

export function formatMileage(mileage: number): string {
  if (!mileage && mileage !== 0) return 'N/A';
  const formatted = mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} km`;
}

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

export function getTransmissionAlbanian(transmission: string): string {
  const transMap: Record<string, string> = {
    'automatic': 'Automatik',
    'manual': 'Manuel'
  };
  return transMap[transmission.toLowerCase()] || transmission;
}

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

/**
 * Get the final display price for a car (what customers see)
 * This uses competitor price - their transport + our adjustments
 */
export function getDisplayPrice(car: Car, ourShipping?: number, pristinaShipping?: number): number {
  const lot = car.lots?.[0];
  if (!lot) return 0;

  // Get competitor's price (their price to Durrës)
  const competitorPrice = getOldSitePrice(lot);
  if (competitorPrice > 0) {
    // Remove their transport (€3,850) to get true base price
    const theirTransport = 0; // €3,500 + €350
    const basePrice = competitorPrice - theirTransport;

    // Add our shipping
    return basePrice + (ourShipping || 3500) + (pristinaShipping || 350);
  }

  // Fallback to raw Korean price + our shipping
  const rawPrice = getRawKoreanPrice(lot);
  return rawPrice + (ourShipping || 3500) + (pristinaShipping || 350);
}

/**
 * Calculate the final price for a car using config values
 */
export function calculateFinalPrice(
  car: Car,
  config: SiteConfig,
  vehicleType?: string
): number {
  const lot = car.lots?.[0];
  if (!lot) return 0;

  // Get RAW Korean price (actual car cost, no margins)
  const rawPrice = getRawKoreanPrice(lot);

  if (rawPrice > 0) {
    // Get shipping cost (global or vehicle-specific)
    let shippingCost = config.shippingCost;

    if (vehicleType && config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes]) {
      const typeConfig = config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes];
      if (typeConfig?.enabled && typeConfig.shippingCost) {
        shippingCost = typeConfig.shippingCost;
      }
    }

    // Calculate margin using global settings
    const calculatedMargin = Math.round(rawPrice * (config.defaultMarginPercentage / 100));
    const marginAmount = Math.max(calculatedMargin, config.defaultMinimumMargin);

    // Final price: raw price + shipping + margin + Prishtina
    return rawPrice + shippingCost + marginAmount + config.shippingToPristina;
  }

  // Fallback: if raw price not available, use competitor price (not ideal)
  const competitorPrice = getOldSitePrice(lot);
  if (competitorPrice > 0) {
    console.warn('⚠️ Raw price not available, using competitor price as estimate');
    return competitorPrice;
  }

  return 0;
}