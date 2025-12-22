'use client';

import { useEffect, useState } from 'react';

export function CursorFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number;

    const updateCursor = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        setIsVisible(true);
      });
    };

    const checkAudioTrack = (target: HTMLElement | null): boolean => {
      if (!target) return false;
      return (
        target.closest('.audio-track') !== null ||
        target.classList.contains('audio-track')
      );
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(checkAudioTrack(target));
    };

    window.addEventListener('mousemove', updateCursor);
    document.addEventListener('mousemove', handleMouseMove, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mousemove', handleMouseMove, true);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference transition-all duration-300 ease-out ${
        isHovering ? 'scale-150' : 'scale-100'
      }`}
      style={{
        transform: `translate(${position.x - 8}px, ${position.y - 8}px)`,
        willChange: 'transform',
      }}
    >
      <div
        className={`h-4 w-4 rounded-full bg-white transition-all duration-300 ${
          isHovering
            ? 'bg-opacity-100 shadow-lg shadow-purple-500/50'
            : 'bg-opacity-30'
        }`}
      />
    </div>
  );
}

