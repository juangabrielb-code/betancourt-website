"use client";

import React from 'react';
import { Container, Button } from '../ui/UI';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface NavbarProps {
  onNavigate?: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

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

          {/* Auth Button - Placeholder for new auth system */}
          <Button
            variant="glass"
            onClick={() => {/* Login functionality will be implemented */}}
            className="!px-5 !py-2 !text-xs !rounded-full ml-2 hover:bg-j-light-text hover:text-white dark:hover:bg-warm-glow dark:hover:text-black transition-colors"
          >
            {t.nav.login}
          </Button>
        </div>
      </Container>
    </nav>
  );
};
