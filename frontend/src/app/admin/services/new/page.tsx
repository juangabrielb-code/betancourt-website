'use client';

import { useRouter } from 'next/navigation';
import { ServiceItemForm } from '@/components/admin/ServiceItemForm';

export default function NewServicePage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-j-light-text/50 dark:text-j-dark-text/50 hover:text-j-light-text dark:hover:text-j-dark-text transition-colors mb-4 flex items-center gap-1"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-1">
          Nuevo servicio
        </h1>
        <p className="text-j-light-text/60 dark:text-j-dark-text/60 text-sm">
          Agrega un servicio con precios en USD y COP
        </p>
      </div>

      <div className="bg-white/50 dark:bg-white/5 rounded-2xl border border-j-light-text/10 dark:border-white/10 p-6">
        <ServiceItemForm
          onSuccess={() => router.push('/admin/services')}
          onCancel={() => router.push('/admin/services')}
        />
      </div>
    </div>
  );
}
