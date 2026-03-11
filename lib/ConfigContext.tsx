// lib/ConfigContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface VehicleTypeConfig {
    shippingCost: number;
    markupPercentage: number;
    minimumMarkup: number;
    enabled: boolean;
}

export interface SiteConfig {
    shippingCost: number;
    markupPercentage: number;
    minimumMarkup: number;
    contactEmail: string;
    contactPhone: string;
    siteName: string;
    currency: 'EUR' | 'USD' | 'ALL';
    vehicleTypes: {
        suv?: VehicleTypeConfig;
        default?: VehicleTypeConfig;
        // Make other types optional
        sedan?: VehicleTypeConfig;
        hatchback?: VehicleTypeConfig;
        wagon?: VehicleTypeConfig;
        coupe?: VehicleTypeConfig;
        convertible?: VehicleTypeConfig;
        van?: VehicleTypeConfig;
        pickup?: VehicleTypeConfig;
    };
}

const defaultConfig: SiteConfig = {
    shippingCost: 3500,
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

interface ConfigContextType {
    config: SiteConfig;
    updateConfig: (newConfig: SiteConfig) => void;
    calculateFinalPrice: (basePrice: number, vehicleType?: string) => {
        basePrice: number;
        shippingCost: number;
        markupAmount: number;
        finalPrice: number;
        appliedMarkup: 'percentage' | 'minimum';
        vehicleTypeUsed: string;
    };
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
            return JSON.parse(saved);
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
            // Ensure stored config has vehicleTypes (for backward compatibility)
            if (!stored.vehicleTypes) {
                stored.vehicleTypes = defaultConfig.vehicleTypes;
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

    const calculateFinalPrice = (basePrice: number, vehicleType?: string) => {
        const validBasePrice = Math.max(0, basePrice || 0);

        // Determine which config to use
        let shipping = config.shippingCost;
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
        const percentageMarkup = withShipping * (markupPercent / 100);

        const useMinimumMarkup = percentageMarkup < minMarkup;
        const markupAmount = useMinimumMarkup ? minMarkup : percentageMarkup;
        const appliedMarkup: 'percentage' | 'minimum' = useMinimumMarkup ? 'minimum' : 'percentage';

        return {
            basePrice: validBasePrice,
            shippingCost: shipping,
            markupAmount: Math.round(markupAmount),
            finalPrice: Math.round(withShipping + markupAmount),
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