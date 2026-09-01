import { NextResponse } from 'next/server';
import { getExchangeRatesFromDb } from '@/lib/db';

export async function GET() {
    try {
        const rates = await getExchangeRatesFromDb();

        return NextResponse.json({
            success: true,
            rates,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return NextResponse.json({
            success: false,
            rates: [
                { from: 'KRW', to: 'EUR', rate: 0.00068, lastUpdated: new Date().toISOString() },
                { from: 'USD', to: 'EUR', rate: 0.93, lastUpdated: new Date().toISOString() },
                { from: 'JPY', to: 'EUR', rate: 0.0059, lastUpdated: new Date().toISOString() }
            ],
            timestamp: new Date().toISOString(),
            error: 'Using fallback rates'
        }, { status: 200 });
    }
}
