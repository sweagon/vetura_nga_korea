// app/api/admin/check-session/route.ts
import { NextResponse } from 'next/server';
import { validateSessionToken } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json({
                authenticated: false,
                message: 'No session token found'
            });
        }

        const isValid = await validateSessionToken(token);

        return NextResponse.json({
            authenticated: isValid,
            message: isValid ? 'Session valid' : 'Session expired or invalid'
        });
    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json({
            authenticated: false,
            message: 'Error checking session'
        });
    }
}