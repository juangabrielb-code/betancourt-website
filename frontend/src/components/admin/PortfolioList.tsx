'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioItem } from '@/types';
import { motion } from 'framer-motion';

const CATEGORY_COLORS: Record<string, string> = {
  MIXING: 'bg-blue-500/20 text-blue-400',
  MASTERING: 'bg-purple-500/20 text-purple-400',
  PRODUCTION: 'bg-warm-glow/20 text-warm-glow',
  ATMOS: 'bg-pink-500/20 text-pink-400',
}

const MEDIA_ICONS: Record<string, string> = {
  YOUTUBE: '▶️',
  SPOTIFY: '🎵',
  SOUNDCLOUD: '🔊',
  FILE: '📁',
}

export const PortfolioList: React.FC = () => {
  const router = useRouter()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await fetch('/api/admin/portfolio')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggle = async (id: string, field: 'published' | 'featured', value: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
    await fetch(`/api/admin/portfolio/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
  }

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-j-light-text/5 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-j-light-text/40 dark:text-j-dark-text/40">
        <p className="text-4xl mb-4">🎵</p>
        <p className="text-lg font-medium">No hay items en el portafolio</p>
        <p className="text-sm mt-1">Crea el primero con el botón de arriba.</p>
      </div>
    )
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
          {/* Cover thumbnail */}
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-j-light-text/10 dark:bg-white/10 flex-shrink-0">
            {item.coverImage ? (
              <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {MEDIA_ICONS[item.mediaType]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-j-light-text dark:text-j-dark-text truncate">
                {item.title}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category] ?? 'bg-gray-500/20 text-gray-400'}`}>
                {item.category}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-j-light-text/10 dark:bg-white/10 text-j-light-text/60 dark:text-j-dark-text/60">
                {MEDIA_ICONS[item.mediaType]} {item.mediaType}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-j-light-text/50 dark:text-j-dark-text/50 mt-0.5 truncate">
                {item.description}
              </p>
            )}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <label className="flex items-center gap-1.5 cursor-pointer" title="Publicado">
              <input
                type="checkbox"
                checked={item.published}
                onChange={e => toggle(item.id, 'published', e.target.checked)}
                className="w-3.5 h-3.5 accent-warm-glow"
              />
              <span className="text-xs text-j-light-text/60 dark:text-j-dark-text/60 hidden sm:inline">
                {item.published ? '🌐' : '🔒'}
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer" title="Destacado">
              <input
                type="checkbox"
                checked={item.featured}
                onChange={e => toggle(item.id, 'featured', e.target.checked)}
                className="w-3.5 h-3.5 accent-yellow-500"
              />
              <span className="text-xs text-j-light-text/60 dark:text-j-dark-text/60 hidden sm:inline">⭐</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => router.push(`/admin/portfolio/${item.id}/edit`)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-j-light-text/10 dark:bg-white/10 hover:bg-warm-glow/20 hover:text-warm-glow text-j-light-text dark:text-j-dark-text transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(item.id, item.title)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
