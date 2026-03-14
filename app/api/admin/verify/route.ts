import { NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/db';
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
            console.log('❌ No password provided');
            return NextResponse.json(
                { success: false, message: 'Fjalëkalimi kërkohet' },
                { status: 400 }
            );
        }

        // Test database connection first
        try {
            const { sql } = require('@vercel/postgres');
            await sql`SELECT 1`;
            console.log('✅ Database connection successful');
        } catch (dbError) {
            console.error('❌ Database connection failed:', dbError);
            return NextResponse.json(
                { success: false, message: 'Gabim i lidhjes me databazën' },
                { status: 500 }
            );
        }

        const isValid = await validateAdmin(password);
        console.log('🔑 Password validation result:', isValid);

        if (isValid) {
            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'authenticated', {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 2 * 60 * 60,
                path: '/',
            });

            console.log('✅ Login successful, cookie set');
            return NextResponse.json({ success: true });
        }

        console.log('❌ Invalid password');
        return NextResponse.json(
            { success: false, message: 'Fjalëkalimi i gabuar' },
            { status: 401 }
        );

    } catch (error) {
        console.error('🔥 Login error:', error);
        return NextResponse.json(
            { success: false, message: 'Gabim gjatë hyrjes: ' + (error instanceof Error ? error.message : 'unknown') },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    return NextResponse.json({ success: true });
}