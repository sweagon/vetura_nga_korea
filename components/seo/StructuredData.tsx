'use client';

import { usePathname } from 'next/navigation';

interface CarData {
    id: number;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    exteriorColor?: string;
    images?: string[];
    description?: string;
    sellerName?: string;
    sellerPhone?: string;
    sellerEmail?: string;
}

interface StructuredDataProps {
    type: 'website' | 'organization' | 'car' | 'breadcrumb' | 'search';
    data?: CarData;
    breadcrumbs?: { name: string; url: string }[];
}

export default function StructuredData({ type, data, breadcrumbs }: StructuredDataProps) {
    const pathname = usePathname();
    const baseUrl = 'https://formula-export.com';
    const fullUrl = `${baseUrl}${pathname}`;

    const getStructuredData = () => {
        switch (type) {
            case 'organization':
                return {
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: 'Formula Export',
                    url: baseUrl,
                    logo: `${baseUrl}/logo.webp`,
                    description: 'Import i makinave nga Korea në Kosovë',
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: 'Prishtinë',
                        addressCountry: 'XK'
                    },
                    contactPoint: {
                        '@type': 'ContactPoint',
                        telephone: '+38345255388',
                        contactType: 'customer service',
                        areaServed: 'XK',
                        availableLanguage: ['Albanian', 'English', 'Serbian']
                    },
                    sameAs: [
                        'https://facebook.com/formula-export',
                        'https://instagram.com/formula-export'
                    ]
                };

            case 'website':
                return {
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: 'Formula Export',
                    url: baseUrl,
                    description: 'Platforma më e madhe për import të makinave nga Korea në Kosovë',
                    potentialAction: {
                        '@type': 'SearchAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: `${baseUrl}/cars?search={search_term_string}`
                        },
                        'query-input': 'required name=search_term_string'
                    }
                };

            case 'car':
                if (!data) return null;
                return {
                    '@context': 'https://schema.org',
                    '@type': 'Car',
                    name: `${data.make} ${data.model} ${data.year}`,
                    description: data.description?.substring(0, 200) || `${data.make} ${data.model} - Viti: ${data.year}, Km: ${data.mileage.toLocaleString()}`,
                    model: data.model,
                    brand: {
                        '@type': 'Brand',
                        name: data.make
                    },
                    vehicleModelDate: data.year,
                    mileageFromOdometer: {
                        '@type': 'QuantitativeValue',
                        value: data.mileage,
                        unitCode: 'KMT'
                    },
                    vehicleTransmission: data.transmission === 'Automatic' ? 'Automatic' : 'Manual',
                    fuelType: data.fuelType,
                    color: data.exteriorColor || 'Unknown',
                    image: data.images?.[0] || '/logo.webp',
                    offers: {
                        '@type': 'Offer',
                        price: data.price,
                        priceCurrency: 'EUR',
                        availability: 'https://schema.org/InStock',
                        url: `${baseUrl}/cars/${data.id}`,
                        seller: {
                            '@type': 'Organization',
                            name: data.sellerName || 'Auto Korea Kosova Import'
                        }
                    }
                };

            case 'breadcrumb':
                if (!breadcrumbs) return null;
                return {
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: breadcrumbs.map((crumb, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: crumb.name,
                        item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
                    }))
                };

            case 'search':
                return {
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    url: baseUrl,
                    potentialAction: {
                        '@type': 'SearchAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: `${baseUrl}/cars?search={search_term_string}`
                        },
                        'query-input': 'required name=search_term_string'
                    }
                };

            default:
                return null;
        }
    };

    const structuredData = getStructuredData();
    if (!structuredData) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}