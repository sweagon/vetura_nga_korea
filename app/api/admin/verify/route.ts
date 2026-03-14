import { NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        const isValid = await validateAdmin(password);

        if (isValid) {
            // Create session (simple cookie)
            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 2 * 60 * 60, // 2 hours
                path: '/',
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { success: false, message: 'Fjalëkalimi i gabuar' },
            { status: 401 }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: 'Gabim gjatë hyrjes' },
            { status: 500 }
        );
    }
}