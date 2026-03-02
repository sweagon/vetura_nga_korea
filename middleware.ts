// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Simple protection - you can also use cookies/session
    const isAdminPage = request.nextUrl.pathname.startsWith('/admin');

    // Allow access to admin page (it has its own password)
    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};