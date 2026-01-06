'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BoilerplateHero } from '@/components/sections/boilerplate-hero';
import { WhyThisStackSection } from '@/components/sections/why-this-stack';
import { BunComparisonSection } from '@/components/sections/bun-comparison';
import { QuickStartSection } from '@/components/sections/quick-start';
import { CustomizeSection } from '@/components/sections/customize-section';
import { StackSection } from '@/components/sections/stack-section';
import { CTASection } from '@/components/sections/cta-section';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <BoilerplateHero />
      <WhyThisStackSection />
      <StackSection />
      <BunComparisonSection />
      <QuickStartSection />
      <CustomizeSection />
      <CTASection />
      <Footer />
      <ScrollToTop />
    </main>
  );
}
