"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, GlassCard, TextArea } from '../ui/UI';
import { ProjectWizardState, ProjectCategory, Currency } from '@/types';
import { formatCurrency } from '@/utils/currency';

interface NewProjectWizardProps {
  onClose: () => void;
  onProjectCreated: () => void;
  currency: Currency;
  t: any;
}

const STEP_TITLES = [
  "Select Category",
  "Choose Service",
  "Project Details",
  "Timeframe",
  "Review & Submit"
];

export const NewProjectWizard: React.FC<NewProjectWizardProps> = ({ onClose, onProjectCreated, currency, t }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<ProjectWizardState>({
    category: null,
    serviceType: null,
    answers: {},
    timeframe: null,
    acceptedTerms: false,
    estimatedPrice: 0,
    context: ''
  });

  // Calculate price whenever dependencies change
  useEffect(() => {
    const price = calculateEstimate(state);
    setState(prev => ({ ...prev, estimatedPrice: price }));
  }, [state.category, state.serviceType, state.answers, state.timeframe]);

  const calculateEstimate = (state: ProjectWizardState): number => {
    // Simple pricing logic - can be enhanced
    let basePrice = 200;

    if (state.category === 'MUSIC') basePrice = 300;
    if (state.category === 'MEDIA') basePrice = 500;
    if (state.category === 'PODCAST') basePrice = 150;

    if (state.timeframe === '24-48H') basePrice *= 1.5;
    if (state.timeframe === 'NO_RUSH') basePrice *= 0.9;

    return basePrice;
  };

  const updateState = (key: keyof ProjectWizardState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const updateAnswer = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [key]: value }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });

      if (!response.ok) throw new Error('Failed to submit project');

      onProjectCreated();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- QUESTIONS CONFIGURATION ---
  const getSubServices = (category: ProjectCategory | null) => {
    switch (category) {
      case 'MUSIC': return [
        { id: 'stereo_mix', label: 'Stereo Mix' },
        { id: 'dolby_atmos', label: 'Dolby Atmos Mix' },
        { id: 'editing', label: 'Track Editing' },
        { id: 'music_production', label: 'Music Production' },
      ];
      case 'MEDIA': return [
        { id: 'media_mix', label: 'Sound Mix (Film/TV/Ads)' },
        { id: 'sound_design', label: 'Sound Design & Foley' },
        { id: 'audio_repair', label: 'Audio Repair' },
        { id: 'composition', label: 'Scoring & Composition' },
      ];
      case 'PODCAST': return [
        { id: 'podcast_edit', label: 'Podcast Editing' },
        { id: 'podcast_production', label: 'Full Production' },
      ];
      default: return [];
    }
  };

  const renderQuestions = () => {
    // Music Questions
    if (state.serviceType === 'stereo_mix') {
      return (
        <div className="space-y-4">
          <SelectField label="Duration" value={state.answers['duration']} onChange={(v: string) => updateAnswer('duration', v)} options={[
            { val: 'lt_5', txt: '< 5 Minutes' },
            { val: '5_11', txt: '5 - 11 Minutes' },
            { val: 'gt_11', txt: '> 11 Minutes' }
          ]} />
          <SelectField label="Track Count" value={state.answers['tracks']} onChange={(v: string) => updateAnswer('tracks', v)} options={[
            { val: '1_24', txt: '1 - 24 Tracks' },
            { val: '24_64', txt: '24 - 64 Tracks' },
            { val: '64_128', txt: '64 - 128 Tracks' }
          ]} />
        </div>
      );
    }

    // Media Questions
    if (state.serviceType === 'media_mix') {
      return (
        <div className="space-y-4">
          <SelectField label="Content Type" value={state.answers['content_type']} onChange={(v: string) => updateAnswer('content_type', v)} options={[
            { val: 'short', txt: 'Short Film / Ad (< 15 min)' },
            { val: 'medium', txt: 'Mid-length (15 - 45 min)' },
            { val: 'feature_film', txt: 'Feature Film (> 45 min)' }
          ]} />
          <SelectField label="Delivery Format" value={state.answers['format']} onChange={(v: string) => updateAnswer('format', v)} options={[
            { val: 'stereo', txt: 'Stereo' },
            { val: '5.1', txt: '5.1 Surround' },
            { val: 'full_me', txt: 'Full Mix + M&E' }
          ]} />
        </div>
      );
    }

    // Podcast Questions
    if (state.serviceType === 'podcast_edit') {
       return (
        <div className="space-y-4">
          <SelectField label="Raw Material Duration" value={state.answers['raw_duration']} onChange={(v: string) => updateAnswer('raw_duration', v)} options={[
            { val: 'lt_30', txt: '< 30 Minutes' },
            { val: '30_60', txt: '30 - 60 Minutes' },
            { val: 'gt_60', txt: '> 60 Minutes' }
          ]} />
          <SelectField label="Number of Voices" value={state.answers['voices']} onChange={(v: string) => updateAnswer('voices', v)} options={[
            { val: '1', txt: '1 Voice' },
            { val: '2', txt: '2 Voices' },
            { val: 'gt_2', txt: '3+ Voices' }
          ]} />
        </div>
       );
    }

    // Generic fallback for production/others
    return (
       <div className="p-4 bg-warm-glow/5 rounded-lg border border-warm-glow/20">
         <p className="text-sm text-j-light-text dark:text-j-dark-text">For production services, please describe your project in the next step.</p>
       </div>
    );
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-j-dark-bg/90 dark:bg-black/90 backdrop-blur-md" onClick={onClose} />

      <GlassCard className="w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto flex flex-col p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-j-light-text/10 dark:border-white/10">
           <div>
             <h2 className="text-xl font-serif font-bold text-j-light-text dark:text-white">New Project</h2>
             <p className="text-xs text-warm-glow">{STEP_TITLES[currentStep]}</p>
           </div>

           <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-j-light-text/60 dark:text-white/60">Estimate</p>
                <p className="text-lg font-bold text-j-light-text dark:text-white">
                  {formatCurrency(state.estimatedPrice, currency)}
                </p>
              </div>
              <button onClick={onClose} className="text-j-light-text/50 dark:text-white/50 hover:text-warm-glow dark:hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-[300px]">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentStep}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.2 }}
               className="h-full"
             >
               {/* STEP 1: CATEGORY */}
               {currentStep === 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                   {(['MUSIC', 'MEDIA', 'PODCAST'] as ProjectCategory[]).map((cat) => (
                     <button
                        key={cat}
                        onClick={() => { updateState('category', cat); nextStep(); }}
                        className={`p-6 rounded-2xl border transition-all flex flex-col items-center justify-center gap-4 hover:scale-105 ${
                          state.category === cat
                          ? 'bg-warm-glow text-j-dark-bg border-warm-glow'
                          : 'bg-j-light-surface/50 dark:bg-white/5 border-j-light-text/10 dark:border-white/10 hover:bg-j-light-text/5 dark:hover:bg-white/10'
                        }`}
                     >
                       <span className="text-3xl">
                         {cat === 'MUSIC' && '🎵'}
                         {cat === 'MEDIA' && '🎬'}
                         {cat === 'PODCAST' && '🎙️'}
                       </span>
                       <span className="font-bold">{cat}</span>
                     </button>
                   ))}
                 </div>
               )}

               {/* STEP 2: SERVICE TYPE */}
               {currentStep === 1 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getSubServices(state.category).map((srv) => (
                      <button
                        key={srv.id}
                        onClick={() => { updateState('serviceType', srv.id); updateState('answers', {}); nextStep(); }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          state.serviceType === srv.id
                          ? 'bg-warm-glow/20 border-warm-glow text-warm-glow'
                          : 'bg-j-light-surface/50 dark:bg-white/5 border-j-light-text/10 dark:border-white/10 hover:bg-j-light-text/5 dark:hover:bg-white/10'
                        }`}
                      >
                        {srv.label}
                      </button>
                    ))}
                 </div>
               )}

               {/* STEP 3: DYNAMIC QUESTIONS */}
               {currentStep === 2 && (
                 <div className="space-y-6">
                    <h3 className="text-lg font-bold mb-4 text-j-light-text dark:text-white">Technical Details</h3>
                    {renderQuestions()}
                    <div className="mt-6">
                        <TextArea
                            label="Project Description / Context"
                            placeholder="Tell me more about the vibe, references, or specific needs..."
                            value={state.context}
                            onChange={(e) => updateState('context', e.target.value)}
                        />
                    </div>
                 </div>
               )}

               {/* STEP 4: TIMEFRAME */}
               {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-4 text-j-light-text dark:text-white">When do you need this?</h3>
                    {[
                      { val: '24-48H', txt: 'Rush (24-48 Hours)', extra: '+50%' },
                      { val: '1_WEEK', txt: 'Standard (1 Week)', extra: '' },
                      { val: 'NO_RUSH', txt: 'No Rush / Flexible', extra: '-10% Discount' },
                    ].map((opt) => (
                       <button
                        key={opt.val}
                        onClick={() => updateState('timeframe', opt.val)}
                        className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${
                          state.timeframe === opt.val
                          ? 'bg-warm-glow/20 border-warm-glow text-warm-glow'
                          : 'bg-j-light-surface/50 dark:bg-white/5 border-j-light-text/10 dark:border-white/10 hover:bg-j-light-text/5 dark:hover:bg-white/10'
                        }`}
                       >
                         <span>{opt.txt}</span>
                         <span className="text-xs font-mono opacity-70">{opt.extra}</span>
                       </button>
                    ))}
                  </div>
               )}

               {/* STEP 5: REVIEW */}
               {currentStep === 4 && (
                 <div className="space-y-6">
                    <div className="bg-j-light-text/10 dark:bg-black/20 p-4 rounded-xl space-y-2 text-sm text-j-light-text/80 dark:text-j-dark-text/80 border border-j-light-text/5 dark:border-white/5">
                       <p><strong className="text-j-light-text dark:text-white">Category:</strong> {state.category}</p>
                       <p><strong className="text-j-light-text dark:text-white">Service:</strong> {state.serviceType}</p>
                       <p><strong className="text-j-light-text dark:text-white">Timeframe:</strong> {state.timeframe}</p>
                       <p><strong className="text-j-light-text dark:text-white">Context:</strong> {state.context || 'N/A'}</p>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group">
                       <input
                         type="checkbox"
                         checked={state.acceptedTerms}
                         onChange={(e) => updateState('acceptedTerms', e.target.checked)}
                         className="mt-1 w-5 h-5 rounded border-j-light-text/20 dark:border-white/20 bg-j-light-text/10 dark:bg-black/20 text-warm-glow focus:ring-warm-glow"
                       />
                       <span className="text-sm text-j-light-text/60 dark:text-white/60 group-hover:text-j-light-text/80 dark:group-hover:text-white/80 transition-colors">
                         I agree to the Terms & Conditions. I understand that the estimated price is subject to final review based on the files provided.
                       </span>
                    </label>
                 </div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-j-light-text/10 dark:border-white/10">
           {currentStep > 0 ? (
             <Button variant="secondary" onClick={prevStep}>Back</Button>
           ) : (
             <div />
           )}

           {currentStep < 4 ? (
             <Button variant="primary" onClick={nextStep} disabled={
               (currentStep === 0 && !state.category) ||
               (currentStep === 1 && !state.serviceType) ||
               (currentStep === 3 && !state.timeframe)
             }>
               Continue
             </Button>
           ) : (
             <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!state.acceptedTerms}
             >
               Submit Request
             </Button>
           )}
        </div>

      </GlassCard>
    </div>
  );
};

// Internal Select Component
const SelectField = ({ label, value, onChange, options }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-j-light-text/60 dark:text-white/60 uppercase tracking-wider ml-1">{label}</label>
    <div className="grid grid-cols-1 gap-2">
      {options.map((opt: any) => (
        <button
          key={opt.val}
          onClick={() => onChange(opt.val)}
          className={`px-4 py-3 rounded-lg text-sm text-left border transition-all ${
            value === opt.val
            ? 'bg-warm-glow/20 border-warm-glow text-j-light-text dark:text-white'
            : 'bg-j-light-text/10 dark:bg-black/20 border-j-light-text/5 dark:border-white/5 text-j-light-text/60 dark:text-white/60 hover:bg-j-light-text/20 dark:hover:bg-black/40'
          }`}
        >
          {opt.txt}
        </button>
      ))}
    </div>
  </div>
);
