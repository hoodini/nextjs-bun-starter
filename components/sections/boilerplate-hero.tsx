'use client';

import { motion } from 'framer-motion';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { ArrowRight, Copy, Check, Rocket, Zap, Shield, Palette } from 'lucide-react';
import { useState } from 'react';

export function BoilerplateHero() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('bun create yuv-app my-project');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-24 bg-gradient-to-b from-[#FFF5F8] via-background to-background dark:from-[#1C1C1E] dark:via-[#1C1C1E] dark:to-[#1C1C1E]">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[15%] right-[15%] w-[500px] h-[500px] rounded-full bg-[#FF4D8E]/20 dark:bg-[#FF4D8E]/15 blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-[30%] left-[10%] w-[400px] h-[400px] rounded-full bg-[#00C2FF]/15 dark:bg-[#00C2FF]/10 blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#FF9100]/10 dark:bg-[#FF9100]/8 blur-[80px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-dark text-sm font-medium text-white/90 mb-6"
        >
          <Rocket className="w-4 h-4 text-[#FF4D8E]" />
          Production-Ready Boilerplate
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
        >
          Ship Your Next Project
          <br />
          <span className="text-[#FF4D8E]">30x Faster</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
        >
          A battle-tested Next.js boilerplate with <strong>Bun</strong>, <strong>Shadcn/ui</strong>, <strong>Tailwind CSS</strong>, <strong>Lucide Icons</strong>, and <strong>Google Auth</strong> — everything you need to launch your SaaS, landing page, or web app.
        </motion.p>

        {/* Quick Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-[#FF9100]" />
            <span>Bun-powered (30x faster installs)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-[#00C2FF]" />
            <span>Google Auth ready</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette className="w-4 h-4 text-[#FF4D8E]" />
            <span>Dark mode included</span>
          </div>
        </motion.div>

        {/* Install Command */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-[#1C1C1E] dark:bg-[#2C2C2E] border border-white/10 font-mono text-sm md:text-base">
            <span className="text-muted-foreground">$</span>
            <span className="text-white">bun create yuv-app my-project</span>
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              aria-label="Copy command"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <ButtonPrimary
            size="lg"
            className="group"
            onClick={() => document.getElementById('quick-start')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </ButtonPrimary>
          <ButtonPrimary
            size="lg"
            variant="outline"
            onClick={() => document.getElementById('why-this-stack')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Why This Stack?
          </ButtonPrimary>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-foreground/20 dark:border-white/20 flex justify-center pt-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], height: ['6px', '12px', '6px'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 bg-foreground/60 dark:bg-white/60 rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
