import { saveExchangeRatesToDb, syncKrwRateFromRates, type ExchangeRate } from './db';

function fallbackRates(): ExchangeRate[] {
    const now = new Date().toISOString();
    return [
        { from: 'KRW', to: 'EUR', rate: 0.000628, lastUpdated: now },
        { from: 'USD', to: 'EUR', rate: 0.93, lastUpdated: now },
        { from: 'JPY', to: 'EUR', rate: 0.0059, lastUpdated: now }
    ];
}

export function buildRates(krwRate: number, usdRate: number, jpyRate: number): ExchangeRate[] {
    const now = new Date().toISOString();
    return [
        { from: 'KRW', to: 'EUR', rate: krwRate, lastUpdated: now },
        { from: 'USD', to: 'EUR', rate: usdRate, lastUpdated: now },
        { from: 'JPY', to: 'EUR', rate: jpyRate, lastUpdated: now }
    ];
}

export async function fetchLatestExchangeRates(): Promise<ExchangeRate[]> {
    // Prefer XRates API (ECB-sourced) ONLY when an API key is configured.
    const apiKey = process.env.XRATES_API_KEY;
    if (apiKey) {
        try {
            const response = await fetch(
                'https://xratesapi.com/api/v1/latest?base=KRW&symbols=EUR',
                {
                    headers: { Authorization: `Bearer ${apiKey}` },
                    next: { revalidate: 3600 }
                }
            );
            if (response.ok) {
                const data = await response.json();
                const krwRate = Number(data?.rates?.EUR);
                if (krwRate && krwRate > 0) {
                    return buildRates(krwRate, 0.93, 0.0059);
                }
            }
        } catch (error) {
            console.error('Error fetching from XRates API:', error);
        }
    }

    // Free, keyless, open-source sources (ECB/ExchangeRate-API data). Try in order.
    const sources = [
        'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=KRW,USD,JPY',
        'https://open.er-api.com/v6/latest/EUR',
        'https://api.exchangerate-api.com/v4/latest/EUR',
    ];

    for (const url of sources) {
        try {
            const response = await fetch(url, { next: { revalidate: 3600 } });
            if (!response.ok) throw new Error(`API returned ${response.status}`);

            const data = await response.json();
            const krw = Number(data?.rates?.KRW);
            const usd = Number(data?.rates?.USD);
            const jpy = Number(data?.rates?.JPY);

            if (krw && krw > 0) {
                // All three sources are EUR-based, so convert KRW into EUR-per-KRW
                return buildRates(1 / krw, usd > 0 ? usd : 0.93, jpy > 0 ? jpy : 0.0059);
            }
        } catch (error) {
            console.error(`Error fetching from ${url}:`, error);
        }
    }

    // Hard fallback rates
    return fallbackRates();
}

// Fetch market rates, persist them, and keep the live KRW->EUR pricing rate in sync.
export async function refreshExchangeRates(): Promise<ExchangeRate[]> {
    const rates = await fetchLatestExchangeRates();
    await saveExchangeRatesToDb(rates);
    await syncKrwRateFromRates(rates);
    return rates;
}