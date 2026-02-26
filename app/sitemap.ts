import { MetadataRoute } from 'next';
import { fetchCars } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://formulaexport.com';

    // Static pages with priorities
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
            changeFrequency: 'always' as const,
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
            url: `${baseUrl}/cookies`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/compare`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        },
    ];

    try {
        // Fetch cars for dynamic pages
        const data = await fetchCars({ limit: 1000 }); // Get as many as possible

        // Type assertion for cars
        interface Car {
            id: number;
            make: string;
            model: string;
            year: number;
            price: number;
            createdAt: string;
            images?: string[];
        }

        const cars = data.cars as Car[];

        // Create sitemap entries for each car
        const carPages = cars.map((car: Car) => ({
            url: `${baseUrl}/cars/${car.id}`,
            lastModified: new Date(car.createdAt || Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            // Optional: add images for better SEO
            images: car.images?.slice(0, 5).map((img: string) => ({
                loc: img.split('?')[0], // Remove query parameters
                title: `${car.make} ${car.model} ${car.year}`,
                caption: `${car.make} ${car.model} - ${car.year} - ${car.price}€`,
            })),
        }));

        // Get unique brands - FIXED TYPE ISSUE HERE
        const brandsSet = new Set<string>();
        cars.forEach((car: Car) => {
            if (car.make) brandsSet.add(car.make);
        });
        const brands = Array.from(brandsSet);

        // Create sitemap entries for each brand
        const brandPages = brands.map((brand: string) => ({
            url: `${baseUrl}/cars?make=${encodeURIComponent(brand)}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.6,
        }));

        return [...staticPages, ...carPages, ...brandPages];

    } catch (error) {
        console.error('Error generating sitemap:', error);
        // Return at least static pages if API fails
        return staticPages;
    }
}