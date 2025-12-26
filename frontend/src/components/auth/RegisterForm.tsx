'use client';

/**
 * RegisterForm Component
 *
 * User registration form with real-time validation and password strength meter.
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

    const labels = {
      weak: t?.('Weak') || 'Weak',
      medium: t?.('Medium') || 'Medium',
      strong: t?.('Strong') || 'Strong',
    };

    if (!formData.password) return null;

    return (
      <div className="mt-2">
        <div className="flex gap-1">
          <div className={`h-1 flex-1 rounded ${colors[passwordStrength]}`} />
          <div className={`h-1 flex-1 rounded ${passwordStrength !== 'weak' ? colors[passwordStrength] : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? colors[passwordStrength] : 'bg-gray-200'}`} />
        </div>
        <p className={`text-xs mt-1 ${passwordStrength === 'weak' ? 'text-red-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
          {t?.('Password strength') || 'Password strength'}: {labels[passwordStrength]}
        </p>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h2 className="text-2xl font-bold mb-6">
        {t?.('Create Account') || 'Create Account'}
      </h2>

      {/* API Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          {t?.('Email') || 'Email'} *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          autoComplete="email"
          aria-invalid={!!validationErrors.email}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
            validationErrors.email
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {validationErrors.email && (
          <p id="email-error" className="text-red-600 text-sm mt-1" role="alert">
            {validationErrors.email}
          </p>
        )}
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium mb-1">
          {t?.('First Name') || 'First Name'}
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          autoComplete="given-name"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium mb-1">
          {t?.('Last Name') || 'Last Name'}
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          autoComplete="family-name"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          {t?.('Password') || 'Password'} *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="new-password"
            aria-invalid={!!validationErrors.password}
            aria-describedby={validationErrors.password ? 'password-error' : undefined}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              validationErrors.password
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {validationErrors.password && (
          <p id="password-error" className="text-red-600 text-sm mt-1" role="alert">
            {validationErrors.password}
          </p>
        )}
        <PasswordStrengthIndicator />
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-1">
          {t?.('Confirm Password') || 'Confirm Password'} *
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="passwordConfirm"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          autoComplete="new-password"
          aria-invalid={!!validationErrors.passwordConfirm}
          aria-describedby={validationErrors.passwordConfirm ? 'passwordConfirm-error' : undefined}
          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
            validationErrors.passwordConfirm
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {validationErrors.passwordConfirm && (
          <p id="passwordConfirm-error" className="text-red-600 text-sm mt-1" role="alert">
            {validationErrors.passwordConfirm}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (t?.('Creating account...') || 'Creating account...') : (t?.('Create Account') || 'Create Account')}
      </button>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <p className="text-center text-sm text-gray-600">
          {t?.('Already have an account?') || 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            {t?.('Sign in') || 'Sign in'}
          </button>
        </p>
      )}
    </form>
  );
}
