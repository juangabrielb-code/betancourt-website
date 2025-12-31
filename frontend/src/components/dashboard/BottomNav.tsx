'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/types/dashboard';
import { motion } from 'framer-motion';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  // Primary 5 navigation items for mobile
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: '🏠',
      href: '/dashboard',
    },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: '📋',
      href: '/dashboard/proyectos',
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: '💰',
      href: '/dashboard/wallet',
    },
    {
      id: 'sessions',
      label: 'Sesión',
      icon: '📅',
      href: '/dashboard/sesiones',
    },
    {
      id: 'settings',
      label: 'Config',
      icon: '⚙️',
      href: '/dashboard/configuracion',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-j-light-surface/95 dark:bg-j-dark-surface/95 backdrop-blur-xl border-t border-j-light-text/10 dark:border-white/10 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.id} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`
                  flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'text-warm-glow'
                    : 'text-j-light-text/60 dark:text-j-dark-text/60'
                  }
                `}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActive"
                    className="absolute bottom-0 w-12 h-1 bg-warm-glow rounded-t-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
