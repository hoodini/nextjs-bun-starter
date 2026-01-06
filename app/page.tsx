'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { AboutSection } from '@/components/sections/about-section';
import { FeaturedWorkSection } from '@/components/sections/featured-work-section';
import { InsightsSection } from '@/components/sections/insights-section';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground dark:bg-[#1C1C1E]">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturedWorkSection />
      <InsightsSection />
      <Footer />
    </main>
  );
}
