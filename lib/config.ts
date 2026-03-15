// lib/config.ts - Client-safe types with margins
export interface VehicleTypeConfig {
    shippingCost: number;
    marginPercentage: number;
    minimumMargin: number;
    enabled: boolean;
}

// In lib/config.ts, update the SiteConfig interface
export interface SiteConfig {
    shippingCost: number;
    shippingToPristina: number;
    defaultMarginPercentage: number;
    defaultMinimumMargin: number;
    contactEmail: string;
    contactPhone: string;
    siteName: string;
    currency: 'EUR' | 'USD' | 'ALL';
    vehicleTypes: {
        suv?: VehicleTypeConfig;
        default?: VehicleTypeConfig;
        sedan?: VehicleTypeConfig;
        hatchback?: VehicleTypeConfig;
        wagon?: VehicleTypeConfig;
        coupe?: VehicleTypeConfig;
        convertible?: VehicleTypeConfig;
        van?: VehicleTypeConfig;
        pickup?: VehicleTypeConfig;
        sport_car?: VehicleTypeConfig;  // ADD THIS
    };
}

export interface PriceDetails {
    basePrice: number;
    shippingCost: number; // Shipping to Durres
    shippingToPristina: number; // Additional to Pristina
    marginAmount: number;
    marginPercentage: number;
    finalPrice: number;
    vehicleTypeUsed: string;
}

// Update defaultConfig to include sport_car
export const defaultConfig: SiteConfig = {
    shippingCost: 3500,
    shippingToPristina: 350,
    defaultMarginPercentage: 15,
    defaultMinimumMargin: 1000,
    contactEmail: 'blerart@outlook.com',
    contactPhone: '+383 49 195 414',
    siteName: 'Vetura Korea Kosova',
    currency: 'EUR',
    vehicleTypes: {
        suv: { shippingCost: 4500, marginPercentage: 18, minimumMargin: 1500, enabled: true },
        sedan: { shippingCost: 3500, marginPercentage: 15, minimumMargin: 1000, enabled: true },
        hatchback: { shippingCost: 3500, marginPercentage: 15, minimumMargin: 1000, enabled: true },
        wagon: { shippingCost: 3500, marginPercentage: 15, minimumMargin: 1000, enabled: true },
        coupe: { shippingCost: 3500, marginPercentage: 15, minimumMargin: 1000, enabled: true },
        van: { shippingCost: 3800, marginPercentage: 12, minimumMargin: 800, enabled: true },
        pickup: { shippingCost: 4000, marginPercentage: 12, minimumMargin: 800, enabled: true },
        sport_car: { shippingCost: 3500, marginPercentage: 15, minimumMargin: 1500, enabled: true }, // ADD THIS
        default: { shippingCost: 3500, marginPercentage: 15, minimumMargin: 1000, enabled: true }
    }
};

// Validation function
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

    if (config.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
        errors.push('Invalid email format');
    }

    if (config.contactPhone && !/^[\+\d\s\-\(\)]{8,20}$/.test(config.contactPhone.replace(/\s/g, ''))) {
        errors.push('Invalid phone format');
    }

    return { valid: errors.length === 0, errors };
}