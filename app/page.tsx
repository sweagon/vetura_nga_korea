// app/page.tsx
import { Suspense } from 'react';
import Hero from '@/components/home/Hero';
import AboutSection from '@/components/home/AboutSection';
import HowItWorks from '@/components/home/HowItWorks';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import LocationMap from '@/components/home/LocationMap';
import FeaturedCars from '@/components/home/FeaturedCars';
import RecentlyViewed from '@/components/cars/RecentlyViewed';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />

      {/* About Section */}
      <AboutSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose Us with Testimonials */}
      <WhyChooseUs />

      {/* Featured Cars Section */}
      <Suspense fallback={
        <div className="container-swiss py-20">
          <div className="h-8 bg-surface-2 rounded w-48 mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-0">
                <div className="aspect-[4/3] bg-surface-2 skeleton" />
                <div className="p-5 space-y-4">
                  <div className="h-5 bg-surface-2 skeleton rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-surface-2 skeleton rounded w-full" />
                    <div className="h-4 bg-surface-2 skeleton rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }>
        <FeaturedCars />
      </Suspense>

      {/* Location Map */}
      <LocationMap />

      {/* Recently Viewed Section */}
      <Suspense fallback={null}>
        <RecentlyViewed />
      </Suspense>
    </div>
  );
}