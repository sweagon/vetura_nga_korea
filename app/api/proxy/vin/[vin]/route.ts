// app/api/proxy/vin/[vin]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.bestautomarket.com/api';

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

        // Use search_query parameter to find by VIN
        const url = `${API_BASE_URL}/cars?search_query=${encodeURIComponent(vin)}&per_page=1`;

        console.log('🔍 Looking up VIN:', vin);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'VeturaNgaKorea/1.0',
            },
        });

        const data = await response.json();

        // If we found a car, return it directly
        if (data.data && data.data.length > 0) {
            return NextResponse.json(data.data[0], {
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
                }
            });
        }

        // No car found
        return NextResponse.json(
            { error: 'Car not found' },
            { status: 404 }
        );

    } catch (error: any) {
        console.error('VIN lookup error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch car data' },
            { status: 500 }
        );
    }
}