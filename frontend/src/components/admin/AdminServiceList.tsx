'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const TYPE_COLORS: Record<string, string> = {
  MIXING: 'bg-blue-500/20 text-blue-400',
  MASTERING: 'bg-purple-500/20 text-purple-400',
  PRODUCTION: 'bg-warm-glow/20 text-warm-glow',
  CONSULTATION: 'bg-slate-500/20 text-slate-400',
};

interface ServiceItem {
  id: string;
  nameEs: string;
  nameEn: string;
  priceUsd: number;
  priceCop: number;
  type: string;
  isPopular: boolean;
  active: boolean;
}

export const AdminServiceList: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id: string, field: 'active' | 'isPopular', value: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    await fetch(`/api/admin/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-j-light-text/5 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-j-light-text/40 dark:text-j-dark-text/40">
        <p className="text-4xl mb-4">💰</p>
        <p className="text-lg font-medium">No hay servicios configurados</p>
        <p className="text-sm mt-1">Agrega el primero con el botón de arriba.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-j-light-text/10 dark:border-white/10 hover:border-warm-glow/30 transition-colors group"
        >
          {/* Type icon */}
          <div className="w-12 h-12 rounded-xl bg-j-light-text/10 dark:bg-white/10 flex-shrink-0 flex items-center justify-center text-xl">
            {item.type === 'MIXING' ? '🎚️' : item.type === 'MASTERING' ? '🎛️' : item.type === 'PRODUCTION' ? '🎹' : '💬'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-j-light-text dark:text-j-dark-text truncate">
                {item.nameEs}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[item.type] ?? 'bg-gray-500/20 text-gray-400'}`}>
                {item.type}
              </span>
              {item.isPopular && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-warm-glow/20 text-warm-glow font-medium">
                  ⭐ Popular
                </span>
              )}
            </div>
            <p className="text-xs text-warm-glow font-medium mt-0.5">
              ${item.priceUsd} USD · ${item.priceCop.toLocaleString('es-CO')} COP
            </p>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <label className="flex items-center gap-1.5 cursor-pointer" title="Activo">
              <input
                type="checkbox"
                checked={item.active}
                onChange={e => toggle(item.id, 'active', e.target.checked)}
                className="w-3.5 h-3.5 accent-warm-glow"
              />
              <span className="text-xs text-j-light-text/60 dark:text-j-dark-text/60 hidden sm:inline">
                {item.active ? '🌐' : '🔒'}
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer" title="Popular">
              <input
                type="checkbox"
                checked={item.isPopular}
                onChange={e => toggle(item.id, 'isPopular', e.target.checked)}
                className="w-3.5 h-3.5 accent-yellow-500"
              />
              <span className="text-xs text-j-light-text/60 dark:text-j-dark-text/60 hidden sm:inline">⭐</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => router.push(`/admin/services/${item.id}/edit`)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-j-light-text/10 dark:bg-white/10 hover:bg-warm-glow/20 hover:text-warm-glow text-j-light-text dark:text-j-dark-text transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(item.id, item.nameEs)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
