'use client';

import { useState } from 'react';
import { PortfolioItem, CreatePortfolioItemInput, PortfolioMediaType, PortfolioCategory } from '@/types';
import { GlassCard, Button, Input, TextArea } from '@/components/ui/UI';
import { EmbedPreview } from './EmbedPreview';
import { ImageUpload } from './ImageUpload';

interface PortfolioItemFormProps {
  initialData?: PortfolioItem;
  onSuccess: (item: PortfolioItem) => void;
  onCancel: () => void;
}

const MEDIA_TYPES: { value: PortfolioMediaType; label: string; icon: string }[] = [
  { value: 'YOUTUBE', label: 'YouTube', icon: '▶️' },
  { value: 'SPOTIFY', label: 'Spotify', icon: '🎵' },
  { value: 'SOUNDCLOUD', label: 'SoundCloud', icon: '🔊' },
  { value: 'FILE', label: 'URL de archivo', icon: '📁' },
]

const CATEGORIES: { value: PortfolioCategory; label: string }[] = [
  { value: 'MIXING', label: 'Mixing' },
  { value: 'MASTERING', label: 'Mastering' },
  { value: 'PRODUCTION', label: 'Producción' },
  { value: 'ATMOS', label: 'Dolby Atmos' },
]

const emptyForm: CreatePortfolioItemInput = {
  title: '',
  description: '',
  mediaType: 'YOUTUBE',
  embedUrl: '',
  fileUrl: '',
  fileKey: '',
  category: 'MIXING',
  tags: [],
  coverImage: '',
  featured: false,
  published: false,
  sortOrder: 0,
}

export const PortfolioItemForm: React.FC<PortfolioItemFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const isEditing = !!initialData
  const [form, setForm] = useState<CreatePortfolioItemInput>(
    initialData
      ? { ...initialData }
      : emptyForm
  )
  const [tagsInput, setTagsInput] = useState(initialData?.tags.join(', ') ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (key: keyof CreatePortfolioItemInput, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const mediaUrl = form.mediaType === 'FILE' ? form.fileUrl : form.embedUrl

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      ...form,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    }

    try {
      const url = isEditing
        ? `/api/admin/portfolio/${initialData!.id}`
        : '/api/admin/portfolio'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }

      const item = await res.json()
      onSuccess(item)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
          Título *
        </label>
        <Input
          value={form.title}
          onChange={e => update('title', e.target.value)}
          placeholder="Nombre del proyecto"
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
          Descripción
        </label>
        <TextArea
          value={form.description ?? ''}
          onChange={e => update('description', e.target.value)}
          placeholder="Descripción breve del proyecto"
          rows={3}
        />
      </div>

      {/* Tipo de media + Categoría */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Tipo de media *
          </label>
          <select
            value={form.mediaType}
            onChange={e => update('mediaType', e.target.value as PortfolioMediaType)}
            className="w-full px-4 py-3 rounded-xl bg-j-light-surface/50 dark:bg-white/5 border border-j-light-text/10 dark:border-white/10 text-j-light-text dark:text-j-dark-text text-sm focus:outline-none focus:border-warm-glow/50"
          >
            {MEDIA_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Categoría *
          </label>
          <select
            value={form.category}
            onChange={e => update('category', e.target.value as PortfolioCategory)}
            className="w-full px-4 py-3 rounded-xl bg-j-light-surface/50 dark:bg-white/5 border border-j-light-text/10 dark:border-white/10 text-j-light-text dark:text-j-dark-text text-sm focus:outline-none focus:border-warm-glow/50"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
          {form.mediaType === 'FILE' ? 'URL del archivo' : `URL de ${form.mediaType}`}
        </label>
        <Input
          value={form.mediaType === 'FILE' ? (form.fileUrl ?? '') : (form.embedUrl ?? '')}
          onChange={e => form.mediaType === 'FILE'
            ? update('fileUrl', e.target.value)
            : update('embedUrl', e.target.value)
          }
          placeholder={
            form.mediaType === 'YOUTUBE' ? 'https://youtube.com/watch?v=...' :
            form.mediaType === 'SPOTIFY' ? 'https://open.spotify.com/track/...' :
            form.mediaType === 'SOUNDCLOUD' ? 'https://soundcloud.com/...' :
            'https://... (MP3, WAV, MP4)'
          }
        />
      </div>

      {/* Preview */}
      {mediaUrl && (
        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Preview
          </label>
          <EmbedPreview mediaType={form.mediaType} url={mediaUrl} />
        </div>
      )}

      {/* Cover Image */}
      <ImageUpload
        value={form.coverImage ?? ''}
        onChange={url => update('coverImage', url)}
        label="Imagen de portada"
      />

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
          Tags (separados por coma)
        </label>
        <Input
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="pop, electrónica, colaboración, etc."
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={e => update('featured', e.target.checked)}
            className="w-4 h-4 accent-warm-glow"
          />
          <span className="text-sm text-j-light-text dark:text-j-dark-text">⭐ Destacado</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={e => update('published', e.target.checked)}
            className="w-4 h-4 accent-warm-glow"
          />
          <span className="text-sm text-j-light-text dark:text-j-dark-text">🌐 Publicado</span>
        </label>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-xl">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear item'}
        </Button>
      </div>
    </form>
  )
}
