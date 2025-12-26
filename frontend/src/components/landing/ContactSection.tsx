"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Container, GlassCard, Button, Input, TextArea, Reveal } from '../ui/UI';

interface ContactSectionProps {
  t: any;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ t }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validate = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', message: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSent(true);
    setFormData({ name: '', email: '', message: '' }); // Reset form
    setTimeout(() => setIsSent(false), 5000); // Reset success message after 5s
  };

  return (
    <section id="contact" className="py-24 relative z-10">
      <Container>
        <Reveal className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-j-light-text dark:text-white mb-4">
              {t.contact.title}
            </h2>
            <p className="text-j-light-text/70 dark:text-j-dark-text/70">
              {t.contact.subtitle}
            </p>
          </div>

          <GlassCard className="p-8 md:p-12 relative overflow-hidden">
             {/* Decorative blob inside card */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-warm-glow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {isSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-j-light-text dark:text-white mb-2">{t.contact.success}</h3>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="name"
                    label={t.contact.name}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                  />
                  <Input
                    name="email"
                    label={t.contact.email}
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                </div>
                <TextArea
                  name="message"
                  label={t.contact.message}
                  placeholder={t.contact.message}
                  value={formData.message}
                  onChange={handleChange}
                  error={errors.message}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="w-full md:w-auto min-w-[150px]"
                  >
                    {isSubmitting ? t.contact.sending : t.contact.send}
                  </Button>
                </div>
              </form>
            )}
          </GlassCard>
        </Reveal>
      </Container>
    </section>
  );
};
