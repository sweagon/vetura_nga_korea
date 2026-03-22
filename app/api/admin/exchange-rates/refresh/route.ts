// app/api/admin/exchange-rates/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateSessionToken, saveExchangeRatesToDb } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Verify session - FIX: Use 'admin_token'
        const token = request.cookies.get('admin_token')?.value;

        if (!token || !(await validateSessionToken(token))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch latest exchange rates from external API
        const rates = await fetchLatestExchangeRates();

        // Save to database
        await saveExchangeRatesToDb(rates);

        return NextResponse.json({ success: true, rates });
    } catch (error) {
        console.error('Error refreshing exchange rates:', error);
        return NextResponse.json({ error: 'Failed to refresh rates' }, { status: 500 });
    }
}

async function fetchLatestExchangeRates() {
    // Use a free exchange rate API
    try {
        const response = await fetch(
            'https://api.exchangerate-api.com/v4/latest/EUR',
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        return [
            { from: 'KRW', to: 'EUR', rate: 1 / data.rates.KRW, lastUpdated: new Date().toISOString() },
            { from: 'USD', to: 'EUR', rate: data.rates.USD, lastUpdated: new Date().toISOString() },
            { from: 'JPY', to: 'EUR', rate: data.rates.JPY, lastUpdated: new Date().toISOString() }
        ];
    } catch (error) {
        console.error('Error fetching from external API:', error);
        // Return fallback rates
        return [
            { from: 'KRW', to: 'EUR', rate: 0.00068, lastUpdated: new Date().toISOString() },
            { from: 'USD', to: 'EUR', rate: 0.93, lastUpdated: new Date().toISOString() },
            { from: 'JPY', to: 'EUR', rate: 0.0059, lastUpdated: new Date().toISOString() }
        ];
    }
}