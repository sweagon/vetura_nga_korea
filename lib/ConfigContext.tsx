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
                const response = await fetch('/api/config', {
                    credentials: 'include'
                });

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
                credentials: 'include',
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
        // Ensure basePrice is a valid number
        const validBasePrice = typeof basePrice === 'number' && !isNaN(basePrice) ? Math.max(0, basePrice) : 0;

        console.log('💰 calculateFinalPrice called with:', {
            validBasePrice,
            vehicleType,
            config: {
                shippingCost: config.shippingCost,
                shippingToPristina: config.shippingToPristina,
                defaultMarginPercentage: config.defaultMarginPercentage,
                defaultMinimumMargin: config.defaultMinimumMargin
            }
        });

        // Get vehicle-specific config
        let vehicleShipping = config.shippingCost || 3500;
        let marginPercentage = config.defaultMarginPercentage || 15;
        let minimumMargin = config.defaultMinimumMargin || 1000;
        let usedType = 'default';

        if (vehicleType && config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes]) {
            const typeConfig = config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes];
            if (typeConfig?.enabled) {
                vehicleShipping = typeConfig.shippingCost || vehicleShipping;
                marginPercentage = typeConfig.marginPercentage || marginPercentage;
                minimumMargin = typeConfig.minimumMargin || minimumMargin;
                usedType = vehicleType;
            }
        }

        // Calculate margin (percentage of base price)
        const calculatedMargin = Math.round(validBasePrice * (marginPercentage / 100));

        // Use minimum margin if calculated is lower, ensure it's a valid number
        const marginAmount = !isNaN(calculatedMargin) && !isNaN(minimumMargin)
            ? Math.max(calculatedMargin, minimumMargin)
            : (minimumMargin || 1000);

        // Build final price: base + shipping + margin + Prishtina
        const finalPrice = validBasePrice + vehicleShipping + marginAmount + config.shippingToPristina;

        console.log('📊 Price calculation result:', {
            validBasePrice,
            vehicleShipping,
            marginPercentage,
            calculatedMargin,
            minimumMargin,
            marginAmount,
            shippingToPristina: config.shippingToPristina,
            finalPrice
        });

        return {
            basePrice: validBasePrice,
            shippingCost: vehicleShipping,
            shippingToPristina: config.shippingToPristina,
            marginAmount: Math.round(marginAmount),
            marginPercentage,
            finalPrice: Math.round(finalPrice),
            vehicleTypeUsed: usedType
        };
    }, [config]);

    const formatPrice = useCallback((price: number): string => {
        if (typeof price !== 'number' || isNaN(price)) return '€0';
        return new Intl.NumberFormat('sq-AL', {
            style: 'currency',
            currency: config.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price || 0);
    }, [config.currency]);

    const validateConfigWrapper = (configToValidate: Partial<SiteConfig>) => {
        return validateConfig(configToValidate);
    };

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
            validateConfig: validateConfigWrapper,
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