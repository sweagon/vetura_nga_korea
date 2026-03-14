// app/api/admin/verify/route.ts
import { NextResponse } from 'next/server';
import { validateAdmin, createAdminSession, deleteSession } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Admin verify API is working',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        console.log('🔐 Login attempt received');

        if (!password) {
            return NextResponse.json(
                { success: false, message: 'Fjalëkalimi kërkohet' },
                { status: 400 }
            );
        }

        const isValid = await validateAdmin(password);

        if (isValid) {
            // Create session in database
            const token = await createAdminSession(1);

            // Set cookie with the token
            const cookieStore = await cookies();
            cookieStore.set('admin_token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 2 * 60 * 60, // 2 hours
                path: '/',
            });

            console.log('✅ Login successful, session created');
            return NextResponse.json({
                success: true,
                message: 'Login successful'
            });
        }

        console.log('❌ Invalid password');
        return NextResponse.json(
            { success: false, message: 'Fjalëkalimi i gabuar' },
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
            console.log('✅ Logout successful');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}