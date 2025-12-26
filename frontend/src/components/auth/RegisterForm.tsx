'use client';

/**
 * RegisterForm Component
 *
 * User registration form with real-time validation and password strength meter.
 * Integrated with Betancourt Audio Japandi design system.
 * Uses existing UI components (Button, Input) and translation system.
 *
 * Features:
 * - Email validation (format + existence check)
 * - Password strength meter
 * - Real-time validation
 * - Responsive design
 * - Accessible (WCAG 2.1 AA)
 * - Bilingual support (EN/ES)
 *
 * Related: BET-19 (Frontend UI)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button, Input } from '../ui/UI';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { signUp, loading, error, clearError } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [showPassword, setShowPassword] = useState(false);

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

  /**
   * Validate email format
   */
  const validateEmail = (email: string): string | null => {
    if (!email) return t?.('Email is required') || 'Email is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t?.('Invalid email format') || 'Invalid email format';
    }

    return null;
  };

  /**
   * Validate password
   */
  const validatePassword = (password: string): string | null => {
    if (!password) return t?.('Password is required') || 'Password is required';

    if (password.length < 8) {
      return t?.('Password must be at least 8 characters') || 'Password must be at least 8 characters';
    }

    if (!/[a-z]/.test(password)) {
      return t?.('Password must contain lowercase letter') || 'Password must contain a lowercase letter';
    }

    if (!/[A-Z]/.test(password)) {
      return t?.('Password must contain uppercase letter') || 'Password must contain an uppercase letter';
    }

    if (!/[0-9]/.test(password)) {
      return t?.('Password must contain number') || 'Password must contain a number';
    }

    return null;
  };

  /**
   * Handle input change with validation
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    // Real-time password strength calculation
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  /**
   * Handle field blur (validate on blur)
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let error: string | null = null;

    if (name === 'email') {
      error = validateEmail(value);
    } else if (name === 'password') {
      error = validatePassword(value);
    } else if (name === 'passwordConfirm') {
      if (value !== formData.password) {
        error = t?.('Passwords do not match') || 'Passwords do not match';
      }
    }

    if (error) {
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validate all fields
    const errors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = t?.('Passwords do not match') || 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      onSuccess?.();
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Registration error:', err);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-j-light-text dark:text-white mb-2">
          {t.auth.signupTitle}
        </h2>
        <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/70">
          {t.auth.subtitleSignup}
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
          onBlur={handleBlur}
          required
          autoComplete="email"
          className="w-full"
          placeholder="your@email.com"
        />
        {validationErrors.email && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1" role="alert">
            {validationErrors.email}
          </p>
        )}
      </div>

      {/* First Name */}
      <div>
        <label
          htmlFor="firstName"
          className="block text-sm font-medium mb-2 text-j-light-text dark:text-j-dark-text"
        >
          First Name
        </label>
        <Input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          autoComplete="given-name"
          className="w-full"
          placeholder="Juan"
        />
      </div>

      {/* Last Name */}
      <div>
        <label
          htmlFor="lastName"
          className="block text-sm font-medium mb-2 text-j-light-text dark:text-j-dark-text"
        >
          Last Name
        </label>
        <Input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          autoComplete="family-name"
          className="w-full"
          placeholder="Betancourt"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-2 text-j-light-text dark:text-j-dark-text"
        >
          {t.auth.password}
        </label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
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
        {validationErrors.password && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1" role="alert">
            {validationErrors.password}
          </p>
        )}
        <PasswordStrengthIndicator />
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
          onBlur={handleBlur}
          required
          autoComplete="new-password"
          className="w-full"
          placeholder="••••••••"
        />
        {validationErrors.passwordConfirm && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1" role="alert">
            {validationErrors.passwordConfirm}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full !py-3"
        variant="glass"
      >
        {loading ? t.auth.processing : t.auth.submitSignup}
      </Button>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <p className="text-center text-sm text-j-light-text/60 dark:text-j-dark-text/70 pt-4">
          {t.auth.switchToLogin.split('?')[0]}?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-warm-glow hover:underline focus:outline-none font-medium"
          >
            {t.auth.switchToLogin.split('Sign in')[1]?.trim() || 'Sign in'}
          </button>
        </p>
      )}
    </form>
  );
}
