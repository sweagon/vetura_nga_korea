// app/api/admin/sessions/route.ts
import { NextResponse } from 'next/server';
import { getActiveSessions, validateSessionToken } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        // First verify the requester is authenticated
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isValid = await validateSessionToken(token);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        // Get all active sessions
        const sessions = await getActiveSessions();

        return NextResponse.json({
            success: true,
            sessions: sessions.map(s => ({
                id: s.id,
                created: s.created_at,
                expires: s.expires_at,
                token_preview: s.token.substring(0, 8) + '...'
            }))
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}