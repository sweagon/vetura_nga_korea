import { NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        const isValid = await validateAdmin(password);

        if (isValid) {
            const cookieStore = await cookies();

            // Set cookie with proper settings for production
            cookieStore.set('admin_session', 'authenticated', {
                httpOnly: true,
                secure: true, // Always true on Vercel (HTTPS)
                sameSite: 'lax', // Important for cross-origin
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

// Add logout endpoint
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    return NextResponse.json({ success: true });
}