// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/ui/PageTransition';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { ConfigProvider } from '@/lib/ConfigContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vetura-nga-korea.vercel.app'),
  title: {
    default: 'Vetura Nga Korea - Makina nga Korea në Kosovë',
    template: '%s | Vetura Nga Korea'
  },
  description: 'Importoni makina cilësore nga Korea me çmime konkurruese.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq" dir="ltr" className={inter.variable}>
      <body className="min-h-screen bg-primary antialiased">
        <ConfigProvider>
          <Header />
          <main className="pt-16 md:pt-20 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
          <ScrollToTop />
        </ConfigProvider>
      </body>
    </html>
  );
}