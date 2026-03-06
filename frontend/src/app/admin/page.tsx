'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PortfolioItem } from '@/types';

export default function AdminPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/portfolio')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const total = items.length
  const published = items.filter(i => i.published).length
  const featured = items.filter(i => i.featured).length
  const categories = ['MIXING', 'MASTERING', 'PRODUCTION', 'ATMOS'].map(cat => ({
    name: cat,
    count: items.filter(i => i.category === cat).length,
  }))

  const stats = [
    { icon: '🎵', label: 'Total items', value: loading ? '—' : String(total) },
    { icon: '🌐', label: 'Publicados', value: loading ? '—' : String(published) },
    { icon: '⭐', label: 'Destacados', value: loading ? '—' : String(featured) },
    { icon: '🔒', label: 'Borradores', value: loading ? '—' : String(total - published) },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-1">
          Admin Panel
        </h1>
        <p className="text-j-light-text/60 dark:text-j-dark-text/60 text-sm">
          Panel de gestión de contenidos — Betancourt Audio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-j-light-text/10 dark:border-white/10 p-5"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold text-j-light-text dark:text-j-dark-text">{stat.value}</p>
            <p className="text-xs text-j-light-text/50 dark:text-j-dark-text/50 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="bg-white/50 dark:bg-white/5 rounded-2xl border border-j-light-text/10 dark:border-white/10 p-6 mb-6">
        <h2 className="text-lg font-semibold text-j-light-text dark:text-j-dark-text mb-4">
          Por categoría
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(cat => (
            <div key={cat.name} className="text-center p-4 rounded-xl bg-j-light-text/5 dark:bg-white/5">
              <p className="text-xl font-bold text-warm-glow">{loading ? '—' : cat.count}</p>
              <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60 mt-1">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white/50 dark:bg-white/5 rounded-2xl border border-j-light-text/10 dark:border-white/10 p-6">
        <h2 className="text-lg font-semibold text-j-light-text dark:text-j-dark-text mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/portfolio">
            <div className="p-5 rounded-xl bg-warm-glow/10 hover:bg-warm-glow/20 border border-warm-glow/20 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">🎵</div>
              <h3 className="font-semibold text-j-light-text dark:text-j-dark-text mb-1">
                Gestionar Portafolio
              </h3>
              <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                Crear, editar y publicar items del portafolio
              </p>
            </div>
          </Link>
          <Link href="/admin/portfolio/new">
            <div className="p-5 rounded-xl bg-warm-glow/10 hover:bg-warm-glow/20 border border-warm-glow/20 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">➕</div>
              <h3 className="font-semibold text-j-light-text dark:text-j-dark-text mb-1">
                Nuevo Item
              </h3>
              <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                Agregar un nuevo trabajo al portafolio
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
