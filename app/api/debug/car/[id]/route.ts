// app/api/debug/car/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const cleanId = id.replace(/\D/g, '');

    console.log('='.repeat(60));
    console.log('🔍 DEBUG: Testing car fetch');
    console.log('Original ID:', id);
    console.log('Cleaned ID:', cleanId);

    const results = [];

    // Test 1: Direct fetch to external API
    try {
        console.log('\n📡 TEST 1: Direct fetch to external API');
        const externalUrl = `https://autokoreakosova.com/api/cars/${cleanId}`;
        console.log('URL:', externalUrl);

        const start = Date.now();
        const response = await fetch(externalUrl, {
            headers: { 'Content-Type': 'application/json' },
        });
        const time = Date.now() - start;

        let data = null;
        try {
            data = await response.clone().json();
        } catch (e) {
            // Not JSON
        }

        results.push({
            test: 'Direct External API',
            url: externalUrl,
            status: response.status,
            ok: response.ok,
            time: `${time}ms`,
            hasData: !!data,
        });

        console.log(`Status: ${response.status} (${time}ms)`);
    } catch (error: any) {
        console.error('Error:', error.message);
        results.push({
            test: 'Direct External API',
            error: error.message,
        });
    }

    // Test 2: Through proxy (relative URL)
    try {
        console.log('\n📡 TEST 2: Through proxy (relative)');
        const proxyUrl = `/api/proxy/cars/${cleanId}`;
        console.log('URL:', proxyUrl);

        const start = Date.now();
        const response = await fetch(proxyUrl, {
            headers: { 'Content-Type': 'application/json' },
        });
        const time = Date.now() - start;

        let data = null;
        try {
            data = await response.clone().json();
        } catch (e) {
            // Not JSON
        }

        results.push({
            test: 'Proxy (Relative)',
            url: proxyUrl,
            status: response.status,
            ok: response.ok,
            time: `${time}ms`,
            hasData: !!data,
        });

        console.log(`Status: ${response.status} (${time}ms)`);
    } catch (error: any) {
        console.error('Error:', error.message);
        results.push({
            test: 'Proxy (Relative)',
            error: error.message,
        });
    }

    // Test 3: Through proxy (absolute URL)
    try {
        console.log('\n📡 TEST 3: Through proxy (absolute)');
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const proxyUrl = `${baseUrl}/api/proxy/cars/${cleanId}`;
        console.log('URL:', proxyUrl);

        const start = Date.now();
        const response = await fetch(proxyUrl, {
            headers: { 'Content-Type': 'application/json' },
        });
        const time = Date.now() - start;

        let data = null;
        try {
            data = await response.clone().json();
        } catch (e) {
            // Not JSON
        }

        results.push({
            test: 'Proxy (Absolute)',
            url: proxyUrl,
            status: response.status,
            ok: response.ok,
            time: `${time}ms`,
            hasData: !!data,
        });

        console.log(`Status: ${response.status} (${time}ms)`);
    } catch (error: any) {
        console.error('Error:', error.message);
        results.push({
            test: 'Proxy (Absolute)',
            error: error.message,
        });
    }

    console.log('\n📊 Results Summary:');
    console.table(results);
    console.log('='.repeat(60));

    return NextResponse.json({
        id,
        cleanId,
        environment: process.env.NODE_ENV,
        baseUrl: process.env.NEXTAUTH_URL,
        results,
    });
}