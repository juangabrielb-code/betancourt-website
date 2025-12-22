'use client';

import { useScrollProgress } from '@/hooks/useScrollProgress';

export function ScrollProgressBar() {
  const scrollProgress = useScrollProgress();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out"
        style={{
          width: `${scrollProgress * 100}%`,
        }}
      />
    </div>
  );
}

