import { NextResponse } from 'next/server';
import { getConfig, saveConfig } from '@/lib/configServer';
import { validateConfig } from '@/lib/config';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rateLimit';

const publicLimiter = rateLimit({ interval: 60 * 1000, max: 60 });
const adminLimiter = rateLimit({ interval: 60 * 1000, max: 10 });

export async function GET() {
    try {
        const headersList = await headers();
        const forwardedFor = headersList.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

        const { success } = await publicLimiter.check(ip);

        if (!success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        const config = await getConfig();
        return NextResponse.json(config);
    } catch (error) {
        console.error('Error fetching config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch configuration' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const headersList = await headers();

        // Check for admin token in cookies
        const cookie = headersList.get('cookie') || '';
        const hasAdminToken = cookie.includes('admin_token=');

        console.log('🔑 Session check:', {
            hasAdminToken,
            cookiePreview: cookie.substring(0, 50) + '...'
        });

        if (!hasAdminToken) {
            console.log('❌ Unauthorized: No admin_token cookie found');
            return NextResponse.json(
                { error: 'Unauthorized - Please login again' },
                { status: 401 }
            );
        }

        // Rate limiting
        const forwardedFor = headersList.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
        const { success } = await adminLimiter.check(ip);

        if (!success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        const body = await request.json();

        // Validate the config
        const { valid, errors } = validateConfig(body);
        if (!valid) {
            return NextResponse.json(
                { error: 'Invalid configuration', details: errors },
                { status: 400 }
            );
        }

        // Save to database
        await saveConfig(body);

        console.log('✅ Config saved successfully by authenticated admin');

        return NextResponse.json({
            success: true,
            message: 'Configuration updated successfully'
        });
    } catch (error) {
        console.error('Error saving config:', error);
        return NextResponse.json(
            { error: 'Failed to save configuration' },
            { status: 500 }
        );
    }
}