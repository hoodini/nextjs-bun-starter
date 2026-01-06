'use client';

import { motion } from 'framer-motion';
import { Star, Github, Twitter, Instagram, Youtube, Globe, ExternalLink } from 'lucide-react';
import { ButtonPrimary } from '@/components/ui/button-primary';

const socialLinks = [
  {
    name: 'GitHub',
    handle: '@hoodini',
    href: 'https://github.com/hoodini',
    icon: Github,
    color: '#333',
  },
  {
    name: 'X (Twitter)',
    handle: '@yuvalav',
    href: 'https://x.com/yuvalav',
    icon: Twitter,
    color: '#1DA1F2',
  },
  {
    name: 'Instagram',
    handle: '@yuval_770',
    href: 'https://instagram.com/yuval_770',
    icon: Instagram,
    color: '#E4405F',
  },
  {
    name: 'YouTube',
    handle: '@yuv-ai',
    href: 'https://youtube.com/@yuv-ai',
    icon: Youtube,
    color: '#FF0000',
  },
  {
    name: 'Website',
    handle: 'yuv.ai',
    href: 'https://yuv.ai',
    icon: Globe,
    color: '#FF4D8E',
  },
];

export function CTASection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#1C1C1E] to-[#0C0C0E] text-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Star the Repo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF9100]/20 text-[#FF9100] text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Support This Project
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Found This Useful?
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
            If this boilerplate helped you ship faster, consider starring the repo on GitHub.
            It helps others discover this project and motivates me to keep improving it!
          </p>

          <motion.a
            href="https://github.com/hoodini/nextjs-bun-starter"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-[#1C1C1E] font-semibold text-lg hover:bg-white/90 transition-colors"
          >
            <Star className="w-5 h-5 text-[#FF9100]" />
            Star on GitHub
            <Github className="w-5 h-5" />
          </motion.a>
        </motion.div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-16" />

        {/* Follow Me Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Connect With Me
          </h3>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Follow along for more AI & development content, tutorials, and open-source projects
          </p>

          {/* Social Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${social.color}20` }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: social.color }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white">
                    {social.name}
                  </span>
                  <span className="text-xs text-white/40">
                    {social.handle}
                  </span>
                </motion.a>
              );
            })}
          </div>

          {/* Linktree Button */}
          <motion.a
            href="https://linktr.ee/yuvai"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FF4D8E] to-[#FF9100] text-white font-medium hover:opacity-90 transition-opacity"
          >
            All My Links
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </motion.div>

        {/* About Creator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-16 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <img
              src="https://cdn.hailuoai.video/moss/prod/2026-01-01-02/user/multi_chat_file/1767204442417679023-304191379171532808_1767204439.jpg"
              alt="Yuval Avidani"
              className="w-20 h-20 rounded-full border-2 border-[#FF4D8E]/50"
            />
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold mb-1">Yuval Avidani</h4>
              <p className="text-white/60 mb-2">AWS AI Superstar | GitHub Star | Founder of YUV.AI</p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="px-2 py-1 rounded-full bg-[#FF4D8E]/20 text-[#FF4D8E] text-xs font-medium">
                  AI Builder
                </span>
                <span className="px-2 py-1 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] text-xs font-medium">
                  Speaker
                </span>
                <span className="px-2 py-1 rounded-full bg-[#FF9100]/20 text-[#FF9100] text-xs font-medium">
                  Open Source
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
