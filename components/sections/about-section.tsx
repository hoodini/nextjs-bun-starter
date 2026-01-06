'use client';

import { motion } from 'framer-motion';
import { Brain, Code2, Cpu, Globe, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';

const skills = [
  { icon: Brain, label: 'AI/ML', color: '#FF4D8E' },
  { icon: Code2, label: 'Full-Stack', color: '#00C2FF' },
  { icon: Cpu, label: 'MLOps', color: '#FF9100' },
  { icon: Globe, label: 'Cloud', color: '#FF4D8E' },
  { icon: Sparkles, label: 'Gen AI', color: '#00C2FF' },
  { icon: Zap, label: 'DevOps', color: '#FF9100' },
];

const timeline = [
  {
    year: '2024',
    title: 'AWS AI Superstar',
    description: 'Recognized as AWS AI Superstar for contributions to AI community and innovative solutions.',
  },
  {
    year: '2023',
    title: 'GitHub Star',
    description: 'Awarded GitHub Star status for open source contributions and community engagement.',
  },
  {
    year: '2022',
    title: 'Founded YUV.AI',
    description: 'Launched YUV.AI community to empower developers with AI tools and education.',
  },
  {
    year: '2020',
    title: 'AI Speaker Journey',
    description: 'Started speaking at international conferences on AI, ML, and developer experience.',
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 relative bg-[#F2F2F7]">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1C1C1E] mb-4">
            About
          </h2>
          <p className="text-[#1C1C1E]/60 text-lg max-w-2xl mx-auto">
            Passionate about building AI solutions that make a real impact
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Bio Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-light shadow-glass rounded-[16px] p-8">
              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-8">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#FF4D8E]/20 shrink-0">
                  <Image
                    src="https://cdn.hailuoai.video/moss/prod/2026-01-01-02/user/multi_chat_file/1767204442417679023-304191379171532808_1767204439.jpg"
                    alt="Yuval Avidani"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1C1C1E] mb-1">Yuval Avidani</h3>
                  <p className="text-[#FF4D8E] font-medium mb-2">AI Builder & Speaker</p>
                  <div className="flex items-center gap-3 text-sm text-[#1C1C1E]/50">
                    <a href="mailto:yuval.avidani@gmail.com" className="hover:text-[#1C1C1E] transition-colors">
                      yuval.avidani@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Bio Text */}
              <div className="space-y-4 text-[#1C1C1E]/70 leading-relaxed">
                <p>
                  I'm a passionate AI builder and speaker dedicated to pushing the boundaries of what's possible with artificial intelligence. With deep expertise in machine learning, full-stack development, and cloud architecture, I build solutions that transform how people work and create.
                </p>
                <p>
                  As the founder of YUV.AI, I lead a community of developers exploring the frontiers of AI technology. My work spans from building production ML systems to speaking at international conferences about the future of AI-assisted development.
                </p>
                <p>
                  When I'm not coding or speaking, you'll find me mentoring the next generation of AI engineers and contributing to open-source projects that democratize access to AI tools.
                </p>
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-[#1C1C1E]/10">
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://github.com/hoodini"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full border border-[#1C1C1E]/20 text-sm text-[#1C1C1E]/70 hover:text-[#1C1C1E] hover:border-[#1C1C1E]/40 transition-colors"
                  >
                    Blog content
                  </a>
                  <a
                    href="#projects"
                    className="px-4 py-2 rounded-full bg-[#1C1C1E] text-sm text-white hover:bg-[#1C1C1E]/90 transition-colors"
                  >
                    View Projects
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Skills & Timeline */}
          <div className="space-y-8">
            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-semibold text-[#1C1C1E] mb-6">Skills</h3>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-3 gap-4"
              >
                {skills.map((skill) => {
                  const IconComponent = skill.icon;
                  return (
                    <motion.div key={skill.label} variants={itemVariants}>
                      <div className="glass-light shadow-glass rounded-xl p-4 text-center hover-lift cursor-default">
                        <div
                          className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors"
                          style={{ backgroundColor: `${skill.color}10` }}
                        >
                          <IconComponent
                            className="w-6 h-6 transition-transform"
                            style={{ color: skill.color }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[#1C1C1E]/70">
                          {skill.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-[#1C1C1E] mb-6">My Journey</h3>
              <div className="space-y-1">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-8 pb-8 last:pb-0"
                  >
                    {/* Timeline line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-[#FF4D8E] to-[#FF4D8E]/20" />
                    )}

                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[#FF4D8E]/20 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D8E]" />
                    </div>

                    {/* Content */}
                    <div className="pt-0.5">
                      <span className="text-[#FF4D8E] text-sm font-medium">{item.year}</span>
                      <h4 className="text-[#1C1C1E] font-semibold mt-1">{item.title}</h4>
                      <p className="text-[#1C1C1E]/50 text-sm mt-1">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
