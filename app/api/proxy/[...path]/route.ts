// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://autokoreakosova.com/api';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        // IMPORTANT: Await the params in Next.js 15+
        const { path } = await params;

        // If no path provided, return 404
        if (!path || path.length === 0) {
            return NextResponse.json(
                { error: 'No path provided' },
                { status: 404 }
            );
        }

        const pathString = path.join('/');
        const searchParams = request.nextUrl.searchParams;

        // Build the full URL to the external API
        const url = `${API_BASE_URL}/${pathString}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

        console.log('Proxying to:', url); // Useful for debugging

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 60, // Cache for 60 seconds
            },
        });

        const data = await response.json();

        // Return the response
        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data', cars: [], pagination: { page: 1, totalPages: 1, total: 0 } },
            { status: 500 }
        );
    }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        },
    });
}