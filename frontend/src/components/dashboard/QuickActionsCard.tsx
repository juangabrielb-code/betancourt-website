'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/UI';
import { motion } from 'framer-motion';

export const QuickActionsCard: React.FC = () => {
  return (
    <GlassCard className="relative overflow-hidden">
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-warm-glow/5 via-transparent to-warm-dim/5 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-j-light-text dark:text-j-dark-text mb-2">
            Acciones Rápidas
          </h3>
          <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60">
            Comienza un nuevo proyecto o explora nuestros servicios
          </p>
        </div>

        {/* Primary CTA - Nuevo Proyecto */}
        <Link href="/dashboard/proyectos">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="mb-4 p-6 rounded-2xl bg-gradient-to-br from-warm-glow to-warm-dim shadow-lg shadow-warm-glow/20 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">✨</span>
                  <h4 className="text-xl font-bold text-white font-serif">
                    Nuevo Proyecto
                  </h4>
                </div>
                <p className="text-sm text-white/80">
                  Sube tus tracks y comienza tu producción
                </p>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-white text-2xl"
              >
                →
              </motion.div>
            </div>
          </motion.div>
        </Link>

        {/* Secondary Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Schedule Session */}
          <Link href="/dashboard/sesiones">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-j-light-surface/50 dark:bg-black/20 border border-j-light-text/10 dark:border-white/10 hover:border-warm-glow/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warm-glow/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-j-light-text dark:text-j-dark-text mb-0.5">
                    Agendar Sesión
                  </h5>
                  <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                    Reserva tiempo en estudio
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Add Funds */}
          <Link href="/dashboard/wallet">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-j-light-surface/50 dark:bg-black/20 border border-j-light-text/10 dark:border-white/10 hover:border-warm-glow/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warm-glow/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💳</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-j-light-text dark:text-j-dark-text mb-0.5">
                    Añadir Fondos
                  </h5>
                  <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                    Recarga tu wallet
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Explore Services */}
          <Link href="/#services">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-j-light-surface/50 dark:bg-black/20 border border-j-light-text/10 dark:border-white/10 hover:border-warm-glow/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warm-glow/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-j-light-text dark:text-j-dark-text mb-0.5">
                    Ver Servicios
                  </h5>
                  <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                    Mixing, mastering y más
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Contact Support */}
          <Link href="/dashboard/mensajes">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-j-light-surface/50 dark:bg-black/20 border border-j-light-text/10 dark:border-white/10 hover:border-warm-glow/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warm-glow/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💬</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-j-light-text dark:text-j-dark-text mb-0.5">
                    Soporte
                  </h5>
                  <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                    Estamos aquí para ayudarte
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
};
