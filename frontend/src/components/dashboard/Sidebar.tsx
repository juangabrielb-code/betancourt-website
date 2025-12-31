'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import { NavItem } from '@/types/dashboard';
import { motion } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { session } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: '🏠',
      href: '/dashboard',
    },
    {
      id: 'projects',
      label: 'Mis Proyectos',
      icon: '📋',
      href: '/dashboard/proyectos',
    },
    {
      id: 'wallet',
      label: 'Wallet / Pagos',
      icon: '💰',
      href: '/dashboard/wallet',
    },
    {
      id: 'sessions',
      label: 'Agendar Sesión',
      icon: '📅',
      href: '/dashboard/sesiones',
    },
    {
      id: 'messages',
      label: 'Mensajes',
      icon: '💬',
      href: '/dashboard/mensajes',
      badge: 0, // Future: connect to real notification count
    },
    {
      id: 'history',
      label: 'Historial',
      icon: '📊',
      href: '/dashboard/historial',
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: '⚙️',
      href: '/dashboard/configuracion',
    },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-j-light-surface/80 dark:bg-j-dark-surface/80 backdrop-blur-2xl border-r border-j-light-text/10 dark:border-white/10">
      {/* Profile Section */}
      <div className="p-6 border-b border-j-light-text/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-12 h-12 rounded-full border-2 border-warm-glow/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-warm-glow/20 border-2 border-warm-glow/30 flex items-center justify-center text-warm-glow font-semibold text-lg">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-j-light-text dark:text-j-dark-text truncate">
              {session?.user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'bg-warm-glow/20 text-warm-glow dark:text-warm-glow shadow-sm'
                    : 'text-j-light-text/70 dark:text-j-dark-text/70 hover:bg-j-light-text/5 dark:hover:bg-white/5 hover:text-j-light-text dark:hover:text-j-dark-text'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-warm-glow rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium flex-1">{item.label}</span>

                {/* Badge for notifications */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-warm-glow text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-j-light-text/10 dark:border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-j-light-text/70 dark:text-j-dark-text/70 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300"
        >
          <span className="text-xl">🚪</span>
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
