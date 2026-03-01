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

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            next: {
                revalidate: 60 // Cache for 60 seconds
            }
        });

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
                {
                    status: 404,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Cache-Control': 'no-cache',
                    }
                }
            );
        }

        // Try to parse JSON
        try {
            const data = JSON.parse(text);

            // Handle empty/not found responses
            if (!data || (Array.isArray(data) && data.length === 0)) {
                return NextResponse.json(
                    { error: 'Car not found' },
                    {
                        status: 404,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET, OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type',
                            'Cache-Control': 'no-cache',
                        }
                    }
                );
            }

            return NextResponse.json(data, {
                status: response.status,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
                },
            });
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            return NextResponse.json(
                {
                    error: 'Invalid JSON response',
                    status: response.status,
                    contentType
                },
                {
                    status: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Cache-Control': 'no-cache',
                    }
                }
            );
        }

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Cache-Control': 'no-cache',
                }
            }
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
            'Access-Control-Max-Age': '86400',
        },
    });
}