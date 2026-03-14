import { NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/db';
import { cookies } from 'next/headers';

// ✅ Add this GET handler to check if route is working
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Admin verify API is working'
    });
}

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        const isValid = await validateAdmin(password);

        if (isValid) {
            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'authenticated', {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 2 * 60 * 60,
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

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    return NextResponse.json({ success: true });
}