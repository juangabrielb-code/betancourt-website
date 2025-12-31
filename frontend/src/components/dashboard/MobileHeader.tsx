'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export const MobileHeader: React.FC = () => {
  const { session } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-j-light-surface/95 dark:bg-j-dark-surface/95 backdrop-blur-xl border-b border-j-light-text/10 dark:border-white/10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-warm-glow/20 flex items-center justify-center">
            <span className="text-warm-glow font-bold text-lg">B</span>
          </div>
          <span className="font-serif font-bold text-lg text-j-light-text dark:text-j-dark-text">
            Betancourt
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-j-light-text/70 dark:text-j-dark-text/70 hover:bg-j-light-text/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>

          {/* Profile Menu */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-8 h-8 rounded-full border-2 border-warm-glow/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-warm-glow/20 border-2 border-warm-glow/30 flex items-center justify-center text-warm-glow font-semibold text-sm">
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-4 mt-2 w-64 bg-j-light-surface dark:bg-j-dark-surface border border-j-light-text/10 dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-xl z-50 overflow-hidden"
            >
              {/* User Info */}
              <div className="p-4 border-b border-j-light-text/10 dark:border-white/10">
                <p className="text-sm font-semibold text-j-light-text dark:text-j-dark-text truncate">
                  {session?.user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60 truncate">
                  {session?.user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    // Navigate to messages
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-j-light-text/70 dark:text-j-dark-text/70 hover:bg-j-light-text/5 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-lg">💬</span>
                  <span className="text-sm">Mensajes</span>
                  <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-warm-glow/20 text-warm-glow rounded-full">
                    0
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    // Navigate to history
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-j-light-text/70 dark:text-j-dark-text/70 hover:bg-j-light-text/5 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-lg">📊</span>
                  <span className="text-sm">Historial</span>
                </button>
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-j-light-text/10 dark:border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <span className="text-lg">🚪</span>
                  <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
