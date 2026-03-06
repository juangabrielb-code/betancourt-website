'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/admin' },
  { id: 'portfolio', label: 'Portafolio', icon: '🎵', href: '/admin/portfolio' },
  { id: 'services', label: 'Servicios', icon: '💰', href: '/admin/services' },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { session } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-j-light-surface/80 dark:bg-j-dark-surface/80 backdrop-blur-2xl border-r border-j-light-text/10 dark:border-white/10 z-40">
      {/* Header */}
      <div className="p-6 border-b border-j-light-text/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warm-glow/20 border border-warm-glow/30 flex items-center justify-center text-warm-glow text-lg font-bold">
            ⚙️
          </div>
          <div>
            <p className="text-sm font-bold text-j-light-text dark:text-j-dark-text">Admin Console</p>
            <p className="text-xs text-j-light-text/50 dark:text-j-dark-text/50 truncate max-w-[140px]">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);

          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'bg-warm-glow/20 text-warm-glow shadow-sm'
                    : 'text-j-light-text/70 dark:text-j-dark-text/70 hover:bg-j-light-text/5 dark:hover:bg-white/5 hover:text-j-light-text dark:hover:text-j-dark-text'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminActiveTab"
                    className="absolute left-0 w-1 h-8 bg-warm-glow rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-j-light-text/10 dark:border-white/10 mt-4">
          <Link href="/">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-j-light-text/50 dark:text-j-dark-text/50 hover:text-j-light-text dark:hover:text-j-dark-text transition-all"
            >
              <span className="text-xl">🌐</span>
              <span className="text-sm font-medium">Ver sitio</span>
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-j-light-text/10 dark:border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-j-light-text/70 dark:text-j-dark-text/70 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <span className="text-xl">🚪</span>
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
