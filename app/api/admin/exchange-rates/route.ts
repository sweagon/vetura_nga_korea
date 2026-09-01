import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRatesFromDb, saveExchangeRatesToDb, syncKrwRateFromRates, validateSessionToken } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimit';

const limiter = rateLimit({ interval: 60 * 1000, max: 20 });

function getClientKey(request: NextRequest): string {
    const fwd = request.headers.get('x-forwarded-for');
    if (fwd) {
        const ip = fwd.split(',')[0].trim();
        if (ip) return ip;
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('admin_token')?.value;

        if (!token || !(await validateSessionToken(token))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rates = await getExchangeRatesFromDb();
        return NextResponse.json({ rates });
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const check = await limiter.check(`admin:exchange-rates:${getClientKey(request)}`);
        if (!check.success) {
            return NextResponse.json({ error: 'Shumë kërkesa. Provo përsëri më vonë.' }, { status: 429 });
        }

        const token = request.cookies.get('admin_token')?.value;

        if (!token || !(await validateSessionToken(token))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { rates } = await request.json();

        if (!rates || !Array.isArray(rates)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        await saveExchangeRatesToDb(rates);

        // Keep pricing conversion in sync with the saved KRW rate
        await syncKrwRateFromRates(rates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving exchange rates:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
