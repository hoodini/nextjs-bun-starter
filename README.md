# ⚡ Next.js + Bun Starter Kit

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![Bun](https://img.shields.io/badge/Bun-Runtime-orange?style=for-the-badge&logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

[![npm version](https://img.shields.io/npm/v/create-yuv-app?style=for-the-badge&logo=npm&label=create-yuv-app)](https://www.npmjs.com/package/create-yuv-app)
[![npm downloads](https://img.shields.io/npm/dm/create-yuv-app?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/create-yuv-app)

**The ultimate production-ready Next.js starter kit with Bun, Shadcn/ui, Tailwind CSS, and Google Authentication.**

**Install in seconds:** `bun create yuv-app my-project`

[Demo](https://nextjs-bun-starter.vercel.app) • [npm Package](https://www.npmjs.com/package/create-yuv-app) • [Report Bug](https://github.com/hoodini/nextjs-bun-starter/issues)

### Tech Stack

<img src="https://cdn.hailuoai.video/moss/prod/2026-01-06-18/user/multi_chat_file/1767693880950248428-304191379171532808_1767693879.jpg" alt="Tech Stack - Next.js, Bun, TypeScript, Tailwind CSS, Shadcn/ui" width="100%">

</div>

---

## 📋 Table of Contents

- [Why This Boilerplate?](#-why-this-boilerplate)
- [Bun vs npm](#-bun-vs-npm-why-bun-wins)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Available Scripts](#-available-scripts)
- [Adding New Components](#-adding-new-components)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [About the Creator](#-about-the-creator)

---

## 🎯 Why This Boilerplate?

Stop wasting hours configuring your Next.js project. This starter kit gives you:

- ⚡ **Blazing Fast Development** - Bun is 30x faster than npm for package installation
- 🎨 **Beautiful UI Out of the Box** - Pre-configured Shadcn/ui components with Tailwind CSS
- 🔐 **Authentication Ready** - Google OAuth with NextAuth.js already set up
- 🌙 **Dark Mode Built-in** - System-aware theme switching
- 📱 **Fully Responsive** - Mobile-first design that works everywhere
- 🔒 **TypeScript Native** - Complete type safety with strict mode
- 🚀 **Production Ready** - Optimized build configuration and best practices

**Perfect for:**
- SaaS applications
- Landing pages
- Web applications
- Portfolios
- MVP development

---

## ⚡ Bun vs npm: Why Bun Wins

### What is npm?

**npm (Node Package Manager)** is the default package manager that comes with Node.js. Released in 2010, it's been the standard for over a decade.

**Pros:**
- Massive ecosystem with millions of packages
- Well-documented and widely understood
- Industry standard

**Cons:**
- ❌ Slow installation speeds
- ❌ Large node_modules folder sizes
- ❌ Requires separate runtime (Node.js)

### What is Bun?

**Bun** is an all-in-one JavaScript runtime that includes a package manager, bundler, and test runner. Built with Zig and JavaScriptCore, it's designed for speed from the ground up.

**Pros:**
- ✅ **30x faster** package installation than npm
- ✅ Native TypeScript & JSX support (no transpilation needed)
- ✅ Built-in bundler, test runner, and hot reloading
- ✅ Drop-in npm replacement (100% compatible)
- ✅ 60% smaller disk footprint
- ✅ 6x faster script execution

### Performance Comparison

| Metric | npm | Bun | Winner |
|--------|-----|-----|--------|
| **Package Installation** | ~45 seconds | ~1.5 seconds | 🏆 **Bun (30x faster)** |
| **Disk Space** | ~500MB | ~200MB | 🏆 **Bun (60% smaller)** |
| **Script Execution** | ~150ms startup | ~25ms startup | 🏆 **Bun (6x faster)** |

### Command Comparison

Bun is a drop-in replacement for npm. Same commands, just faster:

| Action | npm | Bun |
|--------|-----|-----|
| Install dependencies | `npm install` | `bun install` |
| Add a package | `npm install package` | `bun add package` |
| Remove a package | `npm uninstall package` | `bun remove package` |
| Run a script | `npm run dev` | `bun run dev` |
| Run tests | `npm test` | `bun test` |
| Execute a file | `node script.js` | `bun script.ts` ✨ |

✨ *Bun can run TypeScript files directly without any compilation step!*

---

## ✨ Features

### 🚀 Core Stack

- **[Next.js 16](https://nextjs.org/)** - The latest version with App Router, Server Components, and React 19
- **[Bun](https://bun.sh/)** - Blazingly fast JavaScript runtime and package manager
- **[TypeScript](https://www.typescriptlang.org/)** - Full type safety with strict mode enabled
- **[React 19](https://react.dev/)** - Latest React with concurrent features and improved performance

### 🎨 UI & Styling

- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components built on Radix UI primitives
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS with the latest features and OKLch colors
- **[Dark Mode](https://github.com/pacocoursey/next-themes)** - System-aware theme switching with next-themes
- **[Lucide Icons](https://lucide.dev/)** - Beautiful, consistent icon set with 1000+ icons
- **[Geist Font](https://vercel.com/font)** - Vercel's beautiful font family pre-configured

### 🔐 Authentication

- **[NextAuth.js](https://next-auth.js.org/)** - Complete authentication solution with session management
- **Google OAuth** - Pre-configured Google sign-in (just add your credentials)
- **Protected Routes** - Example profile page with authentication guard
- **Session Management** - Server and client-side session handling

### 🛠️ Developer Experience

- **[React Hook Form](https://react-hook-form.com/)** - Performant form handling
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **Hot Reloading** - Instant feedback during development with Turbopack
- **ESLint & Prettier Ready** - Code quality and formatting tools configured
- **Git Hooks Ready** - Pre-commit hooks for code quality

### 📦 Pre-configured Shadcn Components

The following Shadcn/ui components are already installed and ready to use:

- Avatar
- Button
- Card
- Dropdown Menu
- Form
- Input
- Label
- Mode Toggle (Custom)
- Separator

[Browse all available components](https://ui.shadcn.com/docs/components)

---

## 🚀 Quick Start

### ⚡ One-Line Installation (Recommended)

The fastest way to get started - everything is automatically set up for you:

```bash
bun create yuv-app my-project
```

**Works with all package managers:**

```bash
# With Bun (Recommended - 30x faster)
bun create yuv-app my-project

# With npm
npm create yuv-app my-project

# With pnpm
pnpm create yuv-app my-project

# With Yarn
yarn create yuv-app my-project
```

> **Note:** This uses the [`create-yuv-app`](https://www.npmjs.com/package/create-yuv-app) package from npm.

Then just:
```bash
cd my-project
bun run dev
```

🎉 **That's it!** Your app is ready at [http://localhost:3000](http://localhost:3000)

---

### 📝 Manual Installation

If you prefer to clone manually:

#### 1. Install Bun

If you don't have Bun installed yet:

**Linux/macOS:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### 2. Clone the Repository

```bash
git clone https://github.com/hoodini/nextjs-bun-starter.git my-project
cd my-project
```

#### 3. Install Dependencies

```bash
bun install
```

This takes about **1-2 seconds** (compared to 30-45 seconds with npm)!

---

### 🔐 Configure Authentication (Required)

Whether you used the one-line installer or cloned manually, you need to set up Google OAuth:

#### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your credentials:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**Generate a random secret:**
```bash
openssl rand -base64 32
```

#### 2. Set Up Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Select **Web application** as the application type
6. Add the following URIs:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret** to your `.env.local` file

#### 3. Start Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## 📁 Project Structure

```
nextjs-bun-starter/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth API routes
│   ├── profile/
│   │   └── page.tsx                  # Protected profile page
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── providers.tsx                 # Client providers (Theme, Session)
├── components/
│   └── ui/                           # Shadcn/ui components
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── mode-toggle.tsx           # Dark mode toggle
│       └── separator.tsx
├── lib/
│   └── utils.ts                      # Utility functions
├── public/                           # Static assets
├── .env.example                      # Environment variables template
├── .env.local                        # Your environment variables (gitignored)
├── components.json                   # Shadcn/ui configuration
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies
├── tailwind.config.ts                # Tailwind CSS configuration
└── tsconfig.json                     # TypeScript configuration
```

---

## ⚙️ Configuration

### Adding New Shadcn Components

This project uses [Shadcn/ui](https://ui.shadcn.com/) for components. To add a new component:

```bash
bunx shadcn@latest add [component-name]
```

**Examples:**
```bash
bunx shadcn@latest add dialog
bunx shadcn@latest add toast
bunx shadcn@latest add table
```

[View all available components](https://ui.shadcn.com/docs/components)

### Customizing Theme

Edit `app/globals.css` to customize your color scheme:

```css
@theme {
  --color-primary: oklch(0.7 0.2 250);  /* Change primary color */
  --color-secondary: oklch(0.6 0.15 200);
  /* ... more colors */
}
```

### Adding More OAuth Providers

Edit `app/api/auth/[...nextauth]/route.ts`:

```typescript
import GithubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add more providers
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  // ... rest of config
}
```

---

## 📜 Available Scripts

```bash
# Development
bun run dev          # Start development server with hot reloading

# Building
bun run build        # Create production build
bun run start        # Start production server

# Linting
bun run lint         # Run ESLint

# Testing (when configured)
bun test            # Run tests with Bun's built-in test runner
```

---

## 🎨 Adding New Components

### Example: Creating a Custom Component

1. **Create the component file:**

```tsx
// components/my-component.tsx
import { Button } from "@/components/ui/button"

export function MyComponent() {
  return (
    <div className="p-6 rounded-lg border">
      <h2 className="text-2xl font-bold mb-4">My Component</h2>
      <Button>Click me</Button>
    </div>
  )
}
```

2. **Use it in your page:**

```tsx
// app/page.tsx
import { MyComponent } from "@/components/my-component"

export default function Page() {
  return <MyComponent />
}
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hoodini/nextjs-bun-starter)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
4. Deploy!

**Important:** Update your Google OAuth redirect URIs to include your production URL:
- `https://your-domain.com/api/auth/callback/google`

### Deploy to Other Platforms

This is a standard Next.js application and can be deployed to:
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)
- [Render](https://render.com)
- Any platform that supports Node.js or Docker

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 About the Creator

<div align="center">

<img src="https://cdn.hailuoai.video/moss/prod/2026-01-01-02/user/multi_chat_file/1767204442417679023-304191379171532808_1767204439.jpg" alt="Yuval Avidani" width="120" height="120" style="border-radius: 50%">

### Yuval Avidani

**AWS AI Superstar • GitHub Star • Founder of YUV.AI Community**

AI Builder & Speaker passionate about making AI practical, personal, and powerful. With 2 decades of experience in tech across development, research, and cybersecurity.

[![Website](https://img.shields.io/badge/Website-yuv.ai-blue?style=for-the-badge)](https://yuv.ai)
[![GitHub](https://img.shields.io/badge/GitHub-hoodini-black?style=for-the-badge&logo=github)](https://github.com/hoodini)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Yuval_Avidani-0077b5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/%F0%9F%8E%97%EF%B8%8Fyuval-avidani-87081474/)
[![Twitter](https://img.shields.io/badge/Twitter-@yuvalav-1da1f2?style=for-the-badge&logo=twitter)](https://x.com/yuvalav)

</div>

---

## 💖 Support

If this boilerplate helped you ship faster, consider:

- ⭐ Starring this repository
- 🐛 Reporting bugs or suggesting features
- 📢 Sharing it with other developers
- ☕ [Buy me a coffee](https://buymeacoffee.com/yuvalav)

---

<div align="center">

**Built with ❤️ by [Yuval Avidani](https://yuv.ai)**

🤖 *Generated with [Claude Code](https://claude.com/claude-code)*

</div>
