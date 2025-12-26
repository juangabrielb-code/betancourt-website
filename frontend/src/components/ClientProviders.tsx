'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProvider } from "@/contexts/UserContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
