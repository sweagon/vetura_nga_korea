// app/api/admin/exchange-rates/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateSessionToken } from '@/lib/db';
import { refreshExchangeRates } from '@/lib/exchangeRates';
import { rateLimit } from '@/lib/rateLimit';

const limiter = rateLimit({ interval: 60 * 1000, max: 5 });

function getClientKey(request: NextRequest): string {
    const fwd = request.headers.get('x-forwarded-for');
    if (fwd) {
        const ip = fwd.split(',')[0].trim();
        if (ip) return ip;
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
    try {
        const check = await limiter.check(`admin:exchange-rates-refresh:${getClientKey(request)}`);
        if (!check.success) {
            return NextResponse.json({ error: 'Shumë kërkesa. Provo përsëri më vonë.' }, { status: 429 });
        }

        // Verify session - FIX: Use 'admin_token'
        const token = request.cookies.get('admin_token')?.value;

        if (!token || !(await validateSessionToken(token))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch latest exchange rates, save them, and keep the KRW rate in sync
        const rates = await refreshExchangeRates();

        return NextResponse.json({ success: true, rates });
    } catch (error) {
        console.error('Error refreshing exchange rates:', error);
        return NextResponse.json({ error: 'Failed to refresh rates' }, { status: 500 });
    }
}