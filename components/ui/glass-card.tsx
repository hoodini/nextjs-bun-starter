import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = 'dark',
  hover = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl backdrop-blur-md',
        variant === 'light'
          ? 'bg-white/60 dark:bg-white/5 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
          : 'bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
        hover && 'transition-all duration-300 hover:scale-[1.02] cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
