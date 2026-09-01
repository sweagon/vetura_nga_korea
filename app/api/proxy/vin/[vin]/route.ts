import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.bestautomarket.com/api';
const TIMEOUT = 8000;
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const NEGATIVE_CACHE_DURATION = 60 * 60 * 1000;

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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ vin: string }> }
) {
    try {
        const { vin } = await params;

        if (!vin || vin.length !== 17 || !/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
            return NextResponse.json(
                { error: 'Invalid VIN provided' },
                { status: 400 }
            );
        }

        const cacheKey = `vin:${vin}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return NextResponse.json(cached.data);
        }

        const url = `${API_BASE_URL}/cars?search_query=${encodeURIComponent(vin)}&per_page=1`;

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

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const car = data.data[0];
            setCache(cacheKey, { data: car, timestamp: Date.now() });
            return NextResponse.json(car, {
                status: 200,
                headers: { 'Cache-Control': 'public, s-maxage=86400' }
            });
        }

        setCache(cacheKey, {
            data: { error: 'Car not found', vin },
            timestamp: Date.now() - CACHE_DURATION + NEGATIVE_CACHE_DURATION
        });

        return NextResponse.json(
            { error: 'Car not found' },
            { status: 404 }
        );

    } catch (error: any) {
        if (error.name === 'AbortError') {
            return NextResponse.json(
                { error: 'Request timeout. Please try again.' },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch car data' },
            { status: 500 }
        );
    }
}
