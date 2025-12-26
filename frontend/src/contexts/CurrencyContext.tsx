"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency } from '@/types';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(Currency.USD);

  // Load currency from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ba_currency');
      if (stored && (stored === Currency.USD || stored === Currency.COP)) {
        setCurrencyState(stored as Currency);
      }
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ba_currency', newCurrency);
    }
  };

  const toggleCurrency = () => {
    const newCurrency = currency === Currency.USD ? Currency.COP : Currency.USD;
    setCurrency(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
