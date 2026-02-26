// app/sitemap.ts
import { fetchCars } from '@/lib/api';

export default async function sitemap() {
    const baseUrl = 'https://formula-export.com'

    // Fetch only valid, in-stock cars
    const { cars } = await fetchCars({
        limit: 500,  // Adjust based on your total car count
        inStock: true // Add this filter if your API supports it
    });

    const carUrls = cars.map((car) => ({
        url: `${baseUrl}/cars/${car.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/cars`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/brands`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/how-it-works`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ]
}