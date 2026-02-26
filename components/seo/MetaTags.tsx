'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface MetaTagsProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    publishedTime?: string;
    author?: string;
    noIndex?: boolean;
}

export default function MetaTags({
    title,
    description,
    keywords = 'makina, import, korea, kosovë, vetura, audi, bmw, mercedes, makina ne kosove, import makinsah',
    image = '/logo.jpg',
    url,
    type = 'website',
    publishedTime,
    author = 'Formula Export',
    noIndex = false,
}: MetaTagsProps) {
    const pathname = usePathname();
    const fullUrl = url || `https://formulaexport.com${pathname}`;
    const fullTitle = title.includes('Formula Export') ? title : `${title} | Formula Export`;

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
            <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`https://formulaexport.com${image}`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="Formula Export" />
            <meta property="og:locale" content="sq_AL" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`https://formulaexport.com${image}`} />
            <meta name="twitter:site" content="@FormulaExport" />
            <meta name="twitter:creator" content="@FormulaExport" />

            {/* Article specific */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}

            {/* Product specific */}
            {type === 'product' && (
                <meta property="product:availability" content="in stock" />
            )}

            {/* Mobile Optimization */}
            <meta name="format-detection" content="telephone=no" />
            <meta name="theme-color" content="#FF2800" />

            {/* Favicon */}
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

            {/* Manifest for PWA */}
            <link rel="manifest" href="/manifest.json" />
        </Head>
    );
}