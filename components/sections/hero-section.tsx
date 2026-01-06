'use client';

import { motion } from 'framer-motion';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { ArrowRight, Github, Linkedin, Twitter, Mail } from 'lucide-react';
import Image from 'next/image';

const socialLinks = [
  { href: 'https://github.com/hoodini', icon: Github, label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/%F0%9F%8E%97%EF%B8%8Fyuval-avidani-87081474/', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://twitter.com/yuvai', icon: Twitter, label: 'Twitter' },
  { href: 'mailto:info@yuv.ai', icon: Mail, label: 'Email' },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-24 bg-gradient-to-b from-[#FFF5F8] via-background to-background dark:from-[#1C1C1E] dark:via-[#1C1C1E] dark:to-[#1C1C1E]">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary pink glow */}
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
        {/* Secondary blue glow */}
        <motion.div
          className="absolute top-[30%] right-[25%] w-[400px] h-[400px] rounded-full bg-[#00C2FF]/15 dark:bg-[#00C2FF]/10 blur-[100px]"
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
        {/* Orange accent glow */}
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
      <div className="relative z-10 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-dark text-sm font-medium text-white/90 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF4D8E] animate-pulse" />
              AI Builder & Speaker
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight mb-6"
            >
              Innovating AI
              <br />
              <span className="text-[#FF4D8E]">&</span> Development
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-8"
            >
              Building next-generation AI solutions and empowering developers to create transformative experiences
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <ButtonPrimary
                size="lg"
                className="group"
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Projects
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </ButtonPrimary>
              <ButtonPrimary
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                About Me
              </ButtonPrimary>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex items-center gap-4 mt-10 justify-center lg:justify-start"
            >
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center text-foreground/60 dark:text-white/60 hover:text-[#FF4D8E] hover:bg-foreground/10 dark:hover:bg-white/10 transition-all"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right - Profile Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex-shrink-0"
          >
            <div className="relative">
              {/* Glow behind image */}
              <div className="absolute -inset-4 bg-gradient-to-br from-[#FF4D8E]/30 via-[#00C2FF]/20 to-[#FF9100]/30 rounded-full blur-2xl animate-pulse-glow" />

              {/* Profile Image */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-white/20 dark:border-white/10 shadow-2xl">
                <Image
                  src="https://cdn.hailuoai.video/moss/prod/2026-01-01-02/user/multi_chat_file/1767204442417679023-304191379171532808_1767204439.jpg"
                  alt="Yuval Avidani"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-2 -right-2 px-3 py-1.5 rounded-full glass-panel-dark text-xs font-medium text-white"
              >
                AWS AI Superstar
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-2 -left-2 px-3 py-1.5 rounded-full glass-panel-dark text-xs font-medium text-white"
              >
                GitHub Star
              </motion.div>
            </div>
          </motion.div>
        </div>

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
