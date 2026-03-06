"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { Container, GlassCard, Badge, Reveal } from '../ui/UI';
import { PortfolioItem } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  MIXING: 'Mixing',
  MASTERING: 'Mastering',
  PRODUCTION: 'Production',
  ATMOS: 'Dolby Atmos',
};

interface PortfolioSectionProps {
  t: any;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ t }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio?limit=8')
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 15 }
    }
  };

  return (
    <section id="portfolio" className="py-24 relative z-10">
      <Container>
        <div className="mb-16">
          <Reveal>
            <h2 className="text-3xl font-serif font-bold text-j-light-text dark:text-white mb-4">
              {t.portfolio.title}
            </h2>
            <p className="text-j-light-text/70 dark:text-j-dark-text/70 max-w-2xl">
              {t.portfolio.subtitle}
            </p>
          </Reveal>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-square bg-j-light-text/10 dark:bg-white/10 animate-pulse" />
                <div className="p-6 bg-j-light-surface/90 dark:bg-[#121413]/90">
                  <div className="h-3 w-16 bg-j-light-text/10 dark:bg-white/10 animate-pulse rounded mb-2" />
                  <div className="h-5 w-32 bg-j-light-text/10 dark:bg-white/10 animate-pulse rounded mb-1" />
                  <div className="h-3 w-24 bg-j-light-text/5 dark:bg-white/5 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-j-light-text/40 dark:text-j-dark-text/40">
            <p className="text-4xl mb-4">🎵</p>
            <p className="text-lg font-medium">Próximamente</p>
            <p className="text-sm mt-1">El portafolio se actualizará pronto.</p>
          </div>
        ) : (
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariants} className="group cursor-pointer">
                <GlassCard className="h-full p-0 overflow-hidden border-0 hover:shadow-2xl hover:shadow-warm-glow/20 transition-all duration-500">
                  <div className="relative aspect-square overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="w-full h-full"
                    >
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-j-light-text/10 dark:bg-white/5 flex items-center justify-center">
                          <span className="text-5xl opacity-30">🎵</span>
                        </div>
                      )}
                    </motion.div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <Badge color="bg-black/50 backdrop-blur-md text-white border-white/10">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 relative bg-j-light-surface/90 dark:bg-[#121413]/90 backdrop-blur-xl border-t border-white/5">
                    {item.tags.length > 0 && (
                      <p className="text-xs font-medium text-warm-glow mb-1 uppercase tracking-wider">
                        {item.tags[0]}
                      </p>
                    )}
                    <h3 className="text-lg font-bold text-j-light-text dark:text-white group-hover:text-warm-glow transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60 line-clamp-1">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center text-xs font-semibold text-j-light-text dark:text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {t.portfolio.listen}
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </Container>
    </section>
  );
};
