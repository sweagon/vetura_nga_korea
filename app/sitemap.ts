// app/sitemap.ts
import { fetchCars, fetchFilterData } from '@/lib/api';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://formula-export.com';

    // Fetch all cars for dynamic URLs with error handling
    let cars: any[] = [];
    try {
        const { cars: fetchedCars } = await fetchCars({ limit: 1000 });
        cars = fetchedCars || [];
    } catch (error) {
        console.error('Error fetching cars for sitemap:', error);
    }

    // Fetch all brands for brand pages
    let brands: string[] = [];
    try {
        const filterData = await fetchFilterData();
        brands = filterData?.makes || [];
    } catch (error) {
        console.error('Error fetching brands for sitemap:', error);
    }

    // Static pages with updated priorities
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/cars`,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/brands`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/offers`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/how-it-works`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/saved`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.4,
        },
        {
            url: `${baseUrl}/profile`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.4,
        },
        {
            url: `${baseUrl}/compare`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/recently-viewed`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        },
    ];

    // Dynamic car detail pages
    const carUrls = cars.map((car) => ({
        url: `${baseUrl}/cars/${car.id}`,
        lastModified: new Date(car.updatedAt || car.createdAt || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Brand pages (filtered by make)
    const brandUrls = brands.map((brand: string) => ({
        url: `${baseUrl}/cars?make=${encodeURIComponent(brand)}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    // Popular model combinations (optional - uncomment to enable)
    // You can fetch these dynamically from your most viewed cars
    const popularModels = [
        { make: 'BMW', model: 'X5' },
        { make: 'BMW', model: '3 Series' },
        { make: 'Audi', model: 'A6' },
        { make: 'Audi', model: 'Q5' },
        { make: 'Mercedes-Benz', model: 'E-Class' },
        { make: 'Mercedes-Benz', model: 'GLC' },
        { make: 'Volkswagen', model: 'Golf' },
        { make: 'Volkswagen', model: 'Passat' },
    ];

    const modelUrls = popularModels.map(({ make, model }) => ({
        url: `${baseUrl}/cars?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Combine all URLs
    return [...staticPages, ...carUrls, ...brandUrls, ...modelUrls];
}