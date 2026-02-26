// app/page.tsx
import { Suspense } from 'react';
import Hero from '@/components/home/Hero';
import FeaturedCars from '@/components/home/FeaturedCars';
import MatchmakerWidget from '@/components/matchmaker/MatchmakerWidget';
import HowItWorks from '@/components/home/HowItWorks';
import { fetchCars } from '@/lib/api';
import RecentlyViewed from '@/components/cars/RecentlyViewed';
import { CarCardSkeleton, GridSkeleton } from '@/components/ui/LoadingSkeleton';

export default async function Home() {
  // FIX: Fetch 100 cars, sorted by price descending to get luxury vehicles
  const data = await fetchCars({ limit: 100, sort: 'price_desc' });
  const allCars = data?.cars || [];

  return (
    <main>
      <Hero />
      <section className="container-custom py-16">
        <FeaturedCars /> {/* This component fetches its own limited data - that's fine */}
      </section>
      <section className="container-custom py-8">
        <RecentlyViewed />
      </section>
      <section className="bg-secondary py-16">
        <div className="container-custom">
          <Suspense fallback={<GridSkeleton />}>
          </Suspense>
        </div>
      </section>
      <section className="container-custom py-16">
        <HowItWorks />
      </section>
    </main >
  );
}