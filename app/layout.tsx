import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/ui/CookieBanner';
import ScrollToTop from '@/components/ui/ScrollToTop';
import Providers from './providers';
import MetaTags from '@/components/seo/MetaTags';
import StructuredData from '@/components/seo/StructuredData';

const inter = Inter({ subsets: ['latin'] });

// app/layout.tsx or app/metadata.ts
export const metadata = {
  metadataBase: new URL('https://formula-export.com'),
  title: {
    default: 'Formula Export - Makina nga Evropa',
    template: '%s | Formula Export'
  },
  description: 'Blej makina cilësore nga tregjet evropiane. BMW, Audi, Mercedes-Benz dhe shumë të tjera.',
  keywords: ['makina', 'export', 'ferrari', 'vetura', 'BMW', 'Audi', 'Mercedes'],
  authors: [{ name: 'Formula Export' }],
  openGraph: {
    title: 'Formula Export',
    description: 'Makina cilësore nga Evropa',
    url: 'https://formula-export.com',
    siteName: 'Formula Export',
    images: [
      {
        url: 'https://formula-export.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'sq_AL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formula Export',
    description: 'Makina cilësore nga Evropa',
    images: ['https://formula-export.com/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq">
      <head>
        <MetaTags
          title="Formula Export - Makina nga Korea në Kosovë"
          description="Importoni makina cilësore nga Korea me çmime konkurruese. Formula Export ju sjell makinat më të mira direkt në Kosovë."
          image="/og-image.jpg"
        />
        <StructuredData type="organization" />
        <StructuredData type="website" />
        <StructuredData type="search" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon - Standard */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />

        {/* Favicon - Apple */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />

        {/* Favicon - Android */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="384x384" href="/icons/icon-384x384.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#FF2800" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Theme Color */}
        <meta name="theme-color" content="#FF2800" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Formula Export" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className} cz-shortcut-listen="true">
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CookieBanner />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}