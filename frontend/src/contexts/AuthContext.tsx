'use client';

/**
 * AuthContext - Authentication Context Provider
 *
 * Manages user authentication state and provides auth methods.
 * Integrates with Django backend API and Next.js Auth.js.
 *
 * Features:
 * - User registration with auto-login
 * - Email/password login with JWT tokens
 * - Logout with token cleanup
 * - Password reset flow
 * - Session persistence (localStorage)
 * - Error handling
 *
 * Related: BET-19 (Frontend UI), BET-18 (Backend API)
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email_verified: boolean;
  date_joined: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;

  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signOut: () => Promise<void>;

  // Password reset
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;

  // Utilities
  clearError: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auth_user');
      const storedTokens = localStorage.getItem('auth_tokens');

      if (storedUser && storedTokens) {
        try {
          setUser(JSON.parse(storedUser));
          setTokens(JSON.parse(storedTokens));
        } catch (e) {
          console.error('Failed to parse stored auth data', e);
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_tokens');
        }
      }
    }
    setLoading(false);
  }, []);

  // Persist to localStorage whenever user or tokens change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user && tokens) {
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      } else {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_tokens');
      }
    }
  }, [user, tokens]);

  const clearError = () => setError(null);

  /**
   * Register new user with auto-login
   */
  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const data: RegisterData = {
        email,
        password,
        password_confirm: password,
        first_name: firstName,
        last_name: lastName,
      };

      const response = await fetch(`${API_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error messages
        const errorMessages = Object.entries(result)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return messages.join(', ');
            }
            return String(messages);
          })
          .join('. ');

        throw new Error(errorMessages || 'Registration failed');
      }

      // Set user and tokens from response
      setUser(result.user);
      setTokens(result.tokens);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const data: LoginData = {
        email,
        password,
      };

      const response = await fetch(`${API_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Login failed');
      }

      // Set user and tokens from response
      setUser(result.user);
      setTokens(result.tokens);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout and clear tokens
   */
  const signOut = async () => {
    try {
      setLoading(true);

      // Call logout endpoint (optional, for future token blacklist)
      if (tokens?.access) {
        await fetch(`${API_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.access}`,
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear state regardless of API call success
      setUser(null);
      setTokens(null);
      setError(null);
      setLoading(false);
    }
  };

  /**
   * Request password reset token
   */
  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send password reset email');
      }

      // Success - always returns same message (anti-enumeration)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset request failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (token: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          password_confirm: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error messages
        const errorMessages = Object.entries(result)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return messages.join(', ');
            }
            return String(messages);
          })
          .join('. ');

        throw new Error(errorMessages || 'Password reset failed');
      }

      // Success
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change password (authenticated users)
   */
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!tokens?.access) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/api/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirm: newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error messages
        const errorMessages = Object.entries(result)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return messages.join(', ');
            }
            return String(messages);
          })
          .join('. ');

        throw new Error(errorMessages || 'Password change failed');
      }

      // Success
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password change failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    changePassword,
    clearError,
    isAuthenticated: !!user && !!tokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use Auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
