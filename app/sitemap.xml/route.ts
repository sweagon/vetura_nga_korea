import { NextResponse } from 'next/server';
import { fetchCars, fetchFilterData } from '@/lib/api';

export async function GET() {
    const baseUrl = 'https://formula-export.com';

    // Fetch your data
    let cars: any[] = [];
    let brands: string[] = [];

    try {
        const { cars: fetchedCars } = await fetchCars({ limit: 1000 });
        cars = fetchedCars || [];
    } catch (error) {
        console.error('Error fetching cars:', error);
    }

    try {
        const filterData = await fetchFilterData();
        brands = filterData?.makes || [];
    } catch (error) {
        console.error('Error fetching brands:', error);
    }

    // Build URLs array
    const urls = [
        { url: baseUrl, lastmod: new Date(), freq: 'daily', priority: 1.0 },
        { url: `${baseUrl}/cars`, lastmod: new Date(), freq: 'hourly', priority: 0.9 },
        { url: `${baseUrl}/brands`, lastmod: new Date(), freq: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/offers`, lastmod: new Date(), freq: 'daily', priority: 0.8 },
        { url: `${baseUrl}/how-it-works`, lastmod: new Date(), freq: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/contact`, lastmod: new Date(), freq: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/faq`, lastmod: new Date(), freq: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/privacy`, lastmod: new Date(), freq: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/terms`, lastmod: new Date(), freq: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/saved`, lastmod: new Date(), freq: 'monthly', priority: 0.4 },
        { url: `${baseUrl}/profile`, lastmod: new Date(), freq: 'monthly', priority: 0.4 },
        { url: `${baseUrl}/compare`, lastmod: new Date(), freq: 'weekly', priority: 0.5 },
        { url: `${baseUrl}/recently-viewed`, lastmod: new Date(), freq: 'weekly', priority: 0.5 },
        ...cars.map(car => ({
            url: `${baseUrl}/cars/${car.id}`,
            lastmod: new Date(car.updatedAt || car.createdAt || Date.now()),
            freq: 'weekly',
            priority: 0.8
        })),
        ...brands.map(brand => ({
            url: `${baseUrl}/cars?make=${encodeURIComponent(brand)}`,
            lastmod: new Date(),
            freq: 'daily',
            priority: 0.7
        }))
    ];

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(item => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod instanceof Date ? item.lastmod.toISOString() : item.lastmod}</lastmod>
    <changefreq>${item.freq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
    });
}