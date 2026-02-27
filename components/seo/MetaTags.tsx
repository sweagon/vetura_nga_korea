// components/seo/MetaTags.tsx
'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface MetaTagsProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product' | 'profile';
    publishedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
    noIndex?: boolean;
    noFollow?: boolean;
    canonical?: string;
}

export default function MetaTags({
    title,
    description,
    keywords = 'makina, import, korea, kosovë, vetura, audi, bmw, mercedes, makina ne kosove, import makina',
    image = '/og-image.jpg',
    url,
    type = 'website',
    publishedTime,
    author = 'Formula Export',
    section,
    tags = [],
    noIndex = false,
    noFollow = false,
    canonical,
}: MetaTagsProps) {
    const pathname = usePathname();
    const baseUrl = 'https://formula-export.com';
    const fullUrl = canonical || url || `${baseUrl}${pathname}`;
    const fullTitle = title.includes('Formula Export') ? title : `${title} | Formula Export`;
    const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

    // Generate JSON-LD structured data based on page type
    const getStructuredData = () => {
        const baseData = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: fullTitle,
            description: description,
            url: fullUrl,
            publisher: {
                '@type': 'Organization',
                name: 'Formula Export',
                logo: {
                    '@type': 'ImageObject',
                    url: `${baseUrl}/logo.webp`
                }
            }
        };

        if (type === 'product') {
            return {
                ...baseData,
                '@type': 'Product',
                offers: {
                    '@type': 'AggregateOffer',
                    priceCurrency: 'EUR',
                    availability: 'https://schema.org/InStock'
                }
            };
        }

        if (type === 'article') {
            return {
                ...baseData,
                '@type': 'Article',
                author: {
                    '@type': 'Person',
                    name: author
                },
                datePublished: publishedTime,
                articleSection: section,
                keywords: tags.join(', ')
            };
        }

        return baseData;
    };

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="language" content="Albanian" />
            <meta name="revisit-after" content="7 days" />
            <meta name="robots" content={`${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />

            {/* Alternate languages */}
            <link rel="alternate" hrefLang="sq" href={fullUrl} />
            <link rel="alternate" hrefLang="x-default" href={fullUrl} />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="Formula Export" />
            <meta property="og:locale" content="sq_AL" />
            <meta property="og:country-name" content="Kosovo" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@formulaexport" />
            <meta name="twitter:creator" content="@formulaexport" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />

            {/* Article specific */}
            {type === 'article' && publishedTime && (
                <>
                    <meta property="article:published_time" content={publishedTime} />
                    <meta property="article:author" content={author} />
                    {section && <meta property="article:section" content={section} />}
                    {tags.map(tag => (
                        <meta key={tag} property="article:tag" content={tag} />
                    ))}
                </>
            )}

            {/* Product specific */}
            {type === 'product' && (
                <>
                    <meta property="product:availability" content="in stock" />
                    <meta property="product:condition" content="new" />
                    <meta property="product:price:amount" content="0" />
                    <meta property="product:price:currency" content="EUR" />
                </>
            )}

            {/* Mobile Optimization */}
            <meta name="format-detection" content="telephone=no" />
            <meta name="theme-color" content="#FF2800" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="Formula Export" />

            {/* Favicon */}
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />

            {/* Microsoft Tiles */}
            <meta name="msapplication-TileColor" content="#FF2800" />
            <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(getStructuredData())
                }}
            />
        </Head>
    );
}