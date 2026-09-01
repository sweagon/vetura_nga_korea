// lib/config.ts
export interface VehicleTypeConfig {
    shippingCost: number;
    enabled: boolean;
}

export const DEFAULT_KRW_TO_EUR_RATE = 0.000628;

export interface SiteConfig {
    shippingCost: number;
    shippingToPristina: number;
    defaultMarginPercentage: number;
    defaultMinimumMargin: number;
    krwToEurRate: number;
    contactEmail: string;
    contactPhone: string;
    siteName: string;
    currency: 'EUR' | 'USD' | 'ALL';
    vehicleTypes: {
        suv?: VehicleTypeConfig;
        sedan?: VehicleTypeConfig;
        hatchback?: VehicleTypeConfig;
        wagon?: VehicleTypeConfig;
        coupe?: VehicleTypeConfig;
        van?: VehicleTypeConfig;
        pickup?: VehicleTypeConfig;
        sport_car?: VehicleTypeConfig;
    };
}

export const defaultConfig: SiteConfig = {
    shippingCost: 3500,
    shippingToPristina: 350,
    defaultMarginPercentage: 15,
    defaultMinimumMargin: 1000,
    krwToEurRate: DEFAULT_KRW_TO_EUR_RATE,
    contactEmail: 'blerart@outlook.com',
    contactPhone: '+383 49 195 414',
    siteName: 'Vetura Korea Kosova',
    currency: 'EUR',
    vehicleTypes: {
        suv: { shippingCost: 4500, enabled: false },
        sedan: { shippingCost: 3500, enabled: false },
        hatchback: { shippingCost: 3500, enabled: false },
        wagon: { shippingCost: 3500, enabled: false },
        coupe: { shippingCost: 3500, enabled: false },
        van: { shippingCost: 3800, enabled: false },
        pickup: { shippingCost: 4000, enabled: false },
        sport_car: { shippingCost: 3500, enabled: false }
    }
};

export function validateConfig(config: Partial<SiteConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.shippingCost !== undefined) {
        if (config.shippingCost < 0) errors.push('Shipping cost cannot be negative');
        if (config.shippingCost > 10000) errors.push('Shipping cost seems too high (max €10,000)');
    }

    if (config.shippingToPristina !== undefined) {
        if (config.shippingToPristina < 0) errors.push('Shipping to Pristina cannot be negative');
        if (config.shippingToPristina > 1000) errors.push('Shipping to Pristina too high (max €1,000)');
    }

    if (config.defaultMarginPercentage !== undefined) {
        if (config.defaultMarginPercentage < 0) errors.push('Margin percentage cannot be negative');
        if (config.defaultMarginPercentage > 100) errors.push('Margin percentage cannot exceed 100%');
    }

    if (config.defaultMinimumMargin !== undefined) {
        if (config.defaultMinimumMargin < 0) errors.push('Minimum margin cannot be negative');
        if (config.defaultMinimumMargin > 50000) errors.push('Minimum margin too high (max €50,000)');
    }

    if (config.krwToEurRate !== undefined) {
        if (config.krwToEurRate <= 0) errors.push('KRW to EUR rate must be positive');
        if (config.krwToEurRate > 0.01) errors.push('KRW to EUR rate too high (max €0.01 per KRW)');
    }

    if (config.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
        errors.push('Invalid email format');
    }

    if (config.contactPhone && !/^[\+\d\s\-\(\)]{8,20}$/.test(config.contactPhone.replace(/\s/g, ''))) {
        errors.push('Invalid phone format');
    }

    return { valid: errors.length === 0, errors };
}