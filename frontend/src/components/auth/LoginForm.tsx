'use client';

/**
 * LoginForm Component
 *
 * Login form integrated with Betancourt Audio Japandi design system.
 * Uses existing UI components (Button, Input) and translation system.
 *
 * Related: BET-19 (Frontend UI)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button, Input } from '../ui/UI';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onForgotPassword
}: LoginFormProps) {
  const { signIn, loading, error, clearError } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Clear auth error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      onSuccess?.();
    } catch (err) {
      // Error handled by AuthContext
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-j-light-text dark:text-white mb-2">
          {t.auth.loginTitle}
        </h2>
        <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/70">
          {t.auth.subtitleLogin}
        </p>
      </div>

      {/* API Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-2 text-j-light-text dark:text-j-dark-text"
        >
          {t.auth.email}
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          className="w-full"
          placeholder="your@email.com"
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-j-light-text dark:text-j-dark-text"
          >
            {t.auth.password}
          </label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-warm-glow hover:underline focus:outline-none"
            >
              Forgot password?
            </button>
          )}
        </div>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="w-full pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-j-light-text/50 dark:text-j-dark-text/50 hover:text-j-light-text dark:hover:text-j-dark-text transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !formData.email || !formData.password}
        className="w-full !py-3"
        variant="glass"
      >
        {loading ? t.auth.processing : t.auth.submitLogin}
      </Button>

      {/* Switch to Register */}
      {onSwitchToRegister && (
        <p className="text-center text-sm text-j-light-text/60 dark:text-j-dark-text/70 pt-4">
          {t.auth.switchToSignup.split('?')[0]}?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-warm-glow hover:underline focus:outline-none font-medium"
          >
            {t.auth.switchToSignup.split('Sign up')[1]?.trim() || 'Sign up'}
          </button>
        </p>
      )}
    </form>
  );
}
