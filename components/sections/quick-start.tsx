'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Copy, Check, Terminal, Key, Rocket, ExternalLink } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-[#1C1C1E]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 overflow-x-auto shadow-xl">
        <code className={`text-sm font-mono text-white/90 language-${language}`}>
          {code}
        </code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-white/60" />
        )}
      </button>
    </div>
  );
}

const steps = [
  {
    number: 1,
    icon: Terminal,
    title: 'Create Your Project',
    description: 'Run the create command to scaffold a new project. This works with Bun, npm, pnpm, or Yarn.',
    code: `# With Bun (Recommended - 30x faster)
bun create yuv-app my-project

# Or with npm
npm create yuv-app my-project

# Or clone directly
git clone https://github.com/hoodini/nextjs-bun-starter.git my-project`,
  },
  {
    number: 2,
    icon: Key,
    title: 'Configure Authentication',
    description: 'Set up Google OAuth by adding your credentials to the environment file.',
    code: `# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your credentials:
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000`,
  },
  {
    number: 3,
    icon: Rocket,
    title: 'Start Building',
    description: 'Install dependencies and start the development server. You\'re ready to customize!',
    code: `# Install dependencies (takes ~1.5 seconds with Bun!)
bun install

# Start development server
bun run dev

# Open http://localhost:3000`,
  },
];

export function QuickStartSection() {
  return (
    <section id="quick-start" className="py-24 px-6 bg-[#F2F2F7] dark:bg-[#2C2C2E]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Quick Start
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get your project up and running in under 2 minutes.
            Follow these three simple steps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-gradient-to-b from-[#FF4D8E] to-[#FF4D8E]/20 hidden md:block" />
                )}

                <div className="rounded-2xl overflow-hidden p-6 md:p-8 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Step Number */}
                    <div className="flex items-center gap-4 md:flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#FF4D8E] flex items-center justify-center text-white font-bold text-lg">
                        {step.number}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#FF4D8E]/10 flex items-center justify-center md:hidden">
                        <IconComponent className="w-5 h-5 text-[#FF4D8E]" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FF4D8E]/10 items-center justify-center hidden md:flex">
                          <IconComponent className="w-5 h-5 text-[#FF4D8E]" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <CodeBlock code={step.code} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Google OAuth Setup Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="rounded-2xl p-6 inline-block bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <h4 className="font-semibold text-foreground mb-2">
              Need help setting up Google OAuth?
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Follow our step-by-step guide to configure Google Cloud Console
            </p>
            <a
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#FF4D8E] hover:text-[#FF4D8E]/80 font-medium transition-colors"
            >
              Open Google Cloud Console
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
