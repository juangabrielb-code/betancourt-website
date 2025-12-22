'use client';

import { useEffect, useState } from 'react';

export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = window.scrollY;
      const winHeightPx =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = winHeightPx > 0 ? scrollPx / winHeightPx : 0;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return scrollProgress;
}

