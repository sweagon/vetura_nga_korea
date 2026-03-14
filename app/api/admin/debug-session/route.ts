import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { validateSessionToken } from '@/lib/db';

export async function GET() {
    try {
        const headersList = await headers();
        const cookie = headersList.get('cookie') || '';

        // Extract token
        const tokenMatch = cookie.match(/admin_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        let isValid = false;
        if (token) {
            isValid = await validateSessionToken(token);
        }

        return NextResponse.json({
            authenticated: isValid,
            hasCookie: !!token,
            cookiePresent: !!cookie,
            tokenPreview: token ? token.substring(0, 10) + '...' : null,
            headers: {
                cookie: cookie ? 'Present' : 'Missing'
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
    }
}