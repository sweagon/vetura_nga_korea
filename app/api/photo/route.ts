import { NextRequest, NextResponse } from 'next/server';

// GET /api/photo?url=<https://ci.encar.com/...jpg>
// Server-side image proxy used by the client-side PDF generator. The Encar CDN
// does not send CORS headers, so a browser cannot fetch the bytes directly; this
// route fetches them server-side and re-serves them on our origin with an open
// Access-Control-Allow-Origin so canvas/PDF code can read the pixels.
const ALLOWED_HOSTS = ['ci.encar.com'];

export async function GET(request: NextRequest) {
    const raw = request.nextUrl.searchParams.get('url');
    if (!raw) return new NextResponse('missing url', { status: 400 });

    let target: URL;
    try {
        target = new URL(raw);
    } catch {
        return new NextResponse('invalid url', { status: 400 });
    }

    const allowed = ALLOWED_HOSTS.some(
        host => target.hostname === host || target.hostname.endsWith(`.${host}`)
    );
    if (target.protocol !== 'https:' || !allowed) {
        return new NextResponse('forbidden host', { status: 403 });
    }

    try {
        const upstream = await fetch(target.toString(), {
            headers: { 'User-Agent': 'VeturaNgaKorea/1.0' },
        });
        if (!upstream.ok) {
            return new NextResponse(`upstream ${upstream.status}`, { status: upstream.status });
        }

        const body = await upstream.arrayBuffer();
        const contentType = upstream.headers.get('content-type') || 'image/jpeg';

        return new NextResponse(Buffer.from(body), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch {
        return new NextResponse('upstream error', { status: 502 });
    }
}