'use client';

/**
 * ForgotPasswordForm Component
 *
 * Password reset request form integrated with Betancourt Audio Japandi design system.
 * Uses existing UI components (Button, Input) and translation system.
 *
 * Related: BET-19 (Frontend UI)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button, Input } from '../ui/UI';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export default function ForgotPasswordForm({
  onSuccess,
  onBackToLogin
}: ForgotPasswordFormProps) {
  const { forgotPassword, loading, error, clearError } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Clear auth error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    try {
      await forgotPassword(email);
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      // Error handled by AuthContext
      console.error('Forgot password error:', err);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-warm-glow/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-warm-glow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-j-light-text dark:text-white mb-2">
            Check your email
          </h2>
          <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/70">
            We've sent password reset instructions to <span className="font-medium text-warm-glow">{email}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-j-light-bg/30 dark:bg-j-dark-bg/30 rounded-lg backdrop-blur-sm border border-j-light-text/10 dark:border-j-dark-text/10">
          <p className="text-xs text-j-light-text/70 dark:text-j-dark-text/70 leading-relaxed">
            Click the link in the email to reset your password. The link will expire in 1 hour.
            If you don't see the email, check your spam folder.
          </p>
        </div>

        {/* Back to Login */}
        {onBackToLogin && (
          <Button
            type="button"
            onClick={onBackToLogin}
            variant="glass"
            className="w-full !py-3"
          >
            Back to Sign In
          </Button>
        )}
      </div>
    );
  }

  // Request form
  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-j-light-text dark:text-white mb-2">
          Reset your password
        </h2>
        <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/70">
          Enter your email address and we'll send you instructions to reset your password
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
          value={email}
          onChange={handleChange}
          required
          autoComplete="email"
          className="w-full"
          placeholder="your@email.com"
          autoFocus
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !email}
        className="w-full !py-3"
        variant="glass"
      >
        {loading ? t.auth.processing : 'Send Reset Link'}
      </Button>

      {/* Back to Login */}
      {onBackToLogin && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm text-warm-glow hover:underline focus:outline-none"
          >
            ← Back to Sign In
          </button>
        </div>
      )}
    </form>
  );
}
