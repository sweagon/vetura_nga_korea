// app/api/proxy/cars/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/proxy'  // Use proxy in production
    : process.env.NEXT_PUBLIC_API_URL || 'https://autokoreakosova.com/api';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const path = searchParams.get('path') || '';

        // Remove the path param from the query string
        searchParams.delete('path');

        const url = `${API_BASE_URL}${path}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                // Add any API keys here
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const searchParams = request.nextUrl.searchParams;
        const path = searchParams.get('path') || '';

        const url = `${API_BASE_URL}${path}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to post data' },
            { status: 500 }
        );
    }
}