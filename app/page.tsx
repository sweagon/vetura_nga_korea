import { Suspense } from 'react';
import Hero from '@/components/home/Hero';
import FeaturedCars from '@/components/home/FeaturedCars';
import MatchmakerWidget from '@/components/matchmaker/MatchmakerWidget';
import HowItWorks from '@/components/home/HowItWorks';
import { fetchCars } from '@/lib/api';
import RecentlyViewed from '@/components/cars/RecentlyViewed';
import { GridSkeleton } from '@/components/ui/LoadingSkeleton';

// Force dynamic rendering - homepage has dynamic content
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch 100 cars for the matchmaker to analyze
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

      {/* Matchmaker Section - Only show if we have cars */}
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