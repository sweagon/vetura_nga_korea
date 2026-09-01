import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('admin_token')?.value;

        if (pathname === '/admin' || pathname === '/admin/') {
            return NextResponse.next();
        }

        if (!token) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
