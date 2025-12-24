
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Container, Button, Reveal } from './components/UI';
import { ServiceList } from './components/ServiceList';
import { PortfolioSection } from './components/PortfolioSection';
import { ContactSection } from './components/ContactSection';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { ConsoleFader } from './components/ConsoleFader';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ApiService } from './services/api';
import { Service, Language, Currency, User, Project } from './types';
import { translations } from './utils/translations';

// --- Background Studio Component ---
const StudioBackground = () => {
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1000], [0, 150]); 
  const scaleBg = useTransform(scrollY, [0, 1000], [1.05, 1.15]);

  return (
    <div className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop')`,
          y: yBg,
          scale: scaleBg
        }}
      />
      <div className="absolute inset-0 bg-wood opacity-10 dark:opacity-20 mix-blend-overlay" />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-10 opacity-0 dark:opacity-30 mix-blend-soft-light"
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
          opacity: [0.1, 0.3, 0.1] 
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          repeatType: "reverse", 
          ease: "easeInOut" 
        }}
        style={{ backgroundSize: '200% 200%' }}
      />
      <div className="absolute inset-0 bg-j-light-bg/85 dark:opacity-0 transition-opacity duration-1000 mix-blend-overlay" />
      <div className="absolute inset-0 bg-j-light-bg/80 dark:opacity-0 transition-opacity duration-1000" />
      <div className="absolute inset-0 bg-[#0a0c0b] opacity-0 dark:opacity-95 transition-opacity duration-1000" />
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-1000">
         <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 40%, rgba(123, 158, 135, 0.15) 0%, rgba(18, 20, 19, 0.95) 60%, rgba(18, 20, 19, 1) 100%)`,
            }}
         />
         <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.6, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warm-glow/20 rounded-full blur-[120px] mix-blend-screen" 
         />
         <motion.div 
            animate={{ x: [0, 30, 0], y: [0, -30, 0], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] left-[35%] w-[400px] h-[400px] bg-warm-glow/10 rounded-full blur-[100px] mix-blend-screen" 
         />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-10" />
    </div>
  );
};

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>(Currency.USD);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // App State
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'dashboard' | 'admin'>('landing');

  // Data State
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const t = translations[language];
  const { scrollY } = useScroll();
  
  // Parallax Hero
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);
  const yBadge = useTransform(scrollY, [0, 500], [0, 50]);
  const yTitle = useTransform(scrollY, [0, 500], [0, 150]);
  const ySubtitle = useTransform(scrollY, [0, 500], [0, 100]);
  const yButtons = useTransform(scrollY, [0, 500], [0, 50]);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setShowScrollTop(latest > 600);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Init App & Check Persistence
  useEffect(() => {
    const initApp = async () => {
      // 1. Check persistence
      const storedUser = localStorage.getItem('ba_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // 2. Detect location/currency
      const location = await ApiService.detectUserCountry();
      console.log(`Detected Location: ${location}`);
      
      if (location === 'CO') {
        setLanguage('es');
        setDefaultCurrency(Currency.COP);
        await fetchServices('es');
      } else {
        setLanguage('en');
        setDefaultCurrency(Currency.USD);
        await fetchServices('en');
      }
    };
    initApp();
  }, []);

  const fetchServices = async (lang: Language) => {
    setLoading(true);
    try {
      const data = await ApiService.getServices(lang);
      setServices(data);
    } catch (e) {
      console.error("Failed to load services", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    await fetchServices(newLang);
  };

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setIsCheckoutOpen(true);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('ba_user', JSON.stringify(loggedInUser)); // Persist session
    
    // Route based on Role
    if (loggedInUser.role === 'ADMIN') {
        setView('admin');
    } else {
        setView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ba_user'); // Clear session
    setView('landing');
    scrollToTop();
  };

  const handleProjectPayment = (project: Project) => {
    // Convert project to service structure to reuse modal
    const tempService: Service = {
        ...project.service,
        priceUsd: project.currency === Currency.USD ? project.price : 0,
        priceCop: project.currency === Currency.COP ? project.price : 0,
    };
    setSelectedService(tempService);
    setIsCheckoutOpen(true);
  };

  const scrollToSection = (id: string) => {
    if (view !== 'landing') {
        setView('landing');
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500 font-sans selection:bg-warm-glow/30 selection:text-white">
      <StudioBackground />
      
      {/* Show Fader only on Landing Page */}
      {view === 'landing' && <ConsoleFader />}
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 border-b border-j-light-text/5 dark:border-white/5 bg-j-light-bg/80 dark:bg-black/40 backdrop-blur-xl transition-colors duration-500 bg-grain">
        <Container className="h-16 flex items-center justify-between">
          <div className="text-xl font-serif font-bold tracking-tight uppercase tracking-widest text-j-light-text dark:text-white mix-blend-difference cursor-pointer" onClick={() => { setView('landing'); scrollToTop(); }}>
            Betancourt Audio
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-j-light-text/80 dark:text-j-dark-text/90">
            <div className="hidden md:flex gap-6 mr-2">
              <button onClick={() => scrollToSection('services')} className="hover:text-warm-glow transition-colors">{t.nav.services}</button>
              <button onClick={() => scrollToSection('portfolio')} className="hover:text-warm-glow transition-colors">{t.nav.portfolio}</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-warm-glow transition-colors">{t.nav.contact}</button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLanguageToggle}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 transition-all text-xs font-semibold"
              >
                <span className={language === 'en' ? 'text-j-light-text dark:text-white' : 'text-j-light-text/50 dark:text-white/50'}>EN</span>
                <span className="text-j-light-text/30 dark:text-white/30">/</span>
                <span className={language === 'es' ? 'text-j-light-text dark:text-white' : 'text-j-light-text/50 dark:text-white/50'}>ES</span>
              </button>

              <button 
                onClick={handleThemeToggle}
                className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 transition-all"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4 text-warm-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-j-light-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            {user ? (
               <Button 
                variant={view === 'dashboard' || view === 'admin' ? 'primary' : 'glass'}
                onClick={() => {
                    if (user.role === 'ADMIN') setView(prev => prev === 'landing' ? 'admin' : 'landing');
                    else setView(prev => prev === 'landing' ? 'dashboard' : 'landing');
                }}
                className="!px-5 !py-2 !text-xs !rounded-full ml-2 flex items-center gap-2"
               >
                 {view === 'landing' ? (
                   <>
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                     {user.role === 'ADMIN' ? 'Admin Panel' : t.nav.myAccount}
                   </>
                 ) : (
                    <>
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                     </svg>
                     {t.nav.home}
                    </>
                 )}
               </Button>
            ) : (
                <Button 
                  variant="glass" 
                  onClick={() => setIsAuthOpen(true)}
                  className="!px-5 !py-2 !text-xs !rounded-full ml-2 hover:bg-j-light-text hover:text-white dark:hover:bg-warm-glow dark:hover:text-black transition-colors"
                >
                  {t.nav.login}
                </Button>
            )}
          </div>
        </Container>
      </nav>

      {/* Main Content Switcher */}
      <AnimatePresence mode="wait">
         {view === 'landing' ? (
             <motion.div
               key="landing"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.5 }}
             >
                {/* Hero Section */}
                <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
                    <Container className="relative z-10 text-center">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ y: yBadge, opacity: opacityHero }}
                        >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-warm-glow/30 bg-warm-glow/10 text-xs font-medium text-j-light-text dark:text-warm-glow backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                            </span>
                            {t.hero.badge}
                        </div>
                        </motion.div>
                        
                        <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        style={{ y: yTitle, opacity: opacityHero }}
                        className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-j-light-text dark:text-white leading-tight drop-shadow-sm"
                        >
                        {t.hero.titlePart1} <br/>
                        <span className="italic text-warm-glow drop-shadow-lg">
                            {t.hero.titlePart2}
                        </span>
                        </motion.h1>
                        
                        <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        style={{ y: ySubtitle, opacity: opacityHero }}
                        className="text-lg md:text-xl text-j-light-text/80 dark:text-j-dark-text/80 max-w-xl mx-auto font-light drop-shadow-md"
                        >
                        {t.hero.subtitle}
                        </motion.p>

                        <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                        style={{ y: yButtons, opacity: opacityHero }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                        >
                        <Button onClick={() => scrollToSection('services')} variant="primary" className="w-full sm:w-auto shadow-lg shadow-warm-glow/20">
                            {t.hero.explore}
                        </Button>
                        <Button variant="glass" className="w-full sm:w-auto">
                            {t.hero.viewPortfolio}
                        </Button>
                        </motion.div>
                    </div>
                    </Container>
                </section>

                {/* Services Section */}
                <section id="services" className="py-32 relative z-10">
                    <Container>
                    <div className="mb-16">
                        <Reveal>
                        <h2 className="text-3xl font-serif font-bold text-j-light-text dark:text-white mb-4">{t.services.title}</h2>
                        <p className="text-j-light-text/70 dark:text-j-dark-text/70 max-w-2xl">
                            {t.services.subtitle}
                        </p>
                        </Reveal>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                        <div className="animate-pulse text-warm-glow font-serif italic text-lg">{t.services.loading}</div>
                        </div>
                    ) : (
                        <ServiceList 
                        services={services} 
                        onSelectService={handleSelectService} 
                        t={t} 
                        currency={defaultCurrency}
                        />
                    )}
                    </Container>
                </section>

                {/* Portfolio Section */}
                <PortfolioSection t={t} />

                {/* Contact Section */}
                <ContactSection t={t} />

                {/* Footer */}
                <footer className="border-t border-j-light-text/5 dark:border-white/5 py-12 bg-j-light-bg/50 dark:bg-black/60 backdrop-blur-md relative z-10 bg-grain">
                    <Container>
                    <Reveal className="flex flex-col md:flex-row justify-between items-center text-sm text-j-light-text/60 dark:text-j-dark-text/60">
                        <p>&copy; 2024 {t.footer.rights}</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-warm-glow transition-colors">{t.footer.terms}</a>
                        <a href="#" className="hover:text-warm-glow transition-colors">{t.footer.privacy}</a>
                        <a href="#" className="hover:text-warm-glow transition-colors">Twitter</a>
                        </div>
                    </Reveal>
                    </Container>
                </footer>
             </motion.div>
         ) : view === 'dashboard' ? (
            <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
            >
                {user && (
                    <ClientDashboard 
                        user={user} 
                        onLogout={handleLogout} 
                        t={t} 
                        defaultCurrency={defaultCurrency}
                        onPayProject={handleProjectPayment}
                    />
                )}
            </motion.div>
         ) : (
             <motion.div
                key="admin"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5 }}
             >
                <AdminDashboard onLogout={handleLogout} />
             </motion.div>
         )}
      </AnimatePresence>

      {/* Payment Modal */}
      <CheckoutModal 
        service={selectedService} 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        defaultCurrency={defaultCurrency}
        t={t}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
        t={t} 
      />

      {/* Scroll To Top Button */}
      <AnimatePresence>
        {showScrollTop && view === 'landing' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3 rounded-full shadow-xl cursor-pointer backdrop-blur-md border border-white/10 bg-j-light-text text-white dark:bg-warm-glow dark:text-j-dark-bg hover:opacity-90 transition-all"
            aria-label="Scroll to top"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
