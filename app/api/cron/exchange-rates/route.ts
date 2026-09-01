// app/api/cron/exchange-rates/route.ts
// Vercel Cron target: refreshes market rates daily and syncs the KRW->EUR rate.
// Authenticated with the standard Vercel Cron secret header (Authorization: Bearer CRON_SECRET).
import { NextRequest, NextResponse } from 'next/server';
import { refreshExchangeRates } from '@/lib/exchangeRates';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
    try {
        const secret = process.env.CRON_SECRET;
        if (!secret) {
            return NextResponse.json({ error: 'Cron not configured' }, { status: 503 });
        }

        const auth = request.headers.get('authorization');
        if (auth !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const rates = await refreshExchangeRates();

        return NextResponse.json({ success: true, rates });
    } catch (error) {
        console.error('Error running exchange-rates cron:', error);
        return NextResponse.json({ error: 'Failed to refresh rates' }, { status: 500 });
    }
}