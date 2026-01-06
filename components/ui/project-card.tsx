'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Brain, Code2, Database, Mic, TestTube, BarChart3, LucideIcon } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
  href?: string;
  className?: string;
  icon?: LucideIcon;
  gradient?: 'pink' | 'blue' | 'orange' | 'purple' | 'teal' | 'brand';
}

const gradientStyles = {
  pink: 'from-[#FF4D8E] to-[#8B5CF6]',
  blue: 'from-[#3B82F6] to-[#00C2FF]',
  orange: 'from-[#FF9100] to-[#FF4D8E]',
  purple: 'from-[#8B5CF6] to-[#00C2FF]',
  teal: 'from-[#14B8A6] to-[#06B6D4]',
  brand: 'from-[#FF4D8E] via-[#8B5CF6] to-[#00C2FF]',
};

export function ProjectCard({
  title,
  description,
  tags,
  thumbnail,
  href,
  className,
  icon: Icon,
  gradient = 'brand',
}: ProjectCardProps) {
  const CardWrapper = href ? 'a' : 'div';

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] group hover:scale-[1.02] transition-all duration-300',
        className
      )}
    >
      <CardWrapper
        href={href}
        target={href ? '_blank' : undefined}
        rel={href ? 'noopener noreferrer' : undefined}
        className="block"
      >
        {/* Gradient Thumbnail Area */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={cn(
              'w-full h-full bg-gradient-to-br flex items-center justify-center relative',
              gradientStyles[gradient]
            )}>
              {/* Dot pattern overlay */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id={`dots-${title.replace(/\s+/g, '-')}`} width="8" height="8" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="0.5" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill={`url(#dots-${title.replace(/\s+/g, '-')})`} />
                </svg>
              </div>

              {/* Center Icon */}
              {Icon ? (
                <Icon className="w-14 h-14 text-white/90 transition-transform duration-300 group-hover:scale-110 relative z-10" />
              ) : (
                <div className="relative">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-16 h-16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50 10C35 10 25 25 25 40C25 50 30 58 38 63C30 68 25 78 25 88C35 85 45 78 50 68C55 78 65 85 75 88C75 78 70 68 62 63C70 58 75 50 75 40C75 25 65 10 50 10Z"
                      fill="white"
                      fillOpacity="0.9"
                    />
                  </svg>
                </div>
              )}
            </div>
          )}
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Content Area */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#FF4D8E] transition-colors duration-200">
            {title}
          </h3>
          <p className="text-sm text-white/60 line-clamp-2 mb-4">
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FF4D8E] text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </CardWrapper>
    </div>
  );
}

export { Brain, Code2, Database, Mic, TestTube, BarChart3 };
