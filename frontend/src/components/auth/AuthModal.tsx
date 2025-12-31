'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { GlassCard } from '../ui/UI';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

type Provider = 'google' | 'facebook' | 'apple' | 'microsoft-entra-id';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  // OAuth state
  const [oauthLoading, setOauthLoading] = useState<Provider | null>(null);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setError('');
      setOauthLoading(null);
    }
  }, [isOpen]);

  // OAuth handler
  const handleSocialLogin = async (provider: Provider) => {
    setOauthLoading(provider);
    setError('');

    try {
      await signIn(provider, {
        callbackUrl: '/dashboard',
        redirect: true,
      });
      // Note: redirect: true means this won't return normally
      onAuthSuccess?.();
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setError(
        t.auth?.errorGeneral ||
        'Hubo un problema al iniciar sesión. Por favor intenta de nuevo.'
      );
      setOauthLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen p-4 py-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-j-dark-bg/80 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto"
          >
            <GlassCard className="shadow-2xl relative">
              {/* Decorative blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-warm-glow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-j-light-text dark:text-j-dark-text">
                    {t.auth?.loginTitle || 'Bienvenido'}
                  </h3>
                  <p className="text-j-light-text/60 dark:text-j-dark-text/60 text-sm mt-1">
                    {t.auth?.subtitleLogin || 'Inicia sesión para continuar'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-j-light-text/50 hover:text-warm-glow dark:text-j-dark-text/50 dark:hover:text-warm-glow transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center relative z-10">
                  {error}
                </div>
              )}

              {/* OAuth Social Login Buttons */}
              <div className="space-y-3 relative z-10">
                {/* Google - Primary */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={oauthLoading !== null}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-warm-glow/30 bg-white hover:bg-warm-glow/5 dark:bg-white/5 dark:hover:bg-white/10 transition-all text-sm font-medium text-j-light-text dark:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-warm-glow/10"
                >
                  {oauthLoading === 'google' ? (
                    <svg className="animate-spin h-5 w-5 text-warm-glow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  <span>{t.auth?.continueWithGoogle || 'Continuar con Google'}</span>
                </button>
              </div>

              {/* Info Message */}
              <div className="mt-6 pt-6 border-t border-j-light-text/10 dark:border-white/10 relative z-10">
                <p className="text-xs text-center text-j-light-text/50 dark:text-j-dark-text/50">
                  Al continuar, aceptas nuestros{' '}
                  <a href="/terms" className="text-warm-glow hover:underline">Términos de Servicio</a>
                  {' '}y{' '}
                  <a href="/privacy" className="text-warm-glow hover:underline">Política de Privacidad</a>
                </p>
              </div>

              {/* Coming Soon Badge */}
              <div className="mt-4 p-3 rounded-lg bg-warm-glow/5 border border-warm-glow/10 relative z-10">
                <p className="text-xs text-center text-j-light-text/60 dark:text-j-dark-text/60">
                  <span className="text-warm-glow font-medium">Próximamente:</span> Registro con email y contraseña
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
