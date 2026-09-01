import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { MotionConfig } from 'framer-motion';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/ui/PageTransition';
import InstallAppButton from '@/components/ui/InstallAppButton';
import { ConfigProvider } from '@/lib/ConfigContext';
import { getConfig } from '@/lib/configServer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://veturakoreakosove.com'),
  title: {
    default: 'Vetura Korea Kosovë - Makina nga Korea në Kosovë',
    template: '%s | Vetura Korea Kosovë'
  },
  description: 'Importoni makina cilësore nga Korea me çmime konkurruese.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Vetura Korea Kosovë',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: '#FF6B00',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialConfig = await getConfig();
  return (
    <html lang="sq" dir="ltr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-bg-primary antialiased" suppressHydrationWarning>
        <MotionConfig reducedMotion="user">
          <ConfigProvider initialConfig={initialConfig}>
            <Header />
            <main className="pt-16 md:pt-20 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Footer />
            <InstallAppButton />
          </ConfigProvider>
        </MotionConfig>
        {process.env.NODE_ENV === 'production' && (
          <Script src="/register-sw.js" strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
