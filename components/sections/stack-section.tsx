'use client';

import Image from 'next/image';

export function StackSection() {
  return (
    <section className="py-20 bg-background dark:bg-[#1C1C1E]">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tech Stack
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built with modern technologies for blazing-fast performance and developer experience
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative rounded-2xl overflow-hidden max-w-md bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-2">
            <Image
              src="https://cdn.hailuoai.video/moss/prod/2026-01-06-18/user/multi_chat_file/1767693880950248428-304191379171532808_1767693879.jpg"
              alt="Tech Stack - Next.js, Bun, TypeScript, Tailwind CSS, Shadcn/ui"
              width={400}
              height={800}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
