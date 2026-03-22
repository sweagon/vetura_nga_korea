// app/api/proxy/vin/[vin]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.bestautomarket.com/api';
const TIMEOUT = 8000;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for VIN lookups

const cache = new Map<string, { data: any; timestamp: number }>();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ vin: string }> }
) {
    try {
        const { vin } = await params;

        if (!vin || vin.length < 10) {
            return NextResponse.json(
                { error: 'Invalid VIN provided' },
                { status: 400 }
            );
        }

        const cacheKey = `vin:${vin}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('📦 VIN cache HIT:', vin);
            return NextResponse.json(cached.data);
        }

        const url = `${API_BASE_URL}/cars?search_query=${encodeURIComponent(vin)}&per_page=1`;

        console.log('🔍 Looking up VIN:', vin);

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

        // If we found a car, cache it
        if (data.data && data.data.length > 0) {
            const car = data.data[0];
            cache.set(cacheKey, {
                data: car,
                timestamp: Date.now()
            });
            return NextResponse.json(car, {
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=86400', // 24 hours
                }
            });
        }

        // No car found - cache negative result for shorter time
        cache.set(cacheKey, {
            data: { error: 'Car not found', vin },
            timestamp: Date.now() - CACHE_DURATION + (60 * 60 * 1000) // Cache for 1 hour
        });

        return NextResponse.json(
            { error: 'Car not found' },
            { status: 404 }
        );

    } catch (error: any) {
        console.error('VIN lookup error:', error);

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