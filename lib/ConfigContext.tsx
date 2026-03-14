'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteConfig, defaultConfig, PriceDetails, validateConfig } from './config';

interface ConfigContextType {
    config: SiteConfig;
    updateConfig: (newConfig: SiteConfig) => Promise<void>;
    calculateFinalPrice: (basePrice: number, vehicleType?: string) => PriceDetails;
    formatPrice: (price: number) => string;
    validateConfig: (config: Partial<SiteConfig>) => { valid: boolean; errors: string[] };
    getVehicleTypeLabel: (type: string) => string;
    loading: boolean;
    error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load config from server on mount
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/config');

                if (!response.ok) {
                    throw new Error('Failed to fetch configuration');
                }

                const data = await response.json();
                setConfig(data);
                setError(null);
            } catch (err) {
                console.error('Error loading config:', err);
                setError('Failed to load configuration');
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();

        const interval = setInterval(fetchConfig, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const updateConfig = async (newConfig: SiteConfig) => {
        try {
            const { valid, errors } = validateConfig(newConfig);
            if (!valid) {
                throw new Error(`Invalid config: ${errors.join(', ')}`);
            }

            const response = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // ← MAKE SURE THIS IS HERE
                body: JSON.stringify(newConfig),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save config');
            }

            setConfig(newConfig);
            window.dispatchEvent(new Event('configUpdated'));

        } catch (error) {
            console.error('Error updating config:', error);
            throw error;
        }
    };

    const calculateFinalPrice = useCallback((basePrice: number, vehicleType?: string): PriceDetails => {
        const validBasePrice = Math.max(0, basePrice || 0);

        let shipping = config.shippingCost;
        let usedType = 'default';

        // Check vehicle type config
        if (vehicleType && config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes]) {
            const typeConfig = config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes];
            if (typeConfig?.enabled) {
                shipping = typeConfig.shippingCost;
                usedType = vehicleType;
            }
        }

        // Simple calculation: base price + shipping costs
        const finalPrice = validBasePrice + shipping + config.shippingToPristina;

        return {
            basePrice: validBasePrice,
            shippingCost: shipping,
            shippingToPristina: config.shippingToPristina,
            finalPrice: Math.round(finalPrice),
            vehicleTypeUsed: usedType
        };
    }, [config]);

    const formatPrice = useCallback((price: number): string => {
        return new Intl.NumberFormat('sq-AL', {
            style: 'currency',
            currency: config.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price || 0);
    }, [config.currency]);

    const getVehicleTypeLabel = (type: string): string => {
        return vehicleTypeLabels[type] || type;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <ConfigContext.Provider value={{
            config,
            updateConfig,
            calculateFinalPrice,
            formatPrice,
            validateConfig,
            getVehicleTypeLabel,
            loading,
            error
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