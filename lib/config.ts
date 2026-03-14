// lib/config.ts - Client-safe types and pure functions
export interface VehicleTypeConfig {
    shippingCost: number;
    markupPercentage: number;
    minimumMarkup: number;
    enabled: boolean;
}

export interface SiteConfig {
    shippingCost: number;
    shippingToPristina: number;
    markupPercentage: number;
    minimumMarkup: number;
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
    };
}

export interface PriceDetails {
    basePrice: number;
    shippingCost: number;
    shippingToPristina: number;
    markupAmount: number;
    finalPrice: number;
    appliedMarkup: 'percentage' | 'minimum' | 'none';
    vehicleTypeUsed: string;
}

// Default configuration (used as fallback)
export const defaultConfig: SiteConfig = {
    shippingCost: 3500,
    shippingToPristina: 350,
    markupPercentage: 15,
    minimumMarkup: 1000,
    contactEmail: 'blerart@outlook.com',
    contactPhone: '+383 49 195 414',
    siteName: 'Vetura Korea Kosova',
    currency: 'EUR',
    vehicleTypes: {
        suv: { shippingCost: 4500, markupPercentage: 18, minimumMarkup: 1500, enabled: false },
        default: { shippingCost: 3500, markupPercentage: 15, minimumMarkup: 1000, enabled: true }
    }
};

// PURE FUNCTION - Safe for client-side
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

    if (config.markupPercentage !== undefined) {
        if (config.markupPercentage < 0) errors.push('Markup percentage cannot be negative');
        if (config.markupPercentage > 100) errors.push('Markup percentage cannot exceed 100%');
    }

    if (config.minimumMarkup !== undefined) {
        if (config.minimumMarkup < 0) errors.push('Minimum markup cannot be negative');
        if (config.minimumMarkup > 50000) errors.push('Minimum markup too high (max €50,000)');
    }

    if (config.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
        errors.push('Invalid email format');
    }

    if (config.contactPhone && !/^[\+\d\s\-\(\)]{8,20}$/.test(config.contactPhone.replace(/\s/g, ''))) {
        errors.push('Invalid phone format');
    }

    return { valid: errors.length === 0, errors };
}