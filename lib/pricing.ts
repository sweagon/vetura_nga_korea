import { Lot } from './api';
import { SiteConfig, defaultConfig, DEFAULT_KRW_TO_EUR_RATE } from './config';

function safeNum(v: number | undefined, fallback: number): number {
    return typeof v === 'number' && !isNaN(v) && v >= 0 ? v : fallback;
}

export interface CalculatedPrice {
    basePriceEur: number;
    providerProfit: number;
    source: 'krw' | 'buy_now' | 'fallback';
    originalCurrency: 'KRW' | 'EUR' | 'N/A';
    originalAmount: number;
}

export interface PriceDetails {
    basePrice: number;
    providerProfit: number;
    shippingCost: number;
    shippingToPristina: number;
    marginAmount: number;
    marginPercentage: number;
    finalPrice: number;
    vehicleTypeUsed: string;
}

// The provider's explicit margin on a car (profit_amount_eur) that we strip out.
// Reverse-engineered from the live API: profit = max(216.58 + 0.095 * buy_now, 900)
export function getProviderProfit(buyNow: number): number {
    if (!buyNow || isNaN(buyNow)) return 0;
    return Math.max(Math.round((216.58 + 0.095 * buyNow) * 100) / 100, 900);
}

// The true cost of the car to us:
// 1) Prefer the real Encar KRW price (original_price) converted at OUR configured rate
//    (config.krwToEurRate, refreshed from the market) — the provider has no markup baked in.
// 2) Fall back to the provider's own EUR base (buy_now) when KRW data is missing.
// The provider's own margin (profit_amount_eur / formula) is stripped and never charged.
export function getCarBasePriceEur(
    lot: Lot | undefined,
    krwToEurRate: number = DEFAULT_KRW_TO_EUR_RATE
): CalculatedPrice {
    if (!lot) {
        return { basePriceEur: 0, providerProfit: 0, source: 'fallback', originalCurrency: 'N/A', originalAmount: 0 };
    }

    const krwPrice = lot.details?.original_price;
    const useKrw = typeof krwPrice === 'number' && isFinite(krwPrice) && krwPrice > 0
        && typeof krwToEurRate === 'number' && isFinite(krwToEurRate) && krwToEurRate > 0;

    let basePriceEur: number;
    let source: CalculatedPrice['source'];
    let originalCurrency: CalculatedPrice['originalCurrency'];
    let originalAmount: number;

    if (useKrw) {
        basePriceEur = Math.round(krwPrice * krwToEurRate);
        source = 'krw';
        originalCurrency = 'KRW';
        originalAmount = krwPrice;
    } else {
        basePriceEur = Math.round(lot.buy_now || 0);
        source = basePriceEur > 0 ? 'buy_now' : 'fallback';
        originalCurrency = basePriceEur > 0 ? 'EUR' : 'N/A';
        originalAmount = lot.buy_now || 0;
    }

    const providerProfit = basePriceEur > 0
        ? (typeof lot.profit_amount_eur === 'number' && lot.profit_amount_eur > 0
            ? Math.round(lot.profit_amount_eur * 100) / 100
            : getProviderProfit(basePriceEur))
        : 0;

    return {
        basePriceEur,
        providerProfit,
        source,
        originalCurrency,
        originalAmount,
    };
}

export function getOriginalKoreanPrice(
    lot: Lot | undefined,
    krwToEurRate: number = DEFAULT_KRW_TO_EUR_RATE
): CalculatedPrice {
    return getCarBasePriceEur(lot, krwToEurRate);
}

export function getBasePrice(
    lot: Lot | undefined,
    krwToEurRate: number = DEFAULT_KRW_TO_EUR_RATE
): number {
    return getCarBasePriceEur(lot, krwToEurRate).basePriceEur;
}

export function calculateFinalPriceWithConfig(
    lot: Lot | undefined,
    config: SiteConfig,
    vehicleType?: string
): PriceDetails {
    const empty = () => ({
        basePrice: 0, providerProfit: 0, shippingCost: 0, shippingToPristina: 0,
        marginAmount: 0, marginPercentage: 0, finalPrice: 0, vehicleTypeUsed: 'default'
    });

    if (!lot) return empty();

    const { basePriceEur, providerProfit } = getCarBasePriceEur(lot, config.krwToEurRate ?? DEFAULT_KRW_TO_EUR_RATE);
    if (basePriceEur <= 0) return empty();

    let shippingCost = safeNum(config.shippingCost, defaultConfig.shippingCost);
    let usedType = 'default';

    if (vehicleType) {
        const typeConfig = config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes];
        if (typeConfig?.enabled && typeConfig.shippingCost) {
            shippingCost = safeNum(typeConfig.shippingCost, defaultConfig.shippingCost);
            usedType = vehicleType;
        }
    }

    const marginPct = safeNum(config.defaultMarginPercentage, defaultConfig.defaultMarginPercentage);
    const minMargin = safeNum(config.defaultMinimumMargin, defaultConfig.defaultMinimumMargin);
    const pristina = safeNum(config.shippingToPristina, defaultConfig.shippingToPristina);

    const calculatedMargin = Math.round(basePriceEur * (marginPct / 100));
    const marginAmount = Math.max(calculatedMargin, minMargin);
    const finalPrice = basePriceEur + shippingCost + marginAmount + pristina;

    return {
        basePrice: basePriceEur,
        providerProfit,
        shippingCost,
        shippingToPristina: pristina,
        marginAmount: Math.round(marginAmount),
        marginPercentage: marginPct,
        finalPrice: Math.round(finalPrice),
        vehicleTypeUsed: usedType
    };
}

export function calculateClientFinalPrice(
    basePrice: number,
    config: SiteConfig,
    vehicleType?: string
): PriceDetails {
    const validBasePrice = typeof basePrice === 'number' && !isNaN(basePrice) ? Math.max(0, basePrice) : 0;

    let vehicleShipping = safeNum(config.shippingCost, defaultConfig.shippingCost);
    let usedType = 'default';

    if (vehicleType) {
        const typeConfig = config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes];
        if (typeConfig?.enabled && typeConfig.shippingCost) {
            vehicleShipping = safeNum(typeConfig.shippingCost, defaultConfig.shippingCost);
            usedType = vehicleType;
        }
    }

    const marginPct = safeNum(config.defaultMarginPercentage, defaultConfig.defaultMarginPercentage);
    const minMargin = safeNum(config.defaultMinimumMargin, defaultConfig.defaultMinimumMargin);
    const pristina = safeNum(config.shippingToPristina, defaultConfig.shippingToPristina);

    const calculatedMargin = Math.round(validBasePrice * (marginPct / 100));
    const marginAmount = Math.max(calculatedMargin, minMargin);
    const finalPrice = validBasePrice + vehicleShipping + marginAmount + pristina;

    return {
        basePrice: validBasePrice,
        providerProfit: validBasePrice > 0 ? getProviderProfit(validBasePrice) : 0,
        shippingCost: vehicleShipping,
        shippingToPristina: pristina,
        marginAmount: Math.round(marginAmount),
        marginPercentage: marginPct,
        finalPrice: Math.round(finalPrice),
        vehicleTypeUsed: usedType
    };
}

export function getDisplayPrice(
    lot: Lot | undefined,
    config: SiteConfig,
    vehicleType?: string
): number {
    const { finalPrice } = calculateFinalPriceWithConfig(lot, config, vehicleType);
    return finalPrice;
}
