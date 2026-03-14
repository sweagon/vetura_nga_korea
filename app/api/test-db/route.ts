import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        // Test basic connection
        const result = await sql`SELECT 1 as connected`;

        // Try to read admin table
        const admin = await sql`SELECT id FROM admin WHERE id = 1`;

        return NextResponse.json({
            connected: true,
            admin_exists: admin.rows.length > 0,
            message: 'Database connection successful'
        });
    } catch (error) {
        console.error('Database test failed:', error);
        return NextResponse.json({
            connected: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}