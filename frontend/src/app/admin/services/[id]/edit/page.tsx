'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceItemForm } from '@/components/admin/ServiceItemForm';

export default function EditServicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/services/${params.id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => { if (data) setItem(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-8 w-48 rounded-lg bg-j-light-text/10 dark:bg-white/10 animate-pulse mb-4" />
        <div className="h-96 rounded-2xl bg-j-light-text/5 dark:bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-lg font-medium text-j-light-text dark:text-j-dark-text">Servicio no encontrado</p>
        <button
          onClick={() => router.push('/admin/services')}
          className="mt-4 text-sm text-warm-glow hover:underline"
        >
          Volver a servicios
        </button>
      </div>
    );
  }

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
          Editar servicio
        </h1>
        <p className="text-j-light-text/60 dark:text-j-dark-text/60 text-sm truncate">
          {item.nameEs}
        </p>
      </div>

      <div className="bg-white/50 dark:bg-white/5 rounded-2xl border border-j-light-text/10 dark:border-white/10 p-6">
        <ServiceItemForm
          initialData={item}
          onSuccess={() => router.push('/admin/services')}
          onCancel={() => router.push('/admin/services')}
        />
      </div>
    </div>
  );
}
