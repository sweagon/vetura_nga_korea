// lib/priceCalculator.ts
import { Lot } from './api';

export interface CalculatedPrice {
    basePriceEur: number;
    source: 'original_price' | 'buy_now' | 'fallback';
    originalCurrency: 'KRW' | 'USD' | 'N/A';
    originalAmount: number;
}

// Exchange rates (you can make these configurable later)
const KRW_TO_EUR = 0.00068; // Approximate, can be updated
const USD_TO_EUR = 0.93;     // Approximate, can be updated

export function getOriginalPriceInEUR(lot: Lot | undefined): CalculatedPrice {
    if (!lot) {
        return {
            basePriceEur: 0,
            source: 'fallback',
            originalCurrency: 'N/A',
            originalAmount: 0
        };
    }

    // PRIORITY 1: Use original_price in KRW (this is the true base price)
    if (lot.details?.original_price) {
        const basePriceEur = Math.round(lot.details.original_price * KRW_TO_EUR);
        return {
            basePriceEur,
            source: 'original_price',
            originalCurrency: 'KRW',
            originalAmount: lot.details.original_price
        };
    }

    // PRIORITY 2: Use buy_now in USD (fallback)
    if (lot.buy_now) {
        const basePriceEur = Math.round(lot.buy_now * USD_TO_EUR);
        return {
            basePriceEur,
            source: 'buy_now',
            originalCurrency: 'USD',
            originalAmount: lot.buy_now
        };
    }

    // Fallback
    return {
        basePriceEur: 0,
        source: 'fallback',
        originalCurrency: 'N/A',
        originalAmount: 0
    };
}

// Simple version for quick use
export function getBasePrice(lot: Lot | undefined): number {
    return getOriginalPriceInEUR(lot).basePriceEur;
}