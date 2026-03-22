// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.bestautomarket.com/api';
const TIMEOUT = 8000; // 8 seconds (within Vercel's 10s limit)
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const searchParams = request.nextUrl.searchParams;
        const cacheKey = `${path.join('/')}?${searchParams.toString()}`;

        // Check cache first - return immediately if fresh
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('📦 Cache HIT:', cacheKey);
            return NextResponse.json(cached.data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
                    'X-Cache': 'HIT'
                }
            });
        }

        if (!path || path.length === 0) {
            return NextResponse.json({ error: 'No path provided' }, { status: 404 });
        }

        const pathString = path.join('/');
        const url = `${API_BASE_URL}/${pathString}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

        console.log('🔁 Proxying to:', url);

        // Use AbortController with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'VeturaNgaKorea/1.0',
            },
            signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        const text = await response.text();

        // Check if response is HTML (error page)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.error(`⚠️ API returned HTML for ${url}`);
            return NextResponse.json(
                { error: 'API returned HTML instead of JSON', data: [], cars: [] },
                { status: 404 }
            );
        }

        // Parse JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('❌ Failed to parse JSON:', text.substring(0, 200));
            return NextResponse.json(
                { error: 'Invalid JSON response from API', data: [], cars: [] },
                { status: 500 }
            );
        }

        // Ensure data has expected structure
        if (!data.data && !data.cars) {
            data = { data: data.data || data.cars || [], ...data };
        }

        // Store in cache
        cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
                'X-Cache': 'MISS'
            }
        });

    } catch (error: any) {
        console.error('Proxy error:', error);

        if (error.name === 'AbortError') {
            return NextResponse.json(
                { error: 'Request timeout. Please try again.', data: [], cars: [] },
                { status: 504 }
            );
        }

        // Return empty data structure to prevent frontend errors
        return NextResponse.json(
            { error: 'Failed to fetch data', data: [], cars: [] },
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