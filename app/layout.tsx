// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/ui/CookieBanner';
import ScrollToTop from '@/components/ui/ScrollToTop';
import Providers from './providers';
import StructuredData from '@/components/seo/StructuredData';
import PageTransition from '@/components/ui/PageTransition';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://formula-export.com'),
  title: {
    default: 'Formula Export - Makina nga Korea në Kosovë',
    template: '%s | Formula Export'
  },
  description: 'Importoni makina cilësore nga Korea me çmime konkurruese. BMW, Audi, Mercedes-Benz dhe makina të tjera direkt në Kosovë.',
  keywords: ['makina', 'import', 'korea', 'kosovë', 'vetura', 'audi', 'bmw', 'mercedes', 'makina ne kosove', 'import makina'],
  authors: [{ name: 'Formula Export', url: 'https://formula-export.com' }],
  creator: 'Formula Export',
  publisher: 'Formula Export',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    title: 'Formula Export - Import Makina nga Korea',
    description: 'Platforma më e madhe për import të makinave nga Korea në Kosovë',
    url: 'https://formula-export.com',
    siteName: 'Formula Export',
    images: [
      {
        url: 'https://formula-export.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Formula Export - Makina nga Korea',
      },
    ],
    locale: 'sq_AL',
    type: 'website',
    countryName: 'Kosovo',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Formula Export - Import Makina nga Korea',
    description: 'Platforma më e madhe për import të makinave nga Korea në Kosovë',
    images: ['https://formula-export.com/twitter-image.jpg'],
    site: '@formulaexport',
    creator: '@formulaexport',
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
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
    yandex: 'YOUR_YANDEX_CODE',
    other: {
      'msvalidate.01': 'YOUR_BING_CODE',
      'facebook-domain-verification': 'YOUR_FACEBOOK_CODE',
    },
  },

  alternates: {
    canonical: 'https://formula-export.com',
    languages: {
      'sq-AL': 'https://formula-export.com',
    },
  },

  category: 'automotive',

  other: {
    'p:domain_verify': 'YOUR_PINTEREST_CODE',
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
      </head>
      <body className={inter.className}>
        <StructuredData type="organization" />
        <StructuredData type="website" />
        <StructuredData type="search" />

        <Providers>
          <Header />
          <main className="min-h-screen">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
          <CookieBanner />
          <ScrollToTop />
        </Providers>

        {/* Google Analytics */}
        <GoogleAnalytics gaId="G-0BSR9BPSWY" />

        {/* Facebook Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'YOUR_PIXEL_ID');
              fbq('track', 'PageView');
            `
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
          />
        </noscript>
      </body>
    </html>
  );
}