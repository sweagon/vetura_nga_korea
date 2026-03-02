import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.bestautomarket.com/api';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;

        if (!path || path.length === 0) {
            return NextResponse.json(
                { error: 'No path provided' },
                { status: 404 }
            );
        }

        const pathString = path.join('/');
        const searchParams = request.nextUrl.searchParams;
        const url = `${API_BASE_URL}/${pathString}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

        console.log('🔁 Proxying to:', url);

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'VeturaNgaKorea/1.0', // Add user agent
            },
            signal: controller.signal,
            cache: 'no-store' // Don't cache in proxy
        }).finally(() => clearTimeout(timeoutId));

        const contentType = response.headers.get('content-type');
        const text = await response.text();

        // Check if response is HTML (error page)
        if (text.trim().startsWith('<!DOCTYPE')) {
            console.error(`⚠️ API returned HTML for ${url}`);
            return NextResponse.json(
                {
                    error: 'API returned HTML instead of JSON',
                    status: response.status,
                    url
                },
                { status: 404 }
            );
        }

        // Try to parse JSON
        try {
            const data = JSON.parse(text);
            return NextResponse.json(data, {
                status: response.status
            });
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            return NextResponse.json(
                {
                    error: 'Invalid JSON response',
                    status: response.status,
                    contentType,
                    preview: text.substring(0, 200)
                },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Proxy error:', error);

        // Handle timeout specifically
        if (error.name === 'AbortError') {
            return NextResponse.json(
                { error: 'Request timeout - API took too long to respond' },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch data', details: error.message },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}