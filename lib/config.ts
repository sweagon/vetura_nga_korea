// lib/config.ts - Client-safe types
export interface VehicleTypeConfig {
    shippingCost: number;
    enabled: boolean;
}

export interface SiteConfig {
    shippingCost: number; // Base shipping to Durres
    shippingToPristina: number; // Additional shipping from Durres to Pristina
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
    shippingCost: number; // Shipping to Durres
    shippingToPristina: number; // Additional to Pristina
    finalPrice: number;
    vehicleTypeUsed: string;
}

// Default configuration (used as fallback)
export const defaultConfig: SiteConfig = {
    shippingCost: 3500,
    shippingToPristina: 350,
    contactEmail: 'blerart@outlook.com',
    contactPhone: '+383 49 195 414',
    siteName: 'Vetura Korea Kosova',
    currency: 'EUR',
    vehicleTypes: {
        suv: { shippingCost: 4500, enabled: false },
        sedan: { shippingCost: 3500, enabled: true },
        hatchback: { shippingCost: 3500, enabled: true },
        wagon: { shippingCost: 3500, enabled: true },
        coupe: { shippingCost: 3500, enabled: true },
        van: { shippingCost: 3800, enabled: true },
        pickup: { shippingCost: 4000, enabled: true },
        default: { shippingCost: 3500, enabled: true }
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

    if (config.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
        errors.push('Invalid email format');
    }

    if (config.contactPhone && !/^[\+\d\s\-\(\)]{8,20}$/.test(config.contactPhone.replace(/\s/g, ''))) {
        errors.push('Invalid phone format');
    }

    return { valid: errors.length === 0, errors };
}