// app/api/admin/exchange-rates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRatesFromDb, saveExchangeRatesToDb, validateSessionToken } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // FIX: Use 'admin_token' not 'admin_session'
        const token = request.cookies.get('admin_token')?.value;

        if (!token || !(await validateSessionToken(token))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get exchange rates from database
        const rates = await getExchangeRatesFromDb();

        return NextResponse.json({ rates });
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // FIX: Use 'admin_token' not 'admin_session'
        const token = request.cookies.get('admin_token')?.value;

        if (!token || !(await validateSessionToken(token))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { rates } = await request.json();

        // Validate rates
        if (!rates || !Array.isArray(rates)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Save to database
        await saveExchangeRatesToDb(rates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving exchange rates:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// FIX: Implement actual database functions
async function getExchangeRates() {
    const { sql } = require('@vercel/postgres');
    try {
        const { rows } = await sql`
            SELECT rates, updated_at FROM exchange_rates 
            WHERE id = 1 
            LIMIT 1
        `;

        if (rows.length === 0) {
            // Return default rates
            return [
                { from: 'KRW', to: 'EUR', rate: 0.00068, lastUpdated: new Date().toISOString() },
                { from: 'USD', to: 'EUR', rate: 0.93, lastUpdated: new Date().toISOString() },
                { from: 'JPY', to: 'EUR', rate: 0.0059, lastUpdated: new Date().toISOString() }
            ];
        }

        return rows[0].rates;
    } catch (error) {
        console.error('Error getting exchange rates from DB:', error);
        // Return default rates
        return [
            { from: 'KRW', to: 'EUR', rate: 0.00068, lastUpdated: new Date().toISOString() },
            { from: 'USD', to: 'EUR', rate: 0.93, lastUpdated: new Date().toISOString() },
            { from: 'JPY', to: 'EUR', rate: 0.0059, lastUpdated: new Date().toISOString() }
        ];
    }
}

async function saveExchangeRates(rates: any[]) {
    const { sql } = require('@vercel/postgres');
    try {
        await sql`
            INSERT INTO exchange_rates (id, rates, updated_at) 
            VALUES (1, ${JSON.stringify(rates)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE 
            SET rates = EXCLUDED.rates, updated_at = NOW()
        `;
        console.log('✅ Exchange rates saved to database');
    } catch (error) {
        console.error('Error saving exchange rates:', error);
        throw error;
    }
}