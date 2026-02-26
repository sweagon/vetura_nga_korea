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

export const metadata: Metadata = {
  title: 'Formula Export - Makina nga Korea në Kosovë',
  description: 'Importoni makina cilësore nga Korea me çmime konkurruese. Formula Export ju sjell makinat më të mira direkt në Kosovë.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Formula Export'
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
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