import React, { useRef } from 'react';
import { motion, HTMLMotionProps, useInView } from 'framer-motion';

// --- Types ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  isLoading?: boolean;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

// --- Components ---

export const Button: React.FC<ButtonProps & HTMLMotionProps<"button">> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-sm";
  
  const variants = {
    // Primary: Green accent
    primary: "bg-j-dark-text text-j-dark-bg dark:bg-warm-glow dark:text-j-dark-bg hover:opacity-90 shadow-warm-glow/20 shadow-lg",
    
    // Secondary: Muted surface
    secondary: "bg-zinc-200 text-j-light-text dark:bg-zinc-800 dark:text-j-dark-text hover:bg-zinc-300 dark:hover:bg-zinc-700",
    
    // Glass: Elegant border, subtle background
    glass: "bg-white/10 dark:bg-black/20 border border-j-light-text/10 dark:border-white/10 text-j-light-text dark:text-j-dark-text hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-md"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : children}
    </motion.button>
  );
};

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  // Conditional styling based on error state
  const borderStyles = error 
    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" 
    : "border-j-light-text/10 dark:border-white/10 focus:border-warm-glow/50 focus:ring-warm-glow/50";

  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-medium text-j-light-text/60 dark:text-j-dark-text/60 uppercase tracking-wider ml-1">{label}</label>}
      <input 
        className={`w-full bg-j-light-surface/50 dark:bg-black/20 border ${borderStyles} rounded-xl px-4 py-3 text-j-light-text dark:text-j-dark-text placeholder-j-light-text/30 dark:placeholder-white/20 focus:outline-none focus:ring-1 transition-all duration-300 backdrop-blur-sm ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  const borderStyles = error 
    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" 
    : "border-j-light-text/10 dark:border-white/10 focus:border-warm-glow/50 focus:ring-warm-glow/50";

  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-medium text-j-light-text/60 dark:text-j-dark-text/60 uppercase tracking-wider ml-1">{label}</label>}
      <textarea 
        className={`w-full bg-j-light-surface/50 dark:bg-black/20 border ${borderStyles} rounded-xl px-4 py-3 text-j-light-text dark:text-j-dark-text placeholder-j-light-text/30 dark:placeholder-white/20 focus:outline-none focus:ring-1 transition-all duration-300 backdrop-blur-sm min-h-[120px] resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => {
  // Green accent default
  const defaultColor = "bg-warm-glow/10 text-warm-dim dark:text-warm-glow border border-warm-glow/20";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-serif tracking-wide ${color || defaultColor}`}>
      {children}
    </span>
  );
};

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string } & HTMLMotionProps<"div">> = ({ children, className = '', ...props }) => (
  <motion.div
    // Increased backdrop blur to 2xl and added more opacity for better readability over complex background
    className={`bg-j-light-surface/80 dark:bg-j-dark-surface/80 border border-white/20 dark:border-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-xl shadow-warm-glow/5 dark:shadow-black/40 hover:border-warm-glow/30 transition-all duration-500 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

// New Reveal Component for Scroll Animations
export const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -50px 0px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};