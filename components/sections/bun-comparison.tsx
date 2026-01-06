'use client';

import { motion } from 'framer-motion';
import { Zap, HardDrive, Timer, Check, X } from 'lucide-react';

const comparisonData = [
  {
    metric: 'Package Installation',
    npm: '~45 seconds',
    bun: '~1.5 seconds',
    improvement: '30x faster',
    icon: Timer,
  },
  {
    metric: 'Disk Space',
    npm: '~500MB',
    bun: '~200MB',
    improvement: '60% smaller',
    icon: HardDrive,
  },
  {
    metric: 'Script Execution',
    npm: '~150ms startup',
    bun: '~25ms startup',
    improvement: '6x faster',
    icon: Zap,
  },
];

const commandComparison = [
  { action: 'Install dependencies', npm: 'npm install', bun: 'bun install' },
  { action: 'Add a package', npm: 'npm install package', bun: 'bun add package' },
  { action: 'Remove a package', npm: 'npm uninstall package', bun: 'bun remove package' },
  { action: 'Run a script', npm: 'npm run dev', bun: 'bun run dev' },
  { action: 'Run tests', npm: 'npm test', bun: 'bun test' },
  { action: 'Execute TypeScript', npm: 'npx tsx script.ts', bun: 'bun script.ts' },
];

const npmFeatures = [
  { feature: 'Massive ecosystem', included: true },
  { feature: 'Well documented', included: true },
  { feature: 'Industry standard', included: true },
  { feature: 'Fast installation', included: false },
  { feature: 'Native TypeScript', included: false },
  { feature: 'Built-in bundler', included: false },
];

const bunFeatures = [
  { feature: 'npm compatible', included: true },
  { feature: '30x faster installs', included: true },
  { feature: 'Native TypeScript', included: true },
  { feature: 'Built-in bundler', included: true },
  { feature: 'Built-in test runner', included: true },
  { feature: 'Hot reloading', included: true },
];

export function BunComparisonSection() {
  return (
    <section id="bun-comparison" className="py-24 px-6 bg-background dark:bg-[#1C1C1E]">
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
            Bun vs npm
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bun is a drop-in replacement for npm that's significantly faster.
            Same commands, same packages, just faster.
          </p>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {comparisonData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl overflow-hidden p-6 text-center bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FF9100]/15 flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-6 h-6 text-[#FF9100]" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  {item.metric}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <span className="text-xs text-muted-foreground">npm</span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{item.npm}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <span className="text-xs text-muted-foreground">Bun</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">{item.bun}</span>
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FF9100]/10 text-[#FF9100] text-xs font-semibold">
                  <Zap className="w-3 h-3" />
                  {item.improvement}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Side by Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* npm Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-lg font-bold text-red-600">npm</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Node Package Manager</h3>
                <p className="text-sm text-muted-foreground">The classic choice</p>
              </div>
            </div>
            <ul className="space-y-3">
              {npmFeatures.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  {item.included ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-400" />
                  )}
                  <span className={item.included ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.feature}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Bun Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md border-2 border-[#FF9100]/30 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#FF9100]/20 flex items-center justify-center">
                <span className="text-lg font-bold text-[#FF9100]">Bun</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">All-in-One Runtime</h3>
                <p className="text-sm text-[#FF9100] font-medium">Recommended</p>
              </div>
            </div>
            <ul className="space-y-3">
              {bunFeatures.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">{item.feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Command Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
        >
          <div className="p-6 border-b border-white/20 dark:border-white/10">
            <h3 className="text-xl font-semibold text-foreground">Command Comparison</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Same commands, just replace `npm` with `bun`
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    npm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Bun
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {commandComparison.map((row, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {row.action}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-muted/50 px-2 py-1 rounded text-muted-foreground font-mono">
                        {row.npm}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-[#FF9100]/10 px-2 py-1 rounded text-[#FF9100] font-mono">
                        {row.bun}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
