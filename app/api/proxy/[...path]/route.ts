// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.bestautomarket.com/api';

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const searchParams = request.nextUrl.searchParams;
        const cacheKey = `${path.join('/')}?${searchParams.toString()}`;

        // Check cache first
        const cached = cache[cacheKey];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('📦 Proxy cache hit for:', cacheKey);
            return NextResponse.json(cached.data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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

        // Increase timeout to 45 seconds for slow API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'VeturaNgaKorea/1.0',
            },
            signal: controller.signal,
            cache: 'force-cache' // Use fetch cache
        }).finally(() => clearTimeout(timeoutId));

        const text = await response.text();

        // Check if response is HTML (error page)
        if (text.trim().startsWith('<!DOCTYPE')) {
            console.error(`⚠️ API returned HTML for ${url}`);
            return NextResponse.json(
                { error: 'API returned HTML instead of JSON' },
                { status: 404 }
            );
        }

        // Parse JSON
        const data = JSON.parse(text);

        // Store in cache
        cache[cacheKey] = {
            data,
            timestamp: Date.now()
        };

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                'X-Cache': 'MISS'
            }
        });

    } catch (error: any) {
        console.error('Proxy error:', error);

        if (error.name === 'AbortError') {
            return NextResponse.json(
                { error: 'Request timeout - API took too long to respond' },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch data' },
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