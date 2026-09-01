import { NextResponse } from 'next/server';
import { getConfig, saveConfig } from '@/lib/configServer';
import { validateConfig } from '@/lib/config';
import { validateSessionToken } from '@/lib/db';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rateLimit';

const publicLimiter = rateLimit({ interval: 60 * 1000, max: 60 });
const adminLimiter = rateLimit({ interval: 60 * 1000, max: 10 });

export async function GET() {
    try {
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
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - Please login again' },
                { status: 401 }
            );
        }

        const isValid = await validateSessionToken(token);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid or expired session' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const { valid, errors } = validateConfig(body);
        if (!valid) {
            return NextResponse.json(
                { error: 'Invalid configuration', details: errors },
                { status: 400 }
            );
        }

        await saveConfig(body);

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
