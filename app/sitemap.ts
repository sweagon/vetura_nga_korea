// app/sitemap.ts - dynamic XML sitemap (static routes + car detail pages)
import { MetadataRoute } from 'next';

export const revalidate = 86400;

const SITE_URL = process.env.SITE_URL || 'https://veturakoreakosove.com';

// Reuse the app's own cached proxy (same path the client uses) instead of
// hitting the upstream API directly - reliable, cached, and env-aware.
function selfBaseURL(): string {
    if (process.env.NODE_ENV === 'development') return 'http://localhost:3002';
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return SITE_URL;
}

async function fetchCarIds(limit = 500): Promise<string[]> {
    const base = selfBaseURL();
    const ids = new Set<string>();
    for (let page = 1; page <= 5 && ids.size < limit; page++) {
        const fetchPage = async () => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 15000);
            try {
                const res = await fetch(`${base}/api/proxy/cars?per_page=100&page=${page}`, {
                    next: { revalidate: 86400 },
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'User-Agent': 'VeturaNgaKorea/1.0',
                    },
                });
                if (!res.ok) return [];
                const data = await res.json();
                return (data?.data || data?.cars || []) as Array<Record<string, unknown>>;
            } catch (error) {
                console.error('sitemap: error fetching cars page', page, error);
                return [];
            } finally {
                clearTimeout(timer);
            }
        };

        // Upstream can transiently error - retry once before giving up on a page.
        let items = await fetchPage();
        if (items.length === 0) items = await fetchPage();
        if (items.length === 0) break;

        items.forEach((c) => c?.id && ids.add(String(c.id)));
        if (items.length < 100) break;
    }
    return Array.from(ids).slice(0, limit);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const routes: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
        { url: `${SITE_URL}/cars`, changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/recently-viewed`, changeFrequency: 'weekly', priority: 0.4 },
    ];

    try {
        const carIds = await fetchCarIds(300);
        carIds.forEach((id) => {
            routes.push({
                url: `${SITE_URL}/cars/${id}`,
                changeFrequency: 'weekly',
                priority: 0.6,
            });
        });
        console.log(`sitemap: added ${carIds.length} car URLs`);
    } catch (error) {
        console.error('sitemap: failed to fetch cars', error);
    }

    return routes;
}