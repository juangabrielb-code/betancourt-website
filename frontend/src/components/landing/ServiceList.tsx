"use client";

import React, { useRef, useEffect } from 'react';
import { Service, ServiceType, Currency } from '@/types';
import { Badge, GlassCard, Button } from '../ui/UI';
import { formatCurrency } from '@/utils/currency';
import { motion, Variants, useInView, useAnimation } from 'framer-motion';

interface ServiceListProps {
  services: Service[];
  onSelectService: (service: Service) => void;
  currency: Currency;
  t: any; // Translation object
}

export const ServiceList: React.FC<ServiceListProps> = ({ services, onSelectService, currency, t }) => {
  const ref = useRef(null);
  // Use useInView hook to detect when the grid enters the viewport
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -100px 0px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("show");
    }
  }, [isInView, controls]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: 'spring',
        stiffness: 60,
        damping: 12
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={controls}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(300px,auto)]"
    >
      {services.map((service, i) => {
        // Bento Grid Logic
        const isFeatured = service.isPopular;
        const colSpan = isFeatured ? 'md:col-span-2' : '';
        const rowSpan = isFeatured ? 'md:row-span-2' : '';

        const price = currency === Currency.USD ? service.priceUsd : service.priceCop;
        const formattedPrice = formatCurrency(price, currency);

        return (
          <motion.div
            key={service.id}
            variants={item}
            className={`${colSpan} ${rowSpan}`}
          >
            <GlassCard
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="h-full flex flex-col justify-between group relative overflow-hidden hover:shadow-2xl hover:shadow-warm-glow/10 transition-shadow duration-500"
            >
              {/* Background gradient blob for popular items - Warm glow */}
              {isFeatured && (
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-warm-glow/20 rounded-full blur-3xl group-hover:bg-warm-glow/30 transition-colors duration-700" />
              )}

              <div>
                <div className="flex justify-between items-start mb-4">
                  <Badge color={getServiceBadgeColor(service.type)}>
                    {service.type}
                  </Badge>
                  {service.isPopular && (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warm-glow opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-warm-glow"></span>
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-2 group-hover:text-warm-glow transition-colors">
                  {service.name}
                </h3>
                <p className="text-j-light-text/70 dark:text-j-dark-text/70 leading-relaxed mb-6">
                  {service.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {service.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-j-light-text/60 dark:text-j-dark-text/60">
                      <svg className="w-4 h-4 mr-2 text-warm-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-j-light-text/5 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs text-j-light-text/50 dark:text-j-dark-text/50 uppercase tracking-wider">{t.services.startingAt}</span>
                  <span className="text-xl font-bold text-j-light-text dark:text-j-dark-text">{formattedPrice}</span>
                </div>
                <Button
                  onClick={() => onSelectService(service)}
                  variant={isFeatured ? 'primary' : 'glass'}
                  className="rounded-full px-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.services.bookNow}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

const getServiceBadgeColor = (type: ServiceType) => {
  // Using more neutral/earthy tones for Japandi feel
  switch (type) {
    case ServiceType.MIXING: return 'bg-stone-500/10 text-stone-600 dark:text-stone-300 border-stone-500/20';
    case ServiceType.MASTERING: return 'bg-warm-glow/10 text-warm-dim dark:text-warm-glow border-warm-glow/20';
    case ServiceType.PRODUCTION: return 'bg-orange-900/10 text-orange-800 dark:text-orange-200 border-orange-900/20';
    case ServiceType.CONSULTATION: return 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20';
    default: return 'bg-zinc-500/10 text-zinc-500';
  }
};
