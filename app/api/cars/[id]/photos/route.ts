import { NextRequest, NextResponse } from 'next/server';
import { probeCarPhotos } from '@/lib/encarPhotos';

// GET /api/cars/{id}/photos
// Returns the list of existing photo URLs for a car by probing the Encar CDN.
// Results are cached in-memory for 10 minutes in probeCarPhotos.
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id || !/^\d+$/.test(id)) {
            return NextResponse.json({ photos: [] }, { status: 400 });
        }

        const thumb = request.nextUrl.searchParams.get('thumb') || undefined;
        const force = request.nextUrl.searchParams.get('force') === '1';

        const photos = await probeCarPhotos(id, { force, includeThumb: thumb || undefined });

        return NextResponse.json(
            { id, photos, count: photos.length },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
                },
            }
        );
    } catch {
        return NextResponse.json({ photos: [] }, { status: 500 });
    }
}