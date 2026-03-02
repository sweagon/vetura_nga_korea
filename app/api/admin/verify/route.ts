// app/api/admin/verify/route.ts
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import crypto from 'crypto';

// Get password from environment variable (never in code!)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Rate limiting store
const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    max: 5 // max 5 requests per minute
});

export async function POST(request: Request) {
    try {
        // Get IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Check rate limit
        const { success, remaining, resetTime } = await limiter.check(ip);

        if (!success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '5',
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': resetTime.toString(),
                    }
                }
            );
        }

        const { password } = await request.json();

        // Validate input
        if (!password || typeof password !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request' },
                { status: 400 }
            );
        }

        // Check if admin password is set
        if (!ADMIN_PASSWORD) {
            console.error('ADMIN_PASSWORD environment variable is not set');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Use timing-safe comparison to prevent timing attacks
        const isValid = await safeCompare(password, ADMIN_PASSWORD);

        if (isValid) {
            // Log successful login (optional)
            console.log(`Admin login successful from IP: ${ip}`);

            return NextResponse.json({
                success: true,
                message: 'Authenticated successfully'
            });
        }

        // Log failed attempt
        console.warn(`Failed admin login attempt from IP: ${ip}`);

        return NextResponse.json(
            { error: 'Invalid password' },
            { status: 401 }
        );

    } catch (error) {
        console.error('Admin verification error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}

// Timing-safe comparison function for Node.js
async function safeCompare(a: string, b: string): Promise<boolean> {
    try {
        // Use Node.js crypto timingSafeEqual
        const aBuffer = Buffer.from(a);
        const bBuffer = Buffer.from(b);

        if (aBuffer.length !== bBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(aBuffer, bBuffer);
    } catch (error) {
        console.error('Error in safe comparison:', error);
        return false;
    }
}