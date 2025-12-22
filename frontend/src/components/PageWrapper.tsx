'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollProgressBar } from './ScrollProgressBar';
import { CursorFollower } from './CursorFollower';

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      // Pequeño delay para asegurar que el contenido se renderice antes de mostrar
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <>
      <ScrollProgressBar />
      <CursorFollower />
      <div
        className={`min-h-screen page-transition transition-opacity duration-300 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {displayChildren}
      </div>
    </>
  );
}

