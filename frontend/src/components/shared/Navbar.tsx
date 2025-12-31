'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Container, Button } from '../ui/UI';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '../auth/AuthModal';

interface NavbarProps {
  onNavigate?: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { session, isAuthenticated, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
  };

  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('top');
    }
  };

  const handleSectionClick = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    setShowUserMenu(false);
  };

  return (
    <nav className="fixed top-0 w-full z-40 border-b border-j-light-text/5 dark:border-white/5 bg-j-light-bg/80 dark:bg-black/40 backdrop-blur-xl transition-colors duration-500">
      <Container className="h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          className="text-xl font-serif font-bold tracking-tight uppercase tracking-widest text-j-light-text dark:text-white mix-blend-difference cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          Betancourt Audio
        </div>

        {/* Navigation Links & Controls */}
        <div className="flex items-center gap-4 text-sm font-medium text-j-light-text/80 dark:text-j-dark-text/90">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-6 mr-2">
            <button
              onClick={() => handleSectionClick('services')}
              className="hover:text-warm-glow transition-colors"
            >
              {t.nav.services}
            </button>
            <button
              onClick={() => handleSectionClick('portfolio')}
              className="hover:text-warm-glow transition-colors"
            >
              {t.nav.portfolio}
            </button>
            <button
              onClick={() => handleSectionClick('contact')}
              className="hover:text-warm-glow transition-colors"
            >
              {t.nav.contact}
            </button>
          </div>

          {/* Language & Theme Toggles */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 transition-all text-xs font-semibold"
              aria-label="Toggle Language"
            >
              <span className={language === 'en' ? 'text-j-light-text dark:text-white' : 'text-j-light-text/50 dark:text-white/50'}>
                EN
              </span>
              <span className="text-j-light-text/30 dark:text-white/30">/</span>
              <span className={language === 'es' ? 'text-j-light-text dark:text-white' : 'text-j-light-text/50 dark:text-white/50'}>
                ES
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-warm-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-j-light-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Auth Section */}
          {isLoading ? (
            <div className="px-5 py-2">
              <svg className="animate-spin h-5 w-5 text-warm-glow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : isAuthenticated && session?.user ? (
            <div className="flex items-center gap-2 ml-2">
              {/* Mi Cuenta Button - Direct link to dashboard */}
              <Link href="/dashboard">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-warm-glow text-white font-medium text-xs hover:opacity-90 transition-all shadow-lg shadow-warm-glow/20">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="hidden sm:inline">Mi Cuenta</span>
                </button>
              </Link>

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 transition-all"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-7 h-7 rounded-full border-2 border-warm-glow/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-warm-glow flex items-center justify-center text-white text-xs font-bold">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <svg
                    className={`w-3 h-3 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-j-light-text/10 dark:border-white/10 py-2 z-50">
                    <div className="px-4 py-2 border-b border-j-light-text/10 dark:border-white/10">
                      <p className="text-sm font-medium text-j-light-text dark:text-j-dark-text truncate">
                        {session.user.name || 'Usuario'}
                      </p>
                      <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60 truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-j-light-text dark:text-j-dark-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>🏠</span> Dashboard
                    </Link>
                    <Link
                      href="/dashboard/proyectos"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-j-light-text dark:text-j-dark-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>📋</span> Mis Proyectos
                    </Link>
                    <Link
                      href="/dashboard/wallet"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-j-light-text dark:text-j-dark-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>💰</span> Wallet
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-j-light-text dark:text-j-dark-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>⚙️</span> Admin Panel
                      </Link>
                    )}
                    <hr className="my-2 border-j-light-text/10 dark:border-white/10" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      <span>🚪</span> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Button
              variant="glass"
              onClick={() => setIsAuthModalOpen(true)}
              className="!px-5 !py-2 !text-xs !rounded-full ml-2 hover:bg-j-light-text hover:text-white dark:hover:bg-warm-glow dark:hover:text-black transition-colors"
            >
              {t.nav?.login || 'Sign In'}
            </Button>
          )}
        </div>
      </Container>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
