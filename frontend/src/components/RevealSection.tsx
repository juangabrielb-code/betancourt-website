'use client';

import { useViewportDetection } from '@/hooks/useViewportDetection';
import { ReactNode } from 'react';

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function RevealSection({
  children,
  className = '',
  delay = 0,
}: RevealSectionProps) {
  const { ref, isVisible } = useViewportDetection();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

