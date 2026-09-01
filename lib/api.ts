import { SiteConfig } from './config';
import { STATIC_MANUFACTURERS, KOSOVO_MANUFACTURER_ORDER } from './staticManufacturers';

export interface Car {
  id: string;
  year: number;
  title: string;
  vin: string | null;
  reference?: string;
  reference_type?: string;
  source_id?: string;
  manufacturer: {
    id: string;
    name: string;
  };
  model: {
    id: string;
    name: string;
    manufacturer_id?: string;
  };
  generation?: {
    id: string;
    name: string;
  };
  body_type?: {
    name: string;
    id: string | null;
  };
  color: {
    name: string;
    id: string | null;
  };
  engine?: {
    id: string | null;
    name: string;
  };
  transmission: {
    name: string;
    id: string | null;
  };
  drive_wheel?: {
    name: string;
    id: string | null;
  };
  vehicle_type: {
    name: string;
    id: string | number | null;
  };
  fuel: {
    name: string;
    id: string | null;
  };
  cylinders: number | null;
  lots: Lot[];
  hp?: number;
  price?: number;
  prices?: Record<string, number>;
  market?: MarketData;
  condition?: ConditionData;
  listing?: ListingData;
  encar_details?: EncarDetails;
}

export interface MarketData {
  vsComparablePct: number | null;
  comparableMedian: number | null;
  comparableCount: number | null;
  priceWas: number | null;
  priceChangePct: number | null;
  priceChangedDaysAgo: number | null;
  daysListed: number | null;
}

export interface ConditionData {
  accident: boolean;
  simpleRepair: boolean;
  seriousHistory: boolean;
  writeOff: boolean;
  encumbered: boolean;
  commercialUse: boolean;
  owners: number | null;
  insuranceClaims: number | null;
  payoutKrw: number | null;
  hasRecord: boolean;
  hasInspection: boolean;
  tier: string | null;
}

export interface ListingData {
  status: string;
  listedOn: string | null;
  url: string | null;
  vin: string | null;
  plate: string | null;
  alsoListedAs: string[];
  listingCount: number | null;
}

export interface InsuranceClaim {
  date: string;
  kind: string;
  label: string;
  total_won?: number;
  parts_won?: number;
  labour_won?: number;
  paint_won?: number;
  total_eur?: number;
}

export interface InsuranceReport {
  available: boolean;
  claims: InsuranceClaim[];
  counts?: { mine: number; other: number; total: number };
  own_damage?: { won: number };
  other_party_damage?: { won: number };
  total_loss?: boolean;
  flood?: boolean;
  stolen?: boolean;
  uninsured_gaps?: string[];
}

export interface EquipmentGroup {
  code: string;
  name: string;
}

export interface EquipmentData {
  groups: {
    standard: EquipmentGroup[];
    etc: EquipmentGroup[];
    choice: EquipmentGroup[];
    tuning: EquipmentGroup[];
  };
  named: number;
  total: number;
}

export interface InspectionReportData {
  available: boolean;
  certificate_no: string | null;
  vin: string | null;
  valid_from: string | null;
  valid_to: string | null;
  filed_on: string | null;
  accident: boolean;
  simple_repair: boolean;
  panels: unknown[];
  panels_structural: number;
  mechanical: unknown[];
  mechanical_checked: number;
  mechanical_flagged: unknown[];
  mechanical_all_clear: boolean;
  photos: string[];
}

export interface AccidentHistoryData {
  vehicle?: Record<string, unknown>;
  condition?: { mileage: number | null; inspectionMileage: number | null; tuning: string | null };
  accident?: {
    hasAccident: boolean;
    status: string;
    hasSimpleRepair: boolean;
    seriousHistory: boolean;
  };
  repairHistory?: {
    simpleRepairs: unknown[];
    structuralRepairs: unknown[];
    panels: unknown[];
  };
  insuranceHistory?: {
    totalDamageAmount: string;
    totalIncidents: number;
    ownDamageKrw: number;
    otherPartyKrw: number;
    ownIncidents: number;
    otherIncidents: number;
    claims: Array<{
      date: string;
      kind: string;
      label: string;
      total_krw: number;
      parts_krw: number;
      labour_krw: number;
      paint_krw: number;
      total_eur: number;
    }>;
    ownerChanges: string[];
    uninsuredGaps: string[];
    totalLoss: boolean;
  };
  flags?: {
    writeOff: boolean;
    flood: boolean;
    stolen: boolean;
    encumbered: boolean;
    commercialUse: boolean;
  };
}

export interface EncarFullDetails {
  id: string;
  brand: string;
  model: string;
  trim: string;
  variant: string;
  year: number;
  mileage: number;
  price: string;
  fuel: string;
  transmission: string;
  color: string;
  body: string;
  seats: number;
  displacement: number | null;
  drivetrain: string;
  region: string;
  dealer_region: string;
  plate: string;
  listed_on: string;
  views: number;
  owners: number;
  first_registered: string;
  inspection_mileage: number | null;
  inspection_date: string | null;
  warranty: boolean;
  extended_warranty: boolean;
  recall_open: boolean;
  tuned: boolean;
  uninsured_gap: string | null;
  status: string;
  url: string;
  photos: string[];
  image: string;
  title: string;
  brand_logo: string;
  currency: string;
  vin: string | null;
  requested_id: string;
  listing_id: string;
  german?: {
    german_eur: number;
    landed_eur: number;
    gap_eur: number;
    gap_pct: number;
    basis: string;
    ad_eur: number;
    url: string | null;
  };
  inspection_report?: InspectionReportData;
  insurance_report?: InsuranceReport;
  equipment?: EquipmentData;
  condition?: ConditionData;
  listing?: ListingData;
}

export interface EncarDetails {
  full?: EncarFullDetails;
  accident_history?: AccidentHistoryData;
  factory_options?: unknown[];
  quote?: unknown[];
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
    country?: {
      iso: string;
      name: string;
    };
    city?: string | {
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
  profit_amount_eur?: number;
  step5?: number;
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
  id: string;
  name: string;
  cars_qty?: number;
  image?: string;
  models_qty?: number;
  cars?: boolean;
  motorcycles?: boolean;
}

export interface Model {
  id: string;
  name: string;
  manufacturer_id: string;
  cars_qty?: number;
  generations_qty?: number;
}

export interface Generation {
  id: string;
  name: string;
  model_id: string;
  manufacturer_id: string;
  cars_qty?: number;
}

export interface FilterData {
  manufacturers: Manufacturer[];
  models: Model[];
  generations: Generation[];
  fuelTypes: Array<{ id: string; name: string }>;
  transmissions: Array<{ id: string; name: string }>;
  years: number[];
  bodyTypes: Array<{ id: string; name: string }>;
  colors: Array<{ id: string; name: string }>;
}

const getFullUrl = (path: string): string => {
  if (typeof window !== 'undefined') return path;
  if (process.env.NODE_ENV === 'development') return `http://localhost:3002${path}`;
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXTAUTH_URL || 'https://veturakoreakosove.com';
  return `${baseUrl}${path}`;
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Kërkesa zgjati shumë (${timeout / 1000} sekonda). Provo përsëri.`);
    }
    throw error;
  }
};

export async function fetchCars(params: Record<string, any> = {}) {
  try {
    const queryParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = value.toString();
      }
    });
    if (!queryParams.per_page) queryParams.per_page = '12';

    const queryString = new URLSearchParams(queryParams).toString();
    const path = `/api/proxy/cars${queryString ? `?${queryString}` : ''}`;
    const url = getFullUrl(path);

    const response = await fetchWithTimeout(url, {}, 30000);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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

export async function fetchCarById(id: string): Promise<Car | null> {
  try {
    if (!id) return null;

    const path = `/api/proxy/cars/${encodeURIComponent(id)}`;
    const url = getFullUrl(path);

    const response = await fetchWithTimeout(url, {}, 15000);

    if (response.status !== 200) return null;

    const data = await response.json();
    // The proxy returns { data: { ...car } } for the detail endpoint.
    const car = data?.data || data;
    if (!car || !car.manufacturer) return null;
    return car as Car;
  } catch (error) {
    console.error('Error fetching car by id:', error);
    return null;
  }
}

export async function fetchCarPhotos(id: string, thumb?: string): Promise<string[]> {
  try {
    if (!id) return [];

    let path = `/api/cars/${encodeURIComponent(id)}/photos`;
    if (thumb) path += `?thumb=${encodeURIComponent(thumb)}`;
    const url = getFullUrl(path);

    const response = await fetchWithTimeout(url, {}, 20000);

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data?.photos) ? data.photos : [];
  } catch (error) {
    console.error('Error fetching car photos:', error);
    return [];
  }
}

export function extractVinFromParam(param: string): string {
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (vinRegex.test(param)) return param;
  return param;
}

export async function fetchManufacturers(type: string = 'cars'): Promise<Manufacturer[]> {
  try {
    const path = `/api/proxy/manufacturers/${type}`;
    const url = getFullUrl(path);
    const response = await fetchWithTimeout(url, {}, 15000);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const manufacturers: Manufacturer[] = data.data || data || [];

    return manufacturers.sort((a, b) => {
      const indexA = KOSOVO_MANUFACTURER_ORDER.indexOf(a.name);
      const indexB = KOSOVO_MANUFACTURER_ORDER.indexOf(b.name);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return STATIC_MANUFACTURERS.map(m => ({ id: m.id, name: m.name, image: undefined }));
  }
}

export async function fetchModels(manufacturerId: string, type: string = 'cars'): Promise<Model[]> {
  if (!manufacturerId) return [];
  try {
    const path = `/api/proxy/models/${encodeURIComponent(manufacturerId)}/${type}`;
    const url = getFullUrl(path);
    const response = await fetchWithTimeout(url, {}, 15000);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return (data.data || data || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      manufacturer_id: manufacturerId,
      cars_qty: m.cars_qty,
      generations_qty: m.generations_qty,
    }));
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

export async function fetchGenerations(modelId: string, type: string = 'cars'): Promise<Generation[]> {
  if (!modelId) return [];
  try {
    const path = `/api/proxy/generations/${encodeURIComponent(modelId)}/${type}`;
    const url = getFullUrl(path);
    const response = await fetchWithTimeout(url, {}, 15000);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return (data.data || data || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      model_id: modelId,
      manufacturer_id: g.manufacturer_id ?? '',
      cars_qty: g.cars_qty,
    }));
  } catch (error) {
    console.error('Error fetching generations:', error);
    return [];
  }
}

export async function fetchFilterData(): Promise<FilterData> {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  const manufacturers = await fetchManufacturers('cars');

  return {
    manufacturers,
    models: [],
    generations: [],
    fuelTypes: [
      { id: 'Diesel', name: 'Diesel' },
      { id: 'Electric', name: 'Electric' },
      { id: 'Gasoline', name: 'Gasoline' },
      { id: 'Gasoline Hybrid', name: 'Gasoline Hybrid' },
    ],
    transmissions: [
      { id: 'Automatic', name: 'Automatic' },
      { id: 'Manual', name: 'Manual' },
    ],
    years,
    bodyTypes: [
      { id: 'SUV', name: 'SUV' },
      { id: 'Small Sedan', name: 'Small Sedan' },
      { id: 'Compact', name: 'Compact' },
      { id: 'Mid-size', name: 'Mid-size' },
      { id: 'Full-size', name: 'Full-size' },
      { id: 'City Car', name: 'City Car' },
      { id: 'Van', name: 'Van' },
      { id: 'Sports Car', name: 'Sports Car' },
    ],
    colors: [
      { id: 'Black', name: 'Black' },
      { id: 'White', name: 'White' },
      { id: 'Silver', name: 'Silver' },
      { id: 'Grey', name: 'Grey' },
      { id: 'Silver Grey', name: 'Silver Grey' },
      { id: 'Blue', name: 'Blue' },
      { id: 'Red', name: 'Red' },
      { id: 'Green', name: 'Green' },
      { id: 'Orange', name: 'Orange' },
      { id: 'Pearl', name: 'Pearl' },
    ],
  };
}

const VEHICLE_TYPE_FROM_BODY: Record<string, string> = {
  'suv': 'suv',
  'van': 'van',
  'sports car': 'sport_car',
  'city car': 'sedan',
  'compact': 'sedan',
  'mid-size': 'sedan',
  'full-size': 'sedan',
  'small sedan': 'sedan',
};

export function getVehicleTypeFromBodyName(bodyTypeName: string): string {
  const key = bodyTypeName?.toLowerCase().trim() || '';
  return VEHICLE_TYPE_FROM_BODY[key] || 'default';
}

export function getLotLocationName(lot: Lot | undefined): string {
  const city = lot?.location?.city;
  if (typeof city === 'string') return city || 'Korea';
  return city?.name || 'Korea';
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
    'black': 'Zi', 'white': 'Bardhë', 'silver': 'Argjend',
    'grey': 'Gri', 'gray': 'Gri', 'blue': 'Kaltër', 'red': 'Kuq',
    'green': 'Gjelbër', 'brown': 'Kafe', 'beige': 'Bezhë',
    'yellow': 'Verdhë', 'orange': 'Portokalli', 'purple': 'Vjollcë', 'gold': 'Arë'
  };
  return colorMap[color.toLowerCase()] || color;
}

export function getBodyTypeAlbanian(bodyType: string): string {
  const bodyMap: Record<string, string> = {
    'sedan': 'Sedan', 'suv': 'SUV', 'coupe': 'Kupe',
    'hatchback': 'Hatchback', 'wagon': 'Kombi', 'van': 'Furgon',
    'pickup': 'Pickup', 'cabrio': 'Kabriolet', 'sport_car': 'Makinë Sportive'
  };
  return bodyMap[bodyType.toLowerCase()] || bodyType;
}
