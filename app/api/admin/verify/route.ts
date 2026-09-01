// app/api/admin/verify/route.ts
import { NextResponse } from 'next/server';
import {
    validateAdmin, createAdminSession, deleteSession,
    getLoginAttemptStatus, registerLoginFailure, clearLoginFailures,
} from '@/lib/db';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rateLimit';

const MAX_ATTEMPTS = 5;
const limiter = rateLimit({ interval: 60 * 1000, max: 30 });

function getClientKey(request: Request): string {
    const fwd = request.headers.get('x-forwarded-for');
    if (fwd) {
        const ip = fwd.split(',')[0].trim();
        if (ip) return `ip:${ip}`;
    }
    const real = request.headers.get('x-real-ip');
    if (real) return `ip:${real}`;
    return `ip:unknown`;
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Admin verify API is working',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: Request) {
    try {
        const key = getClientKey(request);

        const check = await limiter.check(`admin:verify:${key}`);
        if (!check.success) {
            return NextResponse.json(
                { success: false, message: 'Shumë kërkesa. Provo përsëri më vonë.', locked: true },
                { status: 429 }
            );
        }

        const { password } = await request.json();

        if (!password) {
            return NextResponse.json(
                { success: false, message: 'Fjalëkalimi kërkohet' },
                { status: 400 }
            );
        }

        const status = await getLoginAttemptStatus(key);

        // Enforce lockout server-side (not just client-side)
        if (status.locked) {
            const minutesLeft = status.minutesLeft ?? 15;
            return NextResponse.json(
                { success: false, message: `Shumë përpjekje. Provo përsëri pas ${minutesLeft} minutash.`, locked: true },
                { status: 429 }
            );
        }

        const isValid = await validateAdmin(password);

        if (isValid) {
            await clearLoginFailures(key);
            // Create session in database
            const token = await createAdminSession(1);

            // Set cookie with the token
            const cookieStore = await cookies();
            cookieStore.set('admin_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 2 * 60 * 60, // 2 hours
                path: '/',
            });

            return NextResponse.json({
                success: true,
                message: 'Login successful'
            });
        }

        const after = await registerLoginFailure(key);
        const remaining = after.remainingAttempts;
        if (after.locked || remaining <= 0) {
            const minutesLeft = after.minutesLeft ?? 15;
            return NextResponse.json(
                { success: false, message: `Shumë përpjekje të dështuara. Llogaria është bllokuar për ${minutesLeft} minuta.`, locked: true },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { success: false, message: `Fjalëkalimi i gabuar. ${remaining} përpjekje të mbetura.` },
            { status: 401 }
        );

    } catch (error) {
        console.error('🔥 Login error:', error);
        return NextResponse.json(
            { success: false, message: 'Gabim gjatë hyrjes' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (token) {
            await deleteSession(token);
            cookieStore.delete('admin_token');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}