'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface VehicleTypeConfig {
    shippingCost: number;
    markupPercentage: number;
    minimumMarkup: number;
    enabled: boolean;
}

export interface SiteConfig {
    shippingCost: number; // Base shipping to Durres
    shippingToPristina: number; // Additional shipping from Durres to Pristina
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
    shippingCost: number; // Shipping to Durres
    shippingToPristina: number; // Additional to Pristina
    markupAmount: number;
    finalPrice: number;
    appliedMarkup: 'percentage' | 'minimum' | 'none';
    vehicleTypeUsed: string;
}

const defaultConfig: SiteConfig = {
    shippingCost: 3500,
    shippingToPristina: 350,
    markupPercentage: 15,      // This is the global fallback
    minimumMarkup: 1000,
    contactEmail: 'blerart@outlook.com',
    contactPhone: '+383 49 195 414',
    siteName: 'Vetura Korea Kosovë',
    currency: 'EUR',
    vehicleTypes: {
        suv: {
            shippingCost: 4500,
            markupPercentage: 18,  // Changed from 0 to 18
            minimumMarkup: 1500,
            enabled: false
        },
        default: {
            shippingCost: 3500,
            markupPercentage: 15,   // Changed from 0 to 15
            minimumMarkup: 1000,
            enabled: true
        }
    }
};

interface ConfigContextType {
    config: SiteConfig;
    updateConfig: (newConfig: SiteConfig) => void;
    calculateFinalPrice: (basePrice: number, vehicleType?: string) => PriceDetails;
    formatPrice: (price: number) => string;
    validateConfig: (config: Partial<SiteConfig>) => { valid: boolean; errors: string[] };
    getVehicleTypeLabel: (type: string) => string;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Helper to safely access localStorage (only on client)
const getStorageConfig = (): SiteConfig | null => {
    if (typeof window === 'undefined') return null;

    try {
        const saved = localStorage.getItem('siteConfig');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure shippingToPristina exists (for backward compatibility)
            if (parsed.shippingToPristina === undefined) {
                parsed.shippingToPristina = 350;
            }
            return parsed;
        }
    } catch (e) {
        console.error('Failed to load config from localStorage');
    }
    return null;
};

// Validation function
const validateConfigValues = (config: Partial<SiteConfig>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (config.shippingCost !== undefined) {
        if (config.shippingCost < 0) errors.push('Shipping cost cannot be negative');
        if (config.shippingCost > 10000) errors.push('Shipping cost seems too high (max €10,000)');
    }

    if (config.shippingToPristina !== undefined) {
        if (config.shippingToPristina < 0) errors.push('Shipping to Pristina cost cannot be negative');
        if (config.shippingToPristina > 1000) errors.push('Shipping to Pristina seems too high (max €1,000)');
    }

    if (config.markupPercentage !== undefined) {
        if (config.markupPercentage < 0) errors.push('Markup percentage cannot be negative');
        if (config.markupPercentage > 100) errors.push('Markup percentage cannot exceed 100%');
    }

    if (config.minimumMarkup !== undefined) {
        if (config.minimumMarkup < 0) errors.push('Minimum markup cannot be negative');
        if (config.minimumMarkup > 50000) errors.push('Minimum markup seems too high (max €50,000)');
    }

    if (config.contactEmail !== undefined && config.contactEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(config.contactEmail)) errors.push('Invalid email format');
    }

    if (config.contactPhone !== undefined && config.contactPhone) {
        const phoneRegex = /^[\+\d\s\-\(\)]{8,20}$/;
        if (!phoneRegex.test(config.contactPhone.replace(/\s/g, ''))) {
            errors.push('Invalid phone number format');
        }
    }

    return { valid: errors.length === 0, errors };
};

// Vehicle type labels in Albanian
const vehicleTypeLabels: Record<string, string> = {
    sedan: 'Sedan',
    suv: 'SUV',
    hatchback: 'Hatchback',
    wagon: 'Kombi',
    coupe: 'Kupe',
    convertible: 'Kabriolet',
    van: 'Furgon',
    pickup: 'Pickup',
    default: 'Tjetër'
};

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const stored = getStorageConfig();
        if (stored) {
            // Ensure stored config has vehicleTypes and shippingToPristina (for backward compatibility)
            if (!stored.vehicleTypes) {
                stored.vehicleTypes = defaultConfig.vehicleTypes;
            }
            if (stored.shippingToPristina === undefined) {
                stored.shippingToPristina = defaultConfig.shippingToPristina;
            }
            const { valid } = validateConfigValues(stored);
            if (valid) {
                setConfig(stored);
            } else {
                console.warn('Invalid stored config, using defaults');
                setConfig(defaultConfig);
            }
        }
    }, []);

    const updateConfig = (newConfig: SiteConfig) => {
        const { valid, errors } = validateConfigValues(newConfig);

        if (!valid) {
            console.error('Invalid config values:', errors);
            return;
        }

        setConfig(newConfig);

        if (typeof window !== 'undefined') {
            localStorage.setItem('siteConfig', JSON.stringify(newConfig));
            window.dispatchEvent(new Event('configUpdated'));
        }
    };

    const calculateFinalPrice = (basePrice: number, vehicleType?: string): PriceDetails => {
        const validBasePrice = Math.max(0, basePrice || 0);

        // Determine which config to use
        let shipping = config.shippingCost; // Shipping to Durres
        let markupPercent = config.markupPercentage;
        let minMarkup = config.minimumMarkup;
        let usedType = 'default';

        // Check if vehicle type is provided and exists in config
        if (vehicleType && config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes]) {
            const typeConfig = config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes];
            if (typeConfig?.enabled) {
                shipping = typeConfig.shippingCost;
                markupPercent = typeConfig.markupPercentage;
                minMarkup = typeConfig.minimumMarkup;
                usedType = vehicleType;
            }
        }

        // If no type-specific config or not enabled, use default if available
        if (usedType === 'default' && config.vehicleTypes.default?.enabled) {
            shipping = config.vehicleTypes.default.shippingCost;
            markupPercent = config.vehicleTypes.default.markupPercentage;
            minMarkup = config.vehicleTypes.default.minimumMarkup;
        }

        const withShipping = validBasePrice + shipping;

        // Calculate markup
        let markupAmount = 0;
        let appliedMarkup: 'percentage' | 'minimum' | 'none' = 'none';

        if (markupPercent > 0) {
            const percentageMarkup = withShipping * (markupPercent / 100);
            const useMinimumMarkup = percentageMarkup < minMarkup;
            markupAmount = useMinimumMarkup ? minMarkup : percentageMarkup;
            appliedMarkup = useMinimumMarkup ? 'minimum' : 'percentage';
        }

        // Final price includes base + shipping to Durres + shipping to Pristina + markup
        const finalPrice = validBasePrice + shipping + config.shippingToPristina + markupAmount;

        return {
            basePrice: validBasePrice,
            shippingCost: shipping,
            shippingToPristina: config.shippingToPristina,
            markupAmount: Math.round(markupAmount),
            finalPrice: Math.round(finalPrice),
            appliedMarkup,
            vehicleTypeUsed: usedType
        };
    };

    const formatPrice = (price: number): string => {
        if (typeof window === 'undefined') {
            return `€${Math.round(price || 0).toLocaleString()}`;
        }

        return new Intl.NumberFormat('sq-AL', {
            style: 'currency',
            currency: config.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price || 0);
    };

    const validateConfig = (configToValidate: Partial<SiteConfig>) => {
        return validateConfigValues(configToValidate);
    };

    const getVehicleTypeLabel = (type: string): string => {
        return vehicleTypeLabels[type] || type;
    };

    return (
        <ConfigContext.Provider value={{
            config,
            updateConfig,
            calculateFinalPrice,
            formatPrice,
            validateConfig,
            getVehicleTypeLabel
        }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}