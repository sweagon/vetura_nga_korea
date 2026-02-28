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

  // Simplified verification - removed all placeholders
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Add this later when needed
  },

  alternates: {
    canonical: 'https://formula-export.com',
    languages: {
      'sq-AL': 'https://formula-export.com',
    },
  },

  category: 'automotive',

  appleWebApp: {
    capable: true,
    title: 'Formula Export',
    statusBarStyle: 'black-translucent',
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/icons/icon-57x57.png', sizes: '57x57' },
      { url: '/icons/icon-60x60.png', sizes: '60x60' },
      { url: '/icons/icon-72x72.png', sizes: '72x72' },
      { url: '/icons/icon-76x76.png', sizes: '76x76' },
      { url: '/icons/icon-114x114.png', sizes: '114x114' },
      { url: '/icons/icon-120x120.png', sizes: '120x120' },
      { url: '/icons/icon-144x144.png', sizes: '144x144' },
      { url: '/icons/icon-152x152.png', sizes: '152x152' },
      { url: '/icons/icon-180x180.png', sizes: '180x180' },
    ],
  },

  manifest: '/manifest.json',

  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Formula Export',
    'application-name': 'Formula Export',
    'msapplication-TileColor': '#FF2800',
    'msapplication-TileImage': '/icons/icon-144x144.png',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq" dir="ltr">
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="https://autokoreakosova.com" />
        <link rel="dns-prefetch" href="https://ci.encar.com" />

        {/* Theme color for browser UI */}
        <meta name="theme-color" content="#FF2800" />

        {/* Viewport for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />

        {/* HandheldFriendly for older mobile devices */}
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="width" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#FF2800" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className} cz-shortcut-listen="true">
        {/* Structured Data */}
        <StructuredData type="organization" />
        <StructuredData type="website" />
        <StructuredData type="search" />

        {/* Providers (Auth, Query, etc.) */}
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

        {/* Register Service Worker for PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('✅ ServiceWorker registered successfully');
                        
                        // Check for updates
                        registration.addEventListener('updatefound', function() {
                          const newWorker = registration.installing;
                          console.log('🔄 New service worker installing...');
                          
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed') {
                              if (navigator.serviceWorker.controller) {
                                console.log('📦 New content available - refresh to update');
                              } else {
                                console.log('✅ Content cached for offline use');
                              }
                            }
                          });
                        });
                      },
                      function(error) {
                        console.log('❌ ServiceWorker registration failed: ', error);
                      }
                    );
                  });
                }
              })();
            `
          }}
        />
      </body>
    </html>
  );
}