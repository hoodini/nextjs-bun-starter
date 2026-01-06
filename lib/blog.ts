export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Plain text for TTS
  contentHtml: string; // HTML for rendering
  category: string;
  date: string;
  readingTime: number;
  author: {
    name: string;
    avatar?: string;
  };
}

const posts: BlogPost[] = [
  {
    slug: 'why-we-chose-bun',
    title: 'Why We Chose Bun Over npm for This Boilerplate',
    excerpt: 'Exploring the performance benefits and developer experience improvements that made Bun our package manager of choice.',
    category: 'Engineering',
    date: 'January 5, 2025',
    readingTime: 5,
    author: {
      name: 'Yuval Avidani',
    },
    content: `When building a modern web development boilerplate, every decision matters. The choice of package manager might seem small, but it impacts every developer who uses your template. Here's why we chose Bun.

Speed That Actually Matters

Bun installs packages up to 30x faster than npm. This isn't just a benchmark number — it's time saved on every install, every CI run, every new developer onboarding. When you run bun install, you'll notice the difference immediately.

In our testing, a fresh install of this boilerplate's dependencies takes about 2 seconds with Bun, compared to over 30 seconds with npm. That's not a typo.

Native TypeScript Support

Bun runs TypeScript natively without any compilation step. This means faster development server startup, quicker test runs, and a simpler toolchain. No more waiting for tsc or dealing with complex build configurations just to run your code.

Built-in Bundler and Test Runner

Instead of juggling multiple tools, Bun includes a bundler and test runner out of the box. This reduces dependencies, simplifies configuration, and ensures all your tools work together seamlessly.

The Developer Experience

Beyond raw performance, Bun focuses on developer experience. The CLI is intuitive, error messages are helpful, and the documentation is excellent. It feels like a tool built by developers who understand the daily frustrations of JavaScript development.

Making the Switch

If you're coming from npm or yarn, the transition is smooth. Bun is compatible with existing package.json files and node_modules. You can start using it today without changing your project structure.

The future of JavaScript tooling is fast, and Bun is leading the way.`,
    contentHtml: `
<p>When building a modern web development boilerplate, every decision matters. The choice of package manager might seem small, but it impacts every developer who uses your template. Here's why we chose Bun.</p>

<h2>Speed That Actually Matters</h2>

<p>Bun installs packages up to 30x faster than npm. This isn't just a benchmark number — it's time saved on every <code>install</code>, every CI run, every new developer onboarding.</p>

<p>When you run <code>bun install</code>, you'll notice the difference immediately. In our testing, a fresh install of this boilerplate's dependencies takes about <strong>2 seconds</strong> with Bun, compared to over <strong>30 seconds</strong> with npm.</p>

<p>That's not a typo.</p>

<h2>Native TypeScript Support</h2>

<p>Bun runs TypeScript natively without any compilation step. This means faster development server startup, quicker test runs, and a simpler toolchain.</p>

<p>No more waiting for tsc or dealing with complex build configurations just to run your code.</p>

<h2>Built-in Bundler and Test Runner</h2>

<p>Instead of juggling multiple tools, Bun includes a bundler and test runner out of the box. This reduces dependencies, simplifies configuration, and ensures all your tools work together seamlessly.</p>

<blockquote>
  <p>"The best tool is the one that gets out of your way and lets you focus on building."</p>
</blockquote>

<h2>The Developer Experience</h2>

<p>Beyond raw performance, Bun focuses on developer experience. The CLI is intuitive, error messages are helpful, and the documentation is excellent.</p>

<p>It feels like a tool built by developers who understand the daily frustrations of JavaScript development.</p>

<h2>Making the Switch</h2>

<p>If you're coming from npm or yarn, the transition is smooth. Bun is compatible with existing <code>package.json</code> files and <code>node_modules</code>. You can start using it today without changing your project structure.</p>

<p>The future of JavaScript tooling is fast, and Bun is leading the way.</p>
`,
  },
  {
    slug: 'building-with-shadcn-ui',
    title: 'Building Production UIs with shadcn/ui',
    excerpt: 'How shadcn/ui changed our approach to component libraries and why copy-paste beats npm install.',
    category: 'Design',
    date: 'January 3, 2025',
    readingTime: 4,
    author: {
      name: 'Yuval Avidani',
    },
    content: `Component libraries have always been a trade-off. You get speed and consistency, but you lose control and flexibility. shadcn/ui changes that equation entirely.

The Copy-Paste Philosophy

Unlike traditional component libraries where you npm install and import, shadcn/ui gives you the actual source code. You copy it into your project, and it's yours. Want to modify a button? Just edit the file. No more fighting with CSS overrides or wrapping components in styled wrappers.

This approach means you're never locked in. Your components evolve with your design system, not against it.

Built on Radix UI

Under the hood, shadcn/ui uses Radix UI primitives. This gives you world-class accessibility out of the box. Screen readers, keyboard navigation, focus management — it all just works.

Tailwind CSS Integration

Every component is styled with Tailwind CSS, making customization intuitive. If you know Tailwind, you already know how to customize these components. The utility classes are right there in the code, ready to be tweaked.

The Right Level of Abstraction

shadcn/ui hits the sweet spot between too primitive and too opinionated. The components are complete enough to use immediately but simple enough to understand and modify. You're not fighting a black box.

For this boilerplate, shadcn/ui was the obvious choice. It gives you professional UI components while keeping full control in your hands.`,
    contentHtml: `
<p>Component libraries have always been a trade-off. You get speed and consistency, but you lose control and flexibility. shadcn/ui changes that equation entirely.</p>

<h2>The Copy-Paste Philosophy</h2>

<p>Unlike traditional component libraries where you <code>npm install</code> and import, shadcn/ui gives you the actual source code. You copy it into your project, and it's yours.</p>

<p>Want to modify a button? Just edit the file. No more fighting with CSS overrides or wrapping components in styled wrappers.</p>

<p>This approach means you're never locked in. Your components evolve with your design system, not against it.</p>

<h2>Built on Radix UI</h2>

<p>Under the hood, shadcn/ui uses Radix UI primitives. This gives you world-class accessibility out of the box.</p>

<p>Screen readers, keyboard navigation, focus management — it all just works.</p>

<h2>Tailwind CSS Integration</h2>

<p>Every component is styled with Tailwind CSS, making customization intuitive. If you know Tailwind, you already know how to customize these components.</p>

<p>The utility classes are right there in the code, ready to be tweaked.</p>

<h2>The Right Level of Abstraction</h2>

<p>shadcn/ui hits the sweet spot between too primitive and too opinionated. The components are complete enough to use immediately but simple enough to understand and modify.</p>

<p>You're not fighting a black box.</p>

<p>For this boilerplate, shadcn/ui was the obvious choice. It gives you professional UI components while keeping full control in your hands.</p>
`,
  },
  {
    slug: 'nextjs-14-app-router',
    title: 'Next.js 14 and the App Router: A Practical Guide',
    excerpt: 'Everything you need to know about building with Next.js 14 App Router in production.',
    category: 'Framework',
    date: 'January 1, 2025',
    readingTime: 6,
    author: {
      name: 'Yuval Avidani',
    },
    content: `Next.js 14 represents the maturation of the App Router. After months of improvements, it's now ready for production use. Here's what you need to know.

Server Components by Default

In the App Router, components are Server Components by default. This means they render on the server, reducing the JavaScript sent to the client. Your pages load faster, and your users are happier.

When you need interactivity, add 'use client' at the top of your file. It's explicit and intentional.

Simplified Data Fetching

Gone are getServerSideProps and getStaticProps. Now you just fetch data directly in your components using async/await. The mental model is simpler, and the code is cleaner.

Layouts and Templates

The App Router introduces a powerful layouts system. Define a layout once, and it wraps all child routes. Combined with loading states and error boundaries, you can build sophisticated UIs with minimal boilerplate.

Streaming and Suspense

Next.js 14 fully embraces React Suspense. Pages stream to the browser piece by piece, showing content as it becomes available. No more waiting for the entire page to load.

Production Ready

With Next.js 14, the App Router is stable and performant. The rough edges have been smoothed, the bugs have been fixed, and the documentation is comprehensive. It's time to build.`,
    contentHtml: `
<p>Next.js 14 represents the maturation of the App Router. After months of improvements, it's now ready for production use. Here's what you need to know.</p>

<h2>Server Components by Default</h2>

<p>In the App Router, components are Server Components by default. This means they render on the server, reducing the JavaScript sent to the client.</p>

<p>Your pages load faster, and your users are happier.</p>

<p>When you need interactivity, add <code>'use client'</code> at the top of your file. It's explicit and intentional.</p>

<h2>Simplified Data Fetching</h2>

<p>Gone are <code>getServerSideProps</code> and <code>getStaticProps</code>. Now you just fetch data directly in your components using async/await.</p>

<p>The mental model is simpler, and the code is cleaner.</p>

<h2>Layouts and Templates</h2>

<p>The App Router introduces a powerful layouts system. Define a layout once, and it wraps all child routes.</p>

<p>Combined with loading states and error boundaries, you can build sophisticated UIs with minimal boilerplate.</p>

<h2>Streaming and Suspense</h2>

<p>Next.js 14 fully embraces React Suspense. Pages stream to the browser piece by piece, showing content as it becomes available.</p>

<p>No more waiting for the entire page to load.</p>

<h2>Production Ready</h2>

<p>With Next.js 14, the App Router is stable and performant. The rough edges have been smoothed, the bugs have been fixed, and the documentation is comprehensive.</p>

<p>It's time to build.</p>
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getAllSlugs(): string[] {
  return posts.map((post) => post.slug);
}
