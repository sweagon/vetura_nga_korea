// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Change this line:
// export function middleware(request: NextRequest) {

// To this:
export function proxy(request: NextRequest) {
    const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};