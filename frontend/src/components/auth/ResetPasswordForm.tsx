'use client';

/**
 * ResetPasswordForm Component
 *
 * Password reset form with token validation and password strength meter.
 * Uses existing UI components (Button, Input) and translation system.
 *
 * Related: BET-19 (Frontend UI)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button, Input } from '../ui/UI';

interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

export default function ResetPasswordForm({
  token,
  onSuccess,
  onBackToLogin
}: ResetPasswordFormProps) {
  const { resetPassword, loading, error, clearError } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Clear auth error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  /**
   * Calculate password strength
   */
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
    setValidationError(null);

    // Real-time password strength calculation
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.passwordConfirm) {
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.passwordConfirm) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setValidationError('Password must contain a lowercase letter');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setValidationError('Password must contain an uppercase letter');
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setValidationError('Password must contain a number');
      return;
    }

    try {
      await resetPassword(token, formData.password);
      setResetSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      // Error handled by AuthContext
      console.error('Reset password error:', err);
    }
  };

  /**
   * Password strength indicator
   */
  const PasswordStrengthIndicator = () => {
    const colors = {
      weak: 'bg-red-500',
      medium: 'bg-yellow-500',
      strong: 'bg-green-500',
    };

    const textColors = {
      weak: 'text-red-600 dark:text-red-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      strong: 'text-green-600 dark:text-green-400',
    };

    const labels = {
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
    };

    if (!formData.password) return null;

    return (
      <div className="mt-2">
        <div className="flex gap-1">
          <div className={`h-1 flex-1 rounded ${colors[passwordStrength]}`} />
          <div className={`h-1 flex-1 rounded ${passwordStrength !== 'weak' ? colors[passwordStrength] : 'bg-j-light-text/10 dark:bg-j-dark-text/10'}`} />
          <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? colors[passwordStrength] : 'bg-j-light-text/10 dark:bg-j-dark-text/10'}`} />
        </div>
        <p className={`text-xs mt-1 ${textColors[passwordStrength]}`}>
          Password strength: {labels[passwordStrength]}
        </p>
      </div>
    );
  };

  // Success state
  if (resetSuccess) {
    return (
      <div className="space-y-6 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-j-light-text dark:text-white mb-2">
            Password reset successful!
          </h2>
          <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/70">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>

        {/* Redirect info */}
        <div className="p-4 bg-j-light-bg/30 dark:bg-j-dark-bg/30 rounded-lg backdrop-blur-sm border border-j-light-text/10 dark:border-j-dark-text/10">
          <p className="text-xs text-j-light-text/70 dark:text-j-dark-text/70">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-j-light-text dark:text-white mb-2">
          Create new password
        </h2>
        <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/70">
          Enter a new password for your account
        </p>
      </div>

      {/* API Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm backdrop-blur-sm">
          {validationError}
        </div>
      )}

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-2 text-j-light-text dark:text-j-dark-text"
        >
          New {t.auth.password}
        </label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
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
        <PasswordStrengthIndicator />

        {/* Password requirements */}
        <div className="mt-3 space-y-1">
          <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">Password must contain:</p>
          <ul className="text-xs text-j-light-text/50 dark:text-j-dark-text/50 space-y-1 ml-4">
            <li className={formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
              • At least 8 characters
            </li>
            <li className={/[a-z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}>
              • One lowercase letter
            </li>
            <li className={/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}>
              • One uppercase letter
            </li>
            <li className={/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}>
              • One number
            </li>
          </ul>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="passwordConfirm"
          className="block text-sm font-medium mb-2 text-j-light-text dark:text-j-dark-text"
        >
          {t.auth.confirmPassword}
        </label>
        <Input
          type={showPassword ? 'text' : 'password'}
          id="passwordConfirm"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
          autoComplete="new-password"
          className="w-full"
          placeholder="••••••••"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !formData.password || !formData.passwordConfirm}
        className="w-full !py-3"
        variant="glass"
      >
        {loading ? t.auth.processing : 'Reset Password'}
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
