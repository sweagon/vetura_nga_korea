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
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Formula Export" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#FF2800" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#FF2800" />
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