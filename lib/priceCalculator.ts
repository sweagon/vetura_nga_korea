// lib/priceCalculator.ts - UPDATED to use original_price directly
import { Lot } from './api';

export interface CalculatedPrice {
    basePriceEur: number;
    source: 'original_price' | 'buy_now' | 'fallback';
    originalCurrency: 'KRW' | 'USD' | 'N/A';
    originalAmount: number;
    msrpEur?: number;
}

// Exchange rate (should come from admin panel)
const KRW_TO_EUR = 0.000573; // Current market rate
const USD_TO_EUR = 0.93;

/**
 * Get the original Korean price directly from the API
 * This is the retail price listed on Encar (no discount)
 */
export function getOriginalKoreanPrice(lot: Lot | undefined): CalculatedPrice {
    if (!lot) {
        return {
            basePriceEur: 0,
            source: 'fallback',
            originalCurrency: 'N/A',
            originalAmount: 0,
        };
    }

    // Priority 1: Use original_price directly (this is the Encar retail price)
    if (lot.details?.original_price) {
        const originalKrW = lot.details.original_price;
        const originalEur = Math.round(originalKrW * KRW_TO_EUR);

        return {
            basePriceEur: originalEur,
            source: 'original_price',
            originalCurrency: 'KRW',
            originalAmount: originalKrW,
            msrpEur: originalEur
        };
    }

    // Priority 2: Fallback to buy_now in USD
    if (lot.buy_now) {
        const originalEur = Math.round(lot.buy_now * USD_TO_EUR);
        return {
            basePriceEur: originalEur,
            source: 'buy_now',
            originalCurrency: 'USD',
            originalAmount: lot.buy_now,
        };
    }

    // Fallback
    return {
        basePriceEur: 0,
        source: 'fallback',
        originalCurrency: 'N/A',
        originalAmount: 0,
    };
}

/**
 * Get final price with shipping and margin applied
 */
export function getFinalPriceWithMargin(
    lot: Lot | undefined,
    marginPercentage: number,
    minimumMargin: number,
    seaShipping: number,
    landShipping: number
): { basePrice: number; marginAmount: number; finalPrice: number } {
    const original = getOriginalKoreanPrice(lot);
    const basePrice = original.basePriceEur;

    if (basePrice <= 0) {
        return { basePrice: 0, marginAmount: 0, finalPrice: 0 };
    }

    // Calculate margin (percentage of base price)
    const calculatedMargin = Math.round(basePrice * (marginPercentage / 100));
    const marginAmount = Math.max(calculatedMargin, minimumMargin);

    // Final price formula:
    // Original Korean price + Sea shipping + Margin + Land shipping
    const finalPrice = basePrice + seaShipping + marginAmount + landShipping;

    return {
        basePrice,
        marginAmount,
        finalPrice
    };
}

// Simple version for quick use (backward compatibility)
export function getBasePrice(lot: Lot | undefined): number {
    return getOriginalKoreanPrice(lot).basePriceEur;
}