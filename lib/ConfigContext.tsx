'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteConfig, defaultConfig, validateConfig } from './config';
import { calculateClientFinalPrice, type PriceDetails } from './pricing';

export type { PriceDetails };

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
    sport_car: 'Makinë Sportive',
    default: 'Tjetër'
};

export function ConfigProvider({
    children,
    initialConfig
}: {
    children: React.ReactNode;
    initialConfig?: SiteConfig;
}) {
    const [config, setConfig] = useState<SiteConfig>(initialConfig ?? defaultConfig);
    const [loading, setLoading] = useState(!initialConfig);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Always re-fetch fresh config on the client. The server-seeded `initialConfig`
        // avoids the initial price-glitch flicker, but a hard refresh / deploy can leave
        // the seed stale (e.g. a fallback defaultConfig). Fetching once after mount keeps
        // the admin panel and car prices in sync with whatever is actually in the DB.
        const fetchConfig = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/config', { credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch configuration');
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
            if (!valid) throw new Error(`Invalid config: ${errors.join(', ')}`);

            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        return calculateClientFinalPrice(basePrice, config, vehicleType);
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

    const getVehicleTypeLabel = (type: string): string => {
        return vehicleTypeLabels[type] || type;
    };

    return (
        <ConfigContext.Provider value={{
            config, updateConfig, calculateFinalPrice, formatPrice,
            validateConfig, getVehicleTypeLabel, loading, error
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
