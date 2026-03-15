// lib/exchangeRates.ts
import axios from 'axios';

// Free exchange rate API (you can upgrade to paid for production)
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/';

// Cache exchange rates to avoid hitting API limit
let rateCache: {
    usdToEur: number | null;
    krwToEur: number | null;
    lastFetched: Date | null;
} = {
    usdToEur: null,
    krwToEur: null,
    lastFetched: null
};

// Cache expiry time (1 hour)
const CACHE_EXPIRY = 60 * 60 * 1000;

export async function getExchangeRates(): Promise<{ usdToEur: number; krwToEur: number }> {
    try {
        // Check if cache is valid
        if (rateCache.lastFetched && 
            (new Date().getTime() - rateCache.lastFetched.getTime()) < CACHE_EXPIRY &&
            rateCache.usdToEur &&
            rateCache.krwToEur) {
            console.log('📊 Using cached exchange rates');
            return {
                usdToEur: rateCache.usdToEur,
                krwToEur: rateCache.krwToEur
            };
        }

        console.log('🌐 Fetching fresh exchange rates...');
        
        // Fetch USD as base (most common)
        const usdResponse = await axios.get(`${EXCHANGE_API_URL}USD`);
        const krwResponse = await axios.get(`${EXCHANGE_API_URL}KRW`);

        // Get rates to EUR
        const usdToEur = usdResponse.data.rates?.EUR || 0.93;
        const krwToEur = krwResponse.data.rates?.EUR || 0.00068;

        // Update cache
        rateCache = {
            usdToEur,
            krwToEur,
            lastFetched: new Date()
        };

        console.log('✅ Exchange rates updated:', { usdToEur, krwToEur });

        return { usdToEur, krwToEur };
    } catch (error) {
        console.error('❌ Error fetching exchange rates:', error);
        
        // Return cached rates if available, otherwise fallback
        if (rateCache.usdToEur && rateCache.krwToEur) {
            console.log('⚠️ Using expired cache due to API error');
            return {
                usdToEur: rateCache.usdToEur,
                krwToEur: rateCache.krwToEur
            };
        }
        
        // Ultimate fallback
        console.log('⚠️ Using fallback exchange rates');
        return {
            usdToEur: 0.93,
            krwToEur: 0.00068
        };
    }
}

// For server-side only
export async function getExchangeRatesServer(): Promise<{ usdToEur: number; krwToEur: number }> {
    return getExchangeRates();
}
