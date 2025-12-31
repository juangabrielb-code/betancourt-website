'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/UI';
import { WalletBalance } from '@/types/dashboard';
import { useCurrency } from '@/contexts/CurrencyContext';
import { motion } from 'framer-motion';

interface WalletCardProps {
  balance: WalletBalance;
}

export const WalletCard: React.FC<WalletCardProps> = ({ balance }) => {
  const { currency } = useCurrency();

  // Format balance based on selected currency
  const displayAmount = balance.currency === currency
    ? balance.amount
    : balance.amount; // TODO: Add currency conversion when backend is ready

  // Simple price formatting
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <GlassCard className="relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-warm-glow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-warm-glow/20 flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-j-light-text dark:text-j-dark-text">
              Wallet
            </h3>
          </div>
          <span className="text-xs font-medium text-j-light-text/40 dark:text-j-dark-text/40 uppercase tracking-wider">
            Saldo Disponible
          </span>
        </div>

        {/* Balance Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <motion.span
              key={displayAmount}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-j-light-text dark:text-j-dark-text font-serif"
            >
              {formatPrice(displayAmount)}
            </motion.span>
            <span className="text-lg text-j-light-text/60 dark:text-j-dark-text/60 font-medium">
              {currency}
            </span>
          </div>
          {balance.amount === 0 && (
            <p className="text-sm text-j-light-text/50 dark:text-j-dark-text/50 mt-2">
              Añade fondos para comenzar tu primer proyecto
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-3 rounded-xl bg-warm-glow text-white font-medium text-sm shadow-lg shadow-warm-glow/20 hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center justify-center gap-2">
              <span>💳</span>
              <span>Añadir Fondos</span>
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-3 rounded-xl bg-j-light-text/5 dark:bg-white/5 text-j-light-text dark:text-j-dark-text font-medium text-sm hover:bg-j-light-text/10 dark:hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <span>📊</span>
              <span>Historial</span>
            </span>
          </motion.button>
        </div>

        {/* Info Note */}
        <div className="mt-4 pt-4 border-t border-j-light-text/10 dark:border-white/10">
          <p className="text-xs text-j-light-text/40 dark:text-j-dark-text/40 text-center">
            Pagos seguros procesados por Bold y Mercado Pago
          </p>
        </div>
      </div>
    </GlassCard>
  );
};
