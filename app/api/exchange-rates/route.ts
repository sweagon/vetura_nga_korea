// app/api/exchange-rates/route.ts
import { NextResponse } from 'next/server';
import { getExchangeRatesServer } from '@/lib/exchangeRates';

export async function GET() {
    try {
        const rates = await getExchangeRatesServer();
        
        return NextResponse.json({
            success: true,
            rates,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return NextResponse.json({
            success: false,
            rates: {
                usdToEur: 0.93,
                krwToEur: 0.00068
            },
            timestamp: new Date().toISOString(),
            error: 'Using fallback rates'
        });
    }
}
