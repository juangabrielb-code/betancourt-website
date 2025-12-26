'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for persisted user (client-side only)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ba_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored user', e);
          localStorage.removeItem('ba_user');
        }
      }
    }
  }, []);

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ba_user');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
