"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Navbar } from '@/components/shared/Navbar';
import { CheckoutModal } from '@/components/shared/CheckoutModal';
import { StudioBackground } from '@/components/landing/StudioBackground';
import { ServiceList } from '@/components/landing/ServiceList';
import { PortfolioSection } from '@/components/landing/PortfolioSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { ConsoleFader } from '@/components/landing/ConsoleFader';
import { Container } from '@/components/ui/UI';
import { Service } from '@/types';
import { motion } from 'framer-motion';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { currency } = useCurrency();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        // API already returns localized services based on language param
        const response = await fetch(`/api/services?lang=${language}`);
        const services: Service[] = await response.json();

        setServices(services);
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [language]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCheckoutModalOpen(true);
  };

  const handleNavigate = (section: string) => {
    if (section === 'dashboard') {
      router.push('/dashboard');
    } else if (section === 'admin') {
      router.push('/admin');
    } else {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <StudioBackground />

      <Navbar
        onNavigate={handleNavigate}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-block px-4 py-2 bg-warm-glow/10 border border-warm-glow/20 rounded-full text-warm-glow text-sm font-medium mb-6">
              {t.hero.badge}
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-j-light-text dark:text-white mb-6">
              {t.hero.titlePart1} <br />
              <span className="text-warm-glow">{t.hero.titlePart2}</span>
            </h1>
            <p className="text-lg md:text-xl text-j-light-text/70 dark:text-j-dark-text/70 mb-8 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleNavigate('services')}
                className="px-8 py-4 bg-warm-glow text-j-dark-bg font-medium rounded-xl hover:bg-warm-dim transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                {t.hero.explore}
              </button>
              <button
                onClick={() => handleNavigate('portfolio')}
                className="px-8 py-4 bg-j-light-surface/50 dark:bg-white/10 backdrop-blur-md text-j-light-text dark:text-white font-medium rounded-xl border border-j-light-text/10 dark:border-white/10 hover:bg-j-light-text/10 dark:hover:bg-white/20 transition-all"
              >
                {t.hero.viewPortfolio}
              </button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-24">
        {loading ? (
          <Container>
            <div className="text-center py-12">
              <div className="animate-pulse text-warm-glow">{t.services.loading}</div>
            </div>
          </Container>
        ) : (
          <ServiceList
            services={services}
            onSelectService={handleServiceSelect}
            currency={currency}
            t={t}
          />
        )}
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="relative py-24">
        <PortfolioSection t={t} />
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-24">
        <ContactSection t={t} />
      </section>

      {/* Console Fader - Interactive Element */}
      <ConsoleFader />

      {/* Footer */}
      <footer className="relative py-12 border-t border-j-light-text/10 dark:border-white/10">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-serif font-bold text-j-light-text dark:text-white mb-1">
                Betancourt Audio
              </h3>
              <p className="text-sm text-j-light-text/60 dark:text-white/60">
                Professional Audio Engineering Services
              </p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-j-light-text/60 dark:text-white/60 hover:text-warm-glow transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                  <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="text-j-light-text/60 dark:text-white/60 hover:text-warm-glow transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="text-j-light-text/60 dark:text-white/60 hover:text-warm-glow transition-colors">
                <span className="sr-only">Email</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-j-light-text/10 dark:border-white/10 text-center">
            <p className="text-xs text-j-light-text/40 dark:text-white/40">
              © {new Date().getFullYear()} Betancourt Audio. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>

      {/* Modals */}
      <CheckoutModal
        service={selectedService}
        isOpen={checkoutModalOpen}
        defaultCurrency={currency}
        onClose={() => {
          setCheckoutModalOpen(false);
          setSelectedService(null);
        }}
      />
    </>
  );
}
