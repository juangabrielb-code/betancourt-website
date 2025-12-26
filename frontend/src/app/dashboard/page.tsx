"use client";

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Dashboard will be accessible after implementing new auth system
  return (
    <div className="min-h-screen flex items-center justify-center bg-j-light-bg dark:bg-j-dark-bg">
      <div className="text-center">
        <h1 className="text-2xl font-serif font-bold text-j-light-text dark:text-white mb-4">
          Dashboard
        </h1>
        <p className="text-j-light-text/60 dark:text-white/60 mb-6">
          Authentication system pending implementation
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-warm-glow text-j-dark-bg font-medium rounded-xl hover:bg-warm-dim transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
