// lib/useConfig.ts
'use client';

import { useState, useEffect } from 'react';

interface SiteConfig {
    shippingCost: number;
    markupPercentage: number;
    minimumMarkup: number;
    contactEmail: string;
    contactPhone: string;
    siteName: string;
    currency: string;
}

const defaultConfig: SiteConfig = {
    shippingCost: 3500,
    markupPercentage: 15,
    minimumMarkup: 1000,
    contactEmail: 'info@vetura-korea-kosove.com',
    contactPhone: '+383 49 195 414',
    siteName: 'Vetura Nga Korea',
    currency: 'EUR'
};

export function useConfig() {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);

    useEffect(() => {
        const saved = localStorage.getItem('siteConfig');
        if (saved) {
            try {
                setConfig(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load config');
            }
        }
    }, []);

    // Helper to calculate final price
    const calculatePrice = (basePrice: number): number => {
        const withShipping = basePrice + config.shippingCost;
        const withMarkup = withShipping * (1 + config.markupPercentage / 100);
        return Math.max(withMarkup, basePrice + config.minimumMarkup);
    };

    return { config, calculatePrice };
}