'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language, Currency } from '@/types';
import { Currency as CurrencyEnum } from '@/types';

interface LanguageContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>(CurrencyEnum.USD);

  useEffect(() => {
    // Detect location (only client-side)
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code === 'CO') {
          setLanguage('es');
          setCurrency(CurrencyEnum.COP);
        }
      })
      .catch(() => {
        // Default to EN/USD on error
      });
  }, []);

  return (
    <LanguageContext.Provider value={{ language, currency, setLanguage, setCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
