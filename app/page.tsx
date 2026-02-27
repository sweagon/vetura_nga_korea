// app/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import FeaturedCars from '@/components/home/FeaturedCars';
import MatchmakerWidget from '@/components/matchmaker/MatchmakerWidget';
import HowItWorks from '@/components/home/HowItWorks';
import { fetchCars } from '@/lib/api';
import RecentlyViewed from '@/components/cars/RecentlyViewed';
import { GridSkeleton } from '@/components/ui/LoadingSkeleton';

export const metadata: Metadata = {
  title: 'Import Makina nga Korea | Formula Export',
  description: 'Platforma më e madhe për import të makinave nga Korea në Kosovë. BMW, Audi, Mercedes-Benz dhe makina të tjera me çmime konkurruese.',
  keywords: ['import makina', 'makina nga korea', 'BMW', 'Audi', 'Mercedes', 'makina ne kosove', 'cmime makina'],
  openGraph: {
    title: 'Formula Export - Import Makina nga Korea',
    description: 'Makina cilësore nga Korea me çmime konkurruese',
    images: ['/og-home.jpg'],
  },
};

// Force dynamic rendering - homepage has dynamic content
export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await fetchCars({ limit: 100, sort: 'price_desc' });
  const allCars = data?.cars || [];

  return (
    <main>
      <Hero />
      <section className="container-custom py-16">
        <FeaturedCars />
      </section>
      <section className="container-custom py-8">
        <RecentlyViewed />
      </section>
      {allCars.length > 0 && (
        <section className="bg-secondary py-16">
          <div className="container-custom">
            <Suspense fallback={<GridSkeleton />}>
              <MatchmakerWidget cars={allCars} />
            </Suspense>
          </div>
        </section>
      )}
      <section className="container-custom py-16">
        <HowItWorks />
      </section>
    </main>
  );
}