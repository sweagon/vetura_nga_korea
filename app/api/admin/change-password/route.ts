// app/api/admin/change-password/route.ts
import { NextResponse } from 'next/server';
import { validateSessionToken, changeAdminPassword } from '@/lib/db';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rateLimit';

const MIN_LENGTH = 10;
const limiter = rateLimit({ interval: 60 * 1000, max: 10 });

function getClientKey(request: Request): string {
    const fwd = request.headers.get('x-forwarded-for');
    if (fwd) {
        const ip = fwd.split(',')[0].trim();
        if (ip) return ip;
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
    try {
        const check = await limiter.check(`admin:change-password:${getClientKey(request)}`);
        if (!check.success) {
            return NextResponse.json({ error: 'Shumë kërkesa. Provo përsëri më vonë.' }, { status: 429 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !(await validateSessionToken(token))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Fjalëkalimet kërkohen' }, { status: 400 });
        }

        if (newPassword.length < MIN_LENGTH) {
            return NextResponse.json(
                { error: `Fjalëkalimi duhet të ketë të paktën ${MIN_LENGTH} karaktere` },
                { status: 400 }
            );
        }

        const result = await changeAdminPassword(currentPassword, newPassword);
        if (!result.ok) {
            if (result.error === 'invalid_current') {
                return NextResponse.json({ error: 'Fjalëkalimi aktual është i gabuar' }, { status: 403 });
            }
            return NextResponse.json({ error: 'Gabim gjatë ndryshimit të fjalëkalimit' }, { status: 500 });
        }

        // Invalidate the current session cookie so the user logs in again
        cookieStore.delete('admin_token');

        return NextResponse.json({ success: true, message: 'Fjalëkalimi u ndryshua me sukses' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
