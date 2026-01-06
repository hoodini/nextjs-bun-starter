'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Palette,
  Shield,
  Sparkles,
  Box,
  Moon,
  type LucideIcon
} from 'lucide-react';

interface StackItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  tech: string;
}

const stackItems: StackItem[] = [
  {
    icon: Zap,
    title: 'Lightning Fast Development',
    description: 'Bun installs packages 30x faster than npm, runs TypeScript natively, and includes a built-in bundler. No more waiting for slow installs.',
    color: '#FF9100',
    tech: 'Bun',
  },
  {
    icon: Box,
    title: 'Modern React Framework',
    description: 'Next.js 16 with App Router, React Server Components, and React 19. The most production-ready React framework with built-in optimizations.',
    color: '#000000',
    tech: 'Next.js',
  },
  {
    icon: Palette,
    title: 'Beautiful UI Components',
    description: 'Shadcn/ui provides accessible, customizable components built on Radix UI. Copy-paste components that you own and can modify freely.',
    color: '#FF4D8E',
    tech: 'Shadcn/ui',
  },
  {
    icon: Sparkles,
    title: 'Utility-First Styling',
    description: 'Tailwind CSS 4 with OKLch colors for better color consistency. Build any design directly in your markup without fighting CSS specificity.',
    color: '#00C2FF',
    tech: 'Tailwind CSS',
  },
  {
    icon: Shield,
    title: 'Authentication Ready',
    description: 'Google OAuth pre-configured with NextAuth.js. Session management, protected routes, and user profiles work out of the box.',
    color: '#34A853',
    tech: 'Google Auth',
  },
  {
    icon: Moon,
    title: 'Dark Mode Built-in',
    description: 'System-aware theme switching with next-themes. Beautiful in both light and dark modes with Lucide icons (1000+ consistent icons).',
    color: '#6366F1',
    tech: 'Lucide + Themes',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  },
};

export function WhyThisStackSection() {
  return (
    <section id="why-this-stack" className="py-24 px-6 bg-[#F2F2F7] dark:bg-[#2C2C2E]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why This Stack?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every technology in this boilerplate was chosen for a specific reason.
            Here's why each piece matters for your next project.
          </p>
        </motion.div>

        {/* Stack Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {stackItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <div className="relative overflow-hidden rounded-2xl p-6 h-full transition-all duration-300 hover:scale-[1.02] bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] group">
                  {/* Tech Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <IconComponent
                        className="w-6 h-6"
                        style={{ color: item.color }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color
                      }}
                    >
                      {item.tech}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            All of this works together seamlessly, so you can focus on building your product, not configuring tools.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
