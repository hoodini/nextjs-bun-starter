# Next.js + Bun Boilerplate

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![Bun](https://img.shields.io/badge/Bun-Runtime-orange?style=for-the-badge&logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

[![npm version](https://img.shields.io/npm/v/create-yuv-bun-app?style=for-the-badge&logo=npm&label=create-yuv-bun-app)](https://www.npmjs.com/package/create-yuv-bun-app)
[![npm downloads](https://img.shields.io/npm/dm/create-yuv-bun-app?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/create-yuv-bun-app)

### A production-ready boilerplate to ship your next project 30x faster

**This is a starting point, not a finished product. Clone it, customize it, make it yours.**

**Install in seconds:** `bun create yuv-bun-app my-project`

[Live Demo](https://nextjs-bun-starter.vercel.app) | [npm Package](https://www.npmjs.com/package/create-yuv-bun-app) | [Report Bug](https://github.com/hoodini/nextjs-bun-starter/issues)

<img src="https://cdn.hailuoai.video/moss/prod/2026-01-06-18/user/multi_chat_file/1767693880950248428-304191379171532808_1767693879.jpg" alt="Tech Stack - Next.js, Bun, TypeScript, Tailwind CSS, Shadcn/ui" width="400">

</div>

---

## What Is This?

This is a **boilerplate** — a pre-configured starting point for your Next.js projects. Instead of spending hours setting up authentication, dark mode, UI components, and tooling, you get all of that out of the box.

**Use it to build:**
- SaaS applications
- Landing pages
- Web applications
- Admin dashboards
- Portfolios
- MVPs and prototypes

**Then customize it for your specific needs.** The whole point is to give you a foundation so you can focus on building your unique product.

---

## Why This Stack?

Every technology in this boilerplate was chosen deliberately. Here's the reasoning:

| Technology | Why We Use It |
|------------|---------------|
| **Bun** | 30x faster package installs, native TypeScript support, built-in bundler. Drop-in npm replacement. |
| **Next.js 16** | App Router, React Server Components, React 19 — the most production-ready React framework. |
| **Shadcn/ui** | Beautiful, accessible components you own. Not a dependency — copy-paste code you can modify freely. |
| **Tailwind CSS 4** | Utility-first styling with OKLch colors. Build any design directly in markup. |
| **Google Auth** | Pre-configured OAuth with NextAuth.js. Session management and protected routes work out of the box. |
| **Lucide Icons** | 1000+ consistent, beautiful icons. Tree-shakeable, so you only ship what you use. |
| **Dark Mode** | System-aware theme switching with next-themes. Works on first load. |

---

## Bun vs npm: The Performance Difference

Bun is a drop-in replacement for npm. Same commands, same packages, just faster:

| Metric | npm | Bun | Improvement |
|--------|-----|-----|-------------|
| Package Installation | ~45 seconds | ~1.5 seconds | **30x faster** |
| Disk Space | ~500MB | ~200MB | **60% smaller** |
| Script Execution | ~150ms startup | ~25ms startup | **6x faster** |

### Command Comparison

```bash
# Same commands, just replace 'npm' with 'bun'
npm install       → bun install
npm run dev       → bun run dev
npm run build     → bun run build
npx tsx file.ts   → bun file.ts    # TypeScript runs directly!
```

---

## Quick Start

### One-Line Installation (Recommended)

```bash
bun create yuv-bun-app my-project
```

Works with any package manager:
```bash
bun create yuv-bun-app my-project   # Recommended
npm create yuv-bun-app my-project   # Also works
pnpm create yuv-bun-app my-project  # Also works
yarn create yuv-bun-app my-project  # Also works
```

### Manual Installation

```bash
# 1. Clone the repository
git clone https://github.com/hoodini/nextjs-bun-starter.git my-project
cd my-project

# 2. Install dependencies (~1.5 seconds with Bun!)
bun install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Configure Google OAuth (see below)

# 5. Start development
bun run dev
```

### Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy credentials to `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

---

## Customization Guide

**This boilerplate is meant to be customized.** Here's what you should change:

### 1. Branding & Colors
Edit `app/globals.css` to update the color scheme:
```css
@theme {
  --color-primary: oklch(0.7 0.2 340);  /* Your brand color */
}
```

### 2. Page Content
Replace the landing page sections in `app/page.tsx` with your own content. All sections are modular.

### 3. Authentication
Add more providers in `app/api/auth/[...nextauth]/route.ts`:
```typescript
import GithubProvider from "next-auth/providers/github"

providers: [
  GoogleProvider({ ... }),
  GithubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  }),
]
```

### 4. Database (Optional)
This boilerplate doesn't include a database by default. We recommend:
- **Prisma + PostgreSQL** for traditional apps
- **Supabase** for serverless with built-in auth
- **Drizzle + Turso** for edge deployments

### 5. Add More UI Components
```bash
bunx shadcn@latest add dialog
bunx shadcn@latest add toast
bunx shadcn@latest add table
```

---

## AI-Assisted Customization Prompt

Copy this prompt into Claude, ChatGPT, or your favorite AI to get personalized help:

```
I'm building a [describe your app: SaaS, landing page, dashboard, etc.].

I'm using the Next.js + Bun boilerplate. Help me customize it:

1. App Name: [Your App Name]
2. Primary Purpose: [What does your app do?]
3. Target Users: [Who is this for?]
4. Key Features Needed:
   - [Feature 1]
   - [Feature 2]
   - [Feature 3]
5. Color Scheme: [Primary color hex or describe the vibe]
6. Authentication: [Google only / Add GitHub / Email-password]
7. Database: [None / Prisma + PostgreSQL / Supabase]

Please help me:
- Update the landing page content
- Modify the color scheme in globals.css
- Add any additional components I need
- Set up the database schema if needed
```

---

## Project Structure

```
my-project/
├── app/
│   ├── api/auth/[...nextauth]/   # Auth API routes
│   ├── profile/                   # Protected profile page
│   ├── globals.css                # Global styles & theme
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Homepage (replace this!)
│   └── providers.tsx              # Theme & Session providers
├── components/
│   ├── layout/                    # Navbar, Footer
│   ├── sections/                  # Page sections
│   └── ui/                        # Shadcn components
├── lib/
│   └── utils.ts                   # Utility functions
├── .env.example                   # Environment template
└── package.json                   # Dependencies
```

---

## Available Scripts

```bash
bun run dev      # Start development server
bun run build    # Create production build
bun run start    # Start production server
bun run lint     # Run ESLint
bun test         # Run tests (Bun's built-in test runner)
```

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hoodini/nextjs-bun-starter)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
4. Update Google OAuth redirect URI for production

### Other Platforms

Works on any platform that supports Node.js:
- Netlify
- Railway
- Render
- Docker

---

## Features Included

### Core
- [x] Next.js 16 with App Router
- [x] React 19
- [x] TypeScript (strict mode)
- [x] Bun runtime

### UI
- [x] Shadcn/ui components
- [x] Tailwind CSS 4
- [x] Lucide Icons
- [x] Dark/Light mode
- [x] Responsive design
- [x] Geist font

### Auth
- [x] NextAuth.js
- [x] Google OAuth
- [x] Protected routes
- [x] Session management

### DX
- [x] React Hook Form + Zod
- [x] ESLint configured
- [x] Fast refresh with Turbopack

---

## Contributing

Contributions welcome! Please read the [Contributing Guide](CONTRIBUTING.md).

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## About the Creator

<div align="center">

<img src="https://cdn.hailuoai.video/moss/prod/2026-01-01-02/user/multi_chat_file/1767204442417679023-304191379171532808_1767204439.jpg" alt="Yuval Avidani" width="100" style="border-radius: 50%">

**Yuval Avidani**

AWS AI Superstar | GitHub Star | Founder of YUV.AI

[![Website](https://img.shields.io/badge/Website-yuv.ai-blue?style=flat-square)](https://yuv.ai)
[![GitHub](https://img.shields.io/badge/GitHub-hoodini-black?style=flat-square&logo=github)](https://github.com/hoodini)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-yuval--avidani-0077b5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/%F0%9F%8E%97%EF%B8%8Fyuval-avidani-87081474/)

</div>

---

<div align="center">

**Built with care by [Yuval Avidani](https://yuv.ai)**

If this helped you ship faster, consider [starring the repo](https://github.com/hoodini/nextjs-bun-starter)

</div>
