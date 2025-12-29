'use client';

/**
 * AuthModal Component
 *
 * Modal container for authentication forms following CheckoutModal pattern.
 * Supports multiple views: Login, Register, Forgot Password
 *
 * Features:
 * - Framer Motion animations
 * - GlassCard design
 * - Multi-view state management
 * - Responsive layout
 *
 * Related: BET-19 (Frontend UI)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/UI';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type AuthView = 'login' | 'register' | 'forgotPassword';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: AuthView;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultView = 'login',
  onAuthSuccess
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(defaultView);

  // Reset to default view when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView(defaultView);
    }
  }, [isOpen, defaultView]);

  if (!isOpen) return null;

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
    onClose();
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleForgotPassword = () => {
    setCurrentView('forgotPassword');
  };

  return (
    <AnimatePresence>
      {/* Overlay Container - Optimizado para centrado vertical */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-j-dark-bg/80 dark:bg-black/80 backdrop-blur-sm"
        />

        {/* Centering Container con padding responsivo */}
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md my-8"
          >
            <GlassCard className="overflow-hidden shadow-2xl">
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={onClose}
                  className="text-j-light-text/50 hover:text-warm-glow dark:text-j-dark-text/50 dark:hover:text-warm-glow transition-colors"
                  aria-label="Close authentication modal"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Forms */}
              <div className="px-2">
                {currentView === 'login' && (
                  <LoginForm
                    onSuccess={handleAuthSuccess}
                    onSwitchToRegister={handleSwitchToRegister}
                    onForgotPassword={handleForgotPassword}
                  />
                )}

                {currentView === 'register' && (
                  <RegisterForm
                    onSuccess={handleAuthSuccess}
                    onSwitchToLogin={handleSwitchToLogin}
                  />
                )}

                {currentView === 'forgotPassword' && (
                  <ForgotPasswordForm
                    onSuccess={handleAuthSuccess}
                    onBackToLogin={handleSwitchToLogin}
                  />
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
