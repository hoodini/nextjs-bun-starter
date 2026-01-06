'use client';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Github,
  Linkedin,
  Mail,
  ArrowDown,
  Zap,
  Shield,
  Palette,
  Rocket,
  Check,
  X,
  Package,
  Clock,
  HardDrive,
  Terminal,
  Copy,
  ExternalLink
} from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold font-mono">⚡ Bun + Next.js Starter</h2>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden md:block hover:text-primary transition-colors">Features</a>
            <a href="#bun-vs-npm" className="hidden md:block hover:text-primary transition-colors">Bun vs npm</a>
            <a href="#quickstart" className="hidden md:block hover:text-primary transition-colors">Quick Start</a>
            <ModeToggle />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center text-center gap-8 pt-32 pb-20">
        {/* Creator Profile */}
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="relative">
            <img
              src="https://media.licdn.com/dms/image/v2/D4D03AQFAuznqcEJXTA/profile-displayphoto-scale_200_200/B4DZq1DCZpIMAY-/0/1763974088560?e=1769040000&v=beta&t=dRh477jKl4BQ0KqsJUg9X7UkuDDzoWgC68aHLnHDXMk"
              alt="Yuval Avidani"
              className="w-28 h-28 rounded-full border-4 border-primary shadow-lg object-cover"
            />
            <span className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
              Creator
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Built by</span>
            <a
              href="https://yuv.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-primary transition-colors flex items-center gap-1"
            >
              Yuval Avidani <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            AWS AI Superstar • GitHub Star • Founder of YUV.AI Community • AI Builder & Speaker
          </p>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" />
            Production-Ready in Minutes
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            The Ultimate<br />
            <span className="text-primary">Next.js + Bun</span> Starter
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Stop wasting time on boilerplate. Start building your next project with <strong>Bun</strong> (the blazingly fast JavaScript runtime),
            <strong> Next.js 16</strong>, <strong>Shadcn/ui</strong>, <strong>Tailwind CSS</strong>, and <strong>Google Authentication</strong> — all pre-configured and ready to go.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="#quickstart">
              <Rocket className="w-5 h-5 mr-2" />
              Get Started
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="https://github.com/hoodini" target="_blank" rel="noopener noreferrer">
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </a>
          </Button>
        </div>

        <div className="flex gap-6 mt-4">
          <a href="https://github.com/hoodini" target="_blank" rel="noopener noreferrer"
             className="text-muted-foreground hover:text-primary transition-colors">
            <Github className="w-6 h-6" />
          </a>
          <a href="https://www.linkedin.com/in/%F0%9F%8E%97%EF%B8%8Fyuval-avidani-87081474/" target="_blank" rel="noopener noreferrer"
             className="text-muted-foreground hover:text-primary transition-colors">
            <Linkedin className="w-6 h-6" />
          </a>
          <a href="mailto:info@yuv.ai"
             className="text-muted-foreground hover:text-primary transition-colors">
            <Mail className="w-6 h-6" />
          </a>
        </div>

        <ArrowDown className="w-6 h-6 animate-bounce text-muted-foreground mt-8" />
      </section>

      {/* Why This Boilerplate Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why This Boilerplate?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every minute spent on setup is a minute not spent building your product. This starter kit gives you
              a production-grade foundation with zero configuration required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Zap className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Blazingly Fast</CardTitle>
                <CardDescription>
                  Bun is up to 30x faster than npm for package installation. Your development workflow will never be the same.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Shield className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Authentication Ready</CardTitle>
                <CardDescription>
                  Google OAuth pre-configured with NextAuth.js. Just add your credentials and you're ready to authenticate users.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Palette className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Beautiful UI Components</CardTitle>
                <CardDescription>
                  Shadcn/ui components built on Radix UI primitives. Accessible, customizable, and stunning out of the box.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 text-primary mb-2 flex items-center justify-center text-2xl">🌙</div>
                <CardTitle>Dark Mode Built-in</CardTitle>
                <CardDescription>
                  System-aware dark mode that respects user preferences. Toggle between light, dark, and system themes instantly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 text-primary mb-2 flex items-center justify-center text-2xl">📱</div>
                <CardTitle>Fully Responsive</CardTitle>
                <CardDescription>
                  Mobile-first design with Tailwind CSS. Looks perfect on every screen size from phones to ultrawide monitors.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 text-primary mb-2 flex items-center justify-center text-2xl">🔒</div>
                <CardTitle>TypeScript Native</CardTitle>
                <CardDescription>
                  Full TypeScript support with strict mode. Catch bugs before they happen with complete type safety.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Bun vs npm Comparison Section */}
      <section id="bun-vs-npm" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Bun vs npm: Why Bun Wins</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              npm has been the default for years, but Bun is revolutionizing JavaScript development.
              Here's why this boilerplate uses Bun instead of npm.
            </p>
          </div>

          {/* What Are They Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-8 h-8 text-red-500" />
                  <CardTitle className="text-2xl">npm (Node Package Manager)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  npm is the <strong>default package manager</strong> that comes bundled with Node.js. Released in 2010,
                  it's been the standard way to install JavaScript packages for over a decade.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Massive ecosystem with millions of packages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Well-documented and widely understood</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Slow installation speeds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Large node_modules folder sizes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Requires separate runtime (Node.js)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl">Bun</CardTitle>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Recommended</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Bun is an <strong>all-in-one JavaScript runtime</strong> that includes a package manager, bundler,
                  and test runner. Built with Zig and JavaScriptCore, it's designed for speed from the ground up.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span><strong>30x faster</strong> package installation than npm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Native TypeScript & JSX support (no transpilation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Built-in bundler, test runner, and hot reloading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Drop-in npm replacement (100% compatible)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Smaller disk footprint</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Speed Comparison */}
          <div className="bg-muted/50 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold mb-8 text-center">Speed Comparison</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Clock className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Package Installation</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>npm</span>
                    <span className="text-red-500 font-mono">~45 seconds</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full w-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Bun</span>
                    <span className="text-primary font-mono">~1.5 seconds</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[3%]"></div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary mt-4">30x Faster</p>
              </div>

              <div className="text-center">
                <HardDrive className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Disk Space</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>npm node_modules</span>
                    <span className="text-red-500 font-mono">~500MB</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full w-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Bun node_modules</span>
                    <span className="text-primary font-mono">~200MB</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[40%]"></div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary mt-4">60% Smaller</p>
              </div>

              <div className="text-center">
                <Terminal className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Script Execution</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Node.js</span>
                    <span className="text-red-500 font-mono">~150ms startup</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full w-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Bun</span>
                    <span className="text-primary font-mono">~25ms startup</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[17%]"></div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary mt-4">6x Faster</p>
              </div>
            </div>
          </div>

          {/* Command Comparison Table */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Command Comparison</CardTitle>
              <CardDescription>Bun is a drop-in replacement. Same commands, just faster.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Action</th>
                      <th className="text-left py-3 px-4 text-red-500">npm</th>
                      <th className="text-left py-3 px-4 text-primary">Bun</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-sans">Install dependencies</td>
                      <td className="py-3 px-4">npm install</td>
                      <td className="py-3 px-4 text-primary">bun install</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-sans">Add a package</td>
                      <td className="py-3 px-4">npm install package</td>
                      <td className="py-3 px-4 text-primary">bun add package</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-sans">Remove a package</td>
                      <td className="py-3 px-4">npm uninstall package</td>
                      <td className="py-3 px-4 text-primary">bun remove package</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-sans">Run a script</td>
                      <td className="py-3 px-4">npm run dev</td>
                      <td className="py-3 px-4 text-primary">bun run dev</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-sans">Run tests</td>
                      <td className="py-3 px-4">npm test</td>
                      <td className="py-3 px-4 text-primary">bun test</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-sans">Execute a file</td>
                      <td className="py-3 px-4">node script.js</td>
                      <td className="py-3 px-4 text-primary">bun script.ts ✨</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                ✨ Bun can run TypeScript files directly without any compilation step!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What's Included</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build a modern web application, pre-configured and ready to use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">🚀</span> Core Stack
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Next.js 16</strong>
                    <p className="text-sm text-muted-foreground">The latest version with App Router, Server Components, and React 19</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Bun Runtime</strong>
                    <p className="text-sm text-muted-foreground">Blazingly fast JavaScript runtime and package manager</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>TypeScript</strong>
                    <p className="text-sm text-muted-foreground">Full type safety with strict mode enabled</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>React 19</strong>
                    <p className="text-sm text-muted-foreground">Latest React with concurrent features and improved performance</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">🎨</span> UI & Styling
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Shadcn/ui</strong>
                    <p className="text-sm text-muted-foreground">Beautiful, accessible components built on Radix UI primitives</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Tailwind CSS 4</strong>
                    <p className="text-sm text-muted-foreground">Utility-first CSS with the latest features and OKLch colors</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Dark Mode</strong>
                    <p className="text-sm text-muted-foreground">System-aware theme switching with next-themes</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Lucide Icons</strong>
                    <p className="text-sm text-muted-foreground">Beautiful, consistent icon set with 1000+ icons</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">🔐</span> Authentication
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>NextAuth.js</strong>
                    <p className="text-sm text-muted-foreground">Complete authentication solution with session management</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Google OAuth</strong>
                    <p className="text-sm text-muted-foreground">Pre-configured Google sign-in (just add your credentials)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Protected Routes</strong>
                    <p className="text-sm text-muted-foreground">Example profile page with authentication guard</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">🛠️</span> Developer Experience
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>React Hook Form + Zod</strong>
                    <p className="text-sm text-muted-foreground">Type-safe form handling with validation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Geist Font</strong>
                    <p className="text-sm text-muted-foreground">Vercel's beautiful font family pre-configured</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Hot Reloading</strong>
                    <p className="text-sm text-muted-foreground">Instant feedback during development</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section id="quickstart" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Start</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get up and running in less than 5 minutes. Follow these simple steps.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Install Bun</h3>
                <p className="text-muted-foreground mb-4">
                  If you don't have Bun installed yet, install it with a single command:
                </p>
                <CodeBlock code="curl -fsSL https://bun.sh/install | bash" />
                <p className="text-sm text-muted-foreground mt-2">
                  On Windows, use PowerShell: <code className="bg-muted px-2 py-1 rounded">powershell -c "irm bun.sh/install.ps1 | iex"</code>
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Clone the Repository</h3>
                <p className="text-muted-foreground mb-4">
                  Clone this boilerplate to your local machine:
                </p>
                <CodeBlock code="git clone https://github.com/hoodini/nextjs-bun-starter.git my-project
cd my-project" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Install Dependencies</h3>
                <p className="text-muted-foreground mb-4">
                  Use Bun to install all dependencies (this takes about 1-2 seconds!):
                </p>
                <CodeBlock code="bun install" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Configure Environment</h3>
                <p className="text-muted-foreground mb-4">
                  Copy the example environment file and add your Google OAuth credentials:
                </p>
                <CodeBlock code="cp .env.example .env.local" />
                <p className="text-sm text-muted-foreground mt-4 mb-2">
                  Then edit <code className="bg-muted px-2 py-1 rounded">.env.local</code> with your credentials:
                </p>
                <CodeBlock code={`GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=generate-a-random-secret
NEXTAUTH_URL=http://localhost:3000`} />
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Start Development Server</h3>
                <p className="text-muted-foreground mb-4">
                  Run the development server and start building:
                </p>
                <CodeBlock code="bun run dev" />
                <p className="text-muted-foreground mt-4">
                  Open <a href="http://localhost:3000" className="text-primary hover:underline">http://localhost:3000</a> in your browser. That's it! 🎉
                </p>
              </div>
            </div>
          </div>

          {/* Google OAuth Setup Guide */}
          <div className="max-w-3xl mx-auto mt-16">
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Setting Up Google OAuth
                </CardTitle>
                <CardDescription>
                  Follow these steps to get your Google OAuth credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                  <li>Create a new project or select an existing one</li>
                  <li>Navigate to <strong>APIs & Services → Credentials</strong></li>
                  <li>Click <strong>Create Credentials → OAuth client ID</strong></li>
                  <li>Select <strong>Web application</strong> as the application type</li>
                  <li>Add <code className="bg-muted px-2 py-0.5 rounded">http://localhost:3000</code> to Authorized JavaScript origins</li>
                  <li>Add <code className="bg-muted px-2 py-0.5 rounded">http://localhost:3000/api/auth/callback/google</code> to Authorized redirect URIs</li>
                  <li>Copy the Client ID and Client Secret to your <code className="bg-muted px-2 py-0.5 rounded">.env.local</code> file</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Something Amazing?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Stop configuring. Start creating. This boilerplate gives you everything you need to ship faster.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="https://github.com/hoodini" target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 mr-2" />
                Get the Code
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <a href="https://yuv.ai" target="_blank" rel="noopener noreferrer">
                Learn More at YUV.AI
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="https://media.licdn.com/dms/image/v2/D4D03AQFAuznqcEJXTA/profile-displayphoto-scale_200_200/B4DZq1DCZpIMAY-/0/1763974088560?e=1769040000&v=beta&t=dRh477jKl4BQ0KqsJUg9X7UkuDDzoWgC68aHLnHDXMk"
                alt="Yuval Avidani"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">Built with ❤️ by Yuval Avidani</p>
                <p className="text-sm text-muted-foreground">Founder of YUV.AI Community</p>
              </div>
            </div>
            <div className="flex gap-6">
              <a href="https://github.com/hoodini" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/%F0%9F%8E%97%EF%B8%8Fyuval-avidani-87081474/" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://yuv.ai" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Auth Button Component
function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
          <AvatarFallback>
            {session.user?.name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:block text-sm">{session.user?.name}</span>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    );
  }

  return <Button onClick={() => signIn('google')} size="sm">Sign In</Button>;
}

// Code Block Component with Copy Button
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-2 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
