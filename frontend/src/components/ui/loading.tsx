import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  label?: string;
  className?: string; // Change bar colors/sizes (e.g., 'bg-blue-500 h-10')
  centered?: boolean;
}

export default function Loading({ 
  label = 'Loading...', 
  className, 
  centered = false 
}: LoadingProps) {
  return (
    <div className=' flex items-center pt-3 justify-center'>
    <div
      role="status"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        centered ? "fixed inset-0 justify-center items-center bg-white/40 dark:bg-black/40 backdrop-blur-md z-50" : "inline-flex"
      )}
    >
      {/* Wave Animation Container */}
      <div className="flex items-center justify-center gap-1.5 h-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-8 rounded-full bg-black dark:bg-white animate-wave",
              className
            )}
            style={{
              // Staggering the start of each bar's animation
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Sleek Text */}
      {label && (
        <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-60 animate-pulse">
          {label}
        </span>
      )}
    </div>
    </div>
  );
}