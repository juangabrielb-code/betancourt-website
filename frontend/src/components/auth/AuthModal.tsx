'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, GlassCard, Input } from '../ui/UI';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const { signIn, signUp, loading } = useAuth();
  const { t } = useLanguage();

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
      setError('');
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
      }

      onAuthSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError('');
    try {
      // TODO: Implement social login
      console.log(`Social login with ${provider}`);
      setError(`Social login with ${provider} coming soon`);
    } catch {
      setError(`Social login with ${provider} failed`);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
            className="relative w-full max-w-sm"
          >
            <GlassCard className="overflow-hidden shadow-2xl relative">
              {/* Decorative blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-warm-glow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-j-light-text dark:text-j-dark-text">
                    {mode === 'login' ? (t.auth?.loginTitle || 'Welcome Back') : (t.auth?.signupTitle || 'Create Account')}
                  </h3>
                  <p className="text-j-light-text/60 dark:text-j-dark-text/60 text-sm mt-1">
                    {mode === 'login' ? (t.auth?.subtitleLogin || 'Sign in to continue') : (t.auth?.subtitleSignup || 'Join us today')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-j-light-text/50 hover:text-warm-glow dark:text-j-dark-text/50 dark:hover:text-warm-glow transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Social Logins */}
              <div className="space-y-3 relative z-10 mb-6">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-j-light-text/10 dark:border-white/10 bg-white hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10 transition-colors text-sm font-medium text-j-light-text dark:text-white"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {t.auth?.continueWithGoogle || 'Continue with Google'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-j-light-text/10 dark:border-white/10 bg-black text-white hover:bg-gray-900 transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-.99 4.35-.74c.74.03 2.76.47 3.69 1.74-.06.03-2.2 1.32-2.18 3.92.02 2.85 2.53 3.94 2.59 3.98-.03.09-1.5 5.12-3.53 7.33zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.54 4.33-3.74 4.25z" />
                  </svg>
                  {t.auth?.continueWithApple || 'Continue with Apple'}
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-j-light-text/10 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-j-light-surface dark:bg-j-dark-surface text-j-light-text/40 dark:text-white/40">
                    {t.auth?.or || 'or'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      name="firstName"
                      label={t.auth?.firstName || 'First Name'}
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      name="lastName"
                      label={t.auth?.lastName || 'Last Name'}
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <Input
                  name="email"
                  type="email"
                  label={t.auth?.email || 'Email'}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  name="password"
                  type="password"
                  label={t.auth?.password || 'Password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                {mode === 'signup' && (
                  <Input
                    name="confirmPassword"
                    type="password"
                    label={t.auth?.confirmPassword || 'Confirm Password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                )}

                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full mt-6"
                  variant="primary"
                >
                  {loading
                    ? (t.auth?.processing || 'Processing...')
                    : (mode === 'login'
                        ? (t.auth?.submitLogin || 'Sign In')
                        : (t.auth?.submitSignup || 'Create Account')
                      )
                  }
                </Button>

                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-xs text-j-light-text/60 dark:text-j-dark-text/60 hover:text-warm-glow dark:hover:text-warm-glow transition-colors underline decoration-dotted underline-offset-4"
                  >
                    {mode === 'login'
                      ? (t.auth?.switchToSignup || "Don't have an account? Sign up")
                      : (t.auth?.switchToLogin || 'Already have an account? Sign in')
                    }
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
