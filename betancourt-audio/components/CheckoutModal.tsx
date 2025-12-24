
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Service, Currency, Project } from '../types';
import { ApiService } from '../services/api';
import { Button, GlassCard, Input } from './UI';

interface CheckoutModalProps {
  service: Service | null;
  project?: Project | null; // Optional Project Context
  isOpen: boolean;
  onClose: () => void;
  defaultCurrency: Currency;
  t: any;
  onPaymentSuccess?: (project: Project) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ service, project, isOpen, onClose, defaultCurrency, t, onPaymentSuccess }) => {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [paymentType, setPaymentType] = useState<'FULL' | 'SPLIT'>('FULL');
  
  // Email state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrency(defaultCurrency);
      setStep('details');
      setPaymentType('FULL');
      setEmail('');
      setEmailError('');
    }
  }, [isOpen, defaultCurrency]);

  if (!isOpen || !service) return null;

  // Determine base price: Use project price if available (from wizard), otherwise service base price
  const basePrice = project ? project.price : (currency === Currency.USD ? service.priceUsd : service.priceCop);
  
  // Calculate final amount based on payment type
  const finalAmount = paymentType === 'FULL' ? basePrice : basePrice / 2;
  const formattedAmount = ApiService.formatCurrency(finalAmount, currency);
  const formattedTotal = ApiService.formatCurrency(basePrice, currency);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePayment = async () => {
    if (!email.trim() || !validateEmail(email)) {
      setEmailError(t.checkout.emailError);
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order
      const response = await ApiService.createOrder(service.id, currency);
      
      // 2. Mock processing
      await ApiService.sendConfirmationEmail(email, response.orderId, service.name, formattedAmount);
      
      // 3. If Project context exists, update its status
      if (project) {
          await ApiService.updateProjectPayment(project.id, paymentType);
      }
      
      // Move to success step
      setStep('success');
      
      // Trigger callback after delay
      setTimeout(() => {
          if (onPaymentSuccess && project) onPaymentSuccess(project);
      }, 2000);
      
    } catch (error) {
      console.error('Payment initialization failed', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-j-dark-bg/80 dark:bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md"
        >
          <GlassCard className="overflow-hidden shadow-2xl">
            {step === 'details' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-j-light-text dark:text-j-dark-text">
                        {project ? project.title : service.name}
                    </h3>
                    <p className="text-j-light-text/60 dark:text-j-dark-text/60 text-sm mt-1">
                        {project ? service.name['en'] || service.name : t.checkout.professionalAudio}
                    </p>
                  </div>
                  <button onClick={onClose} className="text-j-light-text/50 hover:text-warm-glow dark:text-j-dark-text/50 dark:hover:text-warm-glow transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Payment Split Toggle */}
                {project && (
                    <div className="bg-black/10 dark:bg-white/5 p-1 rounded-lg grid grid-cols-2 gap-1">
                        <button
                            onClick={() => setPaymentType('FULL')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                paymentType === 'FULL' 
                                ? 'bg-white text-black shadow-sm' 
                                : 'text-j-light-text/60 dark:text-white/60 hover:text-white'
                            }`}
                        >
                            Pay Full (100%)
                        </button>
                        <button
                            onClick={() => setPaymentType('SPLIT')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                paymentType === 'SPLIT' 
                                ? 'bg-white text-black shadow-sm' 
                                : 'text-j-light-text/60 dark:text-white/60 hover:text-white'
                            }`}
                        >
                            Pay Deposit (50%)
                        </button>
                    </div>
                )}

                <div className="py-6 border-y border-j-light-text/10 dark:border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-sm text-j-light-text/80 dark:text-j-dark-text/80">
                    <span>Project Total</span>
                    <span>{formattedTotal}</span>
                  </div>
                  {paymentType === 'SPLIT' && (
                      <div className="flex justify-between items-center text-sm text-warm-glow">
                        <span>Remaining Balance (Due before delivery)</span>
                        <span>{formattedAmount}</span>
                      </div>
                  )}
                  <div className="flex justify-between items-center font-bold text-j-light-text dark:text-j-dark-text pt-2 border-t border-j-light-text/10 dark:border-white/5">
                    <span>{t.checkout.total} due today</span>
                    <span className="text-xl">{formattedAmount}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input 
                    label={t.checkout.emailLabel}
                    placeholder={t.checkout.emailPlaceholder}
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                    error={emailError}
                  />
                </div>

                <Button 
                  onClick={handlePayment} 
                  isLoading={loading}
                  className="w-full mt-4"
                  variant="primary"
                >
                  {t.checkout.pay} {formattedAmount}
                </Button>
                
                <p className="text-center text-xs text-j-light-text/50 dark:text-j-dark-text/50">
                  {t.checkout.securePayment} {currency === Currency.USD ? 'Stripe' : 'Bold'}.
                </p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-12 space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-j-light-text dark:text-j-dark-text">{t.checkout.successTitle}</h3>
                <p className="text-j-light-text/70 dark:text-j-dark-text/70">
                  Redirecting to file upload...
                </p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
