import { NextRequest, NextResponse } from 'next/server';
import { getNavigationCache, setNavigationCache } from '@/lib/dbNavigation';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.bestautomarket.com/api';
const TIMEOUT = 8000;
const CACHE_DURATION = 10 * 60 * 1000;

const cache = new Map<string, { data: any; timestamp: number }>();

const MAX_CACHE_ENTRIES = 200;

function setCache(key: string, value: { data: any; timestamp: number }) {
    if (cache.size >= MAX_CACHE_ENTRIES) {
        const now = Date.now();
        for (const [k, v] of cache) {
            if (now - v.timestamp > CACHE_DURATION) cache.delete(k);
        }
        if (cache.size >= MAX_CACHE_ENTRIES) cache.clear();
    }
    cache.set(key, value);
}

const NAV_CACHE_PATHS = ['manufacturers', 'models', 'generations'];

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;

        if (!path || path.length === 0) {
            return NextResponse.json({ error: 'No path provided' }, { status: 404 });
        }

        const searchParams = request.nextUrl.searchParams;
        const cacheKey = `${path.join('/')}?${searchParams.toString()}`;
        const isNavPath = NAV_CACHE_PATHS.includes(path[0].toLowerCase());

        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return NextResponse.json(cached.data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
                    'X-Cache': 'HIT'
                }
            });
        }

        // For navigation data (manufacturers/models/generations), fall back to DB cache
        if (isNavPath) {
            const dbCached = await getNavigationCache<any>(cacheKey);
            if (dbCached) {
                setCache(cacheKey, { data: dbCached, timestamp: Date.now() });
                return NextResponse.json(dbCached, {
                    headers: {
                        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
                        'X-Cache': 'HIT-DB'
                    }
                });
            }
        }

        const pathString = path.join('/');
        const url = `${API_BASE_URL}/${pathString}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

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

        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            return NextResponse.json(
                { error: 'API returned HTML instead of JSON', data: [], cars: [] },
                { status: 404 }
            );
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON response from API', data: [], cars: [] },
                { status: 500 }
            );
        }

        if (!data.data && !data.cars) {
            data = { data: data.data || data.cars || [], ...data };
        }

        setCache(cacheKey, { data, timestamp: Date.now() });
        if (isNavPath) {
            await setNavigationCache(cacheKey, data);
        }

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
                'X-Cache': 'MISS'
            }
        });

    } catch (error: any) {
        if (error.name === 'AbortError') {
            return NextResponse.json(
                { error: 'Request timeout. Please try again.', data: [], cars: [] },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch data', data: [], cars: [] },
            { status: 500 }
        );
    }
}
