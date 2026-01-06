import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js + Bun Starter | Production-Ready Boilerplate",
  description: "The ultimate Next.js starter kit with Bun, Shadcn/ui, Tailwind CSS, and Google Authentication. Built by Yuval Avidani, founder of YUV.AI. Ship faster with this production-ready boilerplate.",
  keywords: ["Next.js", "Bun", "Shadcn", "Tailwind CSS", "Google Auth", "NextAuth", "Boilerplate", "Starter Kit", "React", "TypeScript"],
  authors: [{ name: "Yuval Avidani", url: "https://yuv.ai" }],
  openGraph: {
    title: "Next.js + Bun Starter | Production-Ready Boilerplate",
    description: "Stop wasting time on setup. Start building with Bun (30x faster than npm), Next.js 16, Shadcn/ui, and Google Auth - all pre-configured.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js + Bun Starter | Production-Ready Boilerplate",
    description: "Stop wasting time on setup. Start building with Bun (30x faster than npm), Next.js 16, Shadcn/ui, and Google Auth.",
    creator: "@yuvalav",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}