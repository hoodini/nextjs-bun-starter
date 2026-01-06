'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Wand2,
  Palette,
  Layout,
  Shield,
  Database,
  Globe,
  Copy,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const customizationAreas = [
  {
    icon: Palette,
    title: 'Branding & Colors',
    description: 'Update the color scheme in globals.css to match your brand. Change the primary pink (#FF4D8E) to your brand color.',
    file: 'app/globals.css',
    color: '#FF4D8E',
  },
  {
    icon: Layout,
    title: 'Page Content',
    description: 'Replace this landing page with your own content. All sections are modular and easy to swap out.',
    file: 'app/page.tsx',
    color: '#00C2FF',
  },
  {
    icon: Shield,
    title: 'Authentication',
    description: 'Add more OAuth providers (GitHub, Discord, etc.) or switch to email/password auth.',
    file: 'app/api/auth/[...nextauth]/route.ts',
    color: '#34A853',
  },
  {
    icon: Database,
    title: 'Database',
    description: 'Connect your preferred database. We recommend Prisma with PostgreSQL or Supabase.',
    file: 'lib/db.ts',
    color: '#FF9100',
  },
  {
    icon: Globe,
    title: 'Deployment',
    description: 'Deploy to Vercel, Netlify, or any platform. Update environment variables for production.',
    file: 'vercel.json',
    color: '#6366F1',
  },
];

const aiPrompt = `I'm building a [describe your app: SaaS, landing page, dashboard, etc.].

I'm using the Next.js + Bun boilerplate. Help me customize it for my use case:

1. App Name: [Your App Name]
2. Primary Purpose: [What does your app do?]
3. Target Users: [Who is this for?]
4. Key Features Needed:
   - [Feature 1]
   - [Feature 2]
   - [Feature 3]
5. Color Scheme: [Primary color hex or describe the vibe]
6. Authentication: [Google only / Add GitHub / Email-password / etc.]
7. Database: [None / Prisma + PostgreSQL / Supabase / etc.]

Please help me:
- Update the landing page content
- Modify the color scheme in globals.css
- Add any additional components I might need
- Set up the database schema if needed`;

export function CustomizeSection() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(aiPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="customize" className="py-24 px-6 bg-background dark:bg-[#1C1C1E]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4D8E]/10 text-[#FF4D8E] text-sm font-medium mb-4">
            <Wand2 className="w-4 h-4" />
            Make It Yours
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Customize for Your Needs
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            This boilerplate is meant to be customized. Here's what you should change to make it your own.
          </p>
        </motion.div>

        {/* Customization Areas Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {customizationAreas.map((area, index) => {
            const IconComponent = area.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${area.color}15` }}
                >
                  <IconComponent className="w-6 h-6" style={{ color: area.color }} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {area.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {area.description}
                </p>
                <code className="text-xs bg-muted/50 px-2 py-1 rounded text-muted-foreground font-mono">
                  {area.file}
                </code>
              </motion.div>
            );
          })}
        </motion.div>

        {/* AI Prompt Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="rounded-2xl p-8 bg-white/60 dark:bg-white/5 backdrop-blur-md border-2 border-[#FF4D8E]/20 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4D8E] to-[#FF9100] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Use AI to Customize Faster
              </h3>
              <p className="text-muted-foreground">
                Copy this prompt and paste it into Claude, ChatGPT, or your favorite AI assistant to get personalized help customizing this boilerplate for your specific project.
              </p>
            </div>
          </div>

          {/* Prompt Box */}
          <div className="relative">
            <pre className="bg-[#1C1C1E]/90 backdrop-blur-md border border-white/10 rounded-xl p-6 overflow-x-auto text-sm text-white/80 font-mono whitespace-pre-wrap shadow-xl">
              {aiPrompt}
            </pre>
            <button
              onClick={copyPrompt}
              className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Prompt
                </>
              )}
            </button>
          </div>

          {/* Bottom Note */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Fill in the brackets with your details, then paste into your AI assistant.
            </p>
            <div className="flex items-center gap-2 text-[#FF4D8E] font-medium text-sm">
              Works with Claude, ChatGPT, Gemini & more
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-2xl font-bold text-foreground mb-4">
            Ready to build something amazing?
          </p>
          <p className="text-muted-foreground max-w-xl mx-auto">
            This boilerplate gives you the foundation. The possibilities are endless.
            SaaS, landing pages, dashboards, portfolios — you name it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
