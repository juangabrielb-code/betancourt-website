'use client';

import { useState } from 'react';
import { Input, TextArea, Button } from '@/components/ui/UI';
import { ImageUpload } from './ImageUpload';

const SERVICE_TYPES = [
  { value: 'MIXING', label: '🎚️ Mixing' },
  { value: 'MASTERING', label: '🎛️ Mastering' },
  { value: 'PRODUCTION', label: '🎹 Production' },
  { value: 'CONSULTATION', label: '💬 Consultoría' },
];

interface ServiceItemData {
  id?: string;
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  priceUsd: number;
  priceCop: number;
  type: string;
  featuresEn: string[];
  featuresEs: string[];
  imageUrl: string;
  isPopular: boolean;
  active: boolean;
  sortOrder: number;
}

interface ServiceItemFormProps {
  initialData?: ServiceItemData;
  onSuccess: (item: ServiceItemData) => void;
  onCancel: () => void;
}

const emptyForm: ServiceItemData = {
  nameEn: '',
  nameEs: '',
  descriptionEn: '',
  descriptionEs: '',
  priceUsd: 0,
  priceCop: 0,
  type: 'MIXING',
  featuresEn: [],
  featuresEs: [],
  imageUrl: '',
  isPopular: false,
  active: true,
  sortOrder: 0,
};

export const ServiceItemForm: React.FC<ServiceItemFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const isEditing = !!initialData;
  const [form, setForm] = useState<ServiceItemData>(initialData ?? emptyForm);
  const [featuresEnInput, setFeaturesEnInput] = useState(initialData?.featuresEn.join('\n') ?? '');
  const [featuresEsInput, setFeaturesEsInput] = useState(initialData?.featuresEs.join('\n') ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof ServiceItemData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      ...form,
      featuresEn: featuresEnInput.split('\n').map(f => f.trim()).filter(Boolean),
      featuresEs: featuresEsInput.split('\n').map(f => f.trim()).filter(Boolean),
      priceUsd: Number(form.priceUsd),
      priceCop: Number(form.priceCop),
      sortOrder: Number(form.sortOrder),
    };

    try {
      const url = isEditing ? `/api/admin/services/${initialData!.id}` : '/api/admin/services';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      const item = await res.json();
      onSuccess(item);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
          Tipo de servicio *
        </label>
        <select
          value={form.type}
          onChange={e => update('type', e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-j-light-surface/50 dark:bg-white/5 border border-j-light-text/10 dark:border-white/10 text-j-light-text dark:text-j-dark-text text-sm focus:outline-none focus:border-warm-glow/50"
        >
          {SERVICE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Nombres */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Nombre (ES) *
          </label>
          <Input
            value={form.nameEs}
            onChange={e => update('nameEs', e.target.value)}
            placeholder="Mezcla por Stems"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Name (EN) *
          </label>
          <Input
            value={form.nameEn}
            onChange={e => update('nameEn', e.target.value)}
            placeholder="Stem Mixing"
            required
          />
        </div>
      </div>

      {/* Descripciones */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Descripción (ES) *
          </label>
          <TextArea
            value={form.descriptionEs}
            onChange={e => update('descriptionEs', e.target.value)}
            placeholder="Descripción en español..."
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Description (EN) *
          </label>
          <TextArea
            value={form.descriptionEn}
            onChange={e => update('descriptionEn', e.target.value)}
            placeholder="Description in English..."
            rows={3}
            required
          />
        </div>
      </div>

      {/* Precios */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Precio USD *
          </label>
          <Input
            type="number"
            min="0"
            value={String(form.priceUsd)}
            onChange={e => update('priceUsd', e.target.value)}
            placeholder="150"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Precio COP *
          </label>
          <Input
            type="number"
            min="0"
            value={String(form.priceCop)}
            onChange={e => update('priceCop', e.target.value)}
            placeholder="600000"
            required
          />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Características (ES) — una por línea
          </label>
          <TextArea
            value={featuresEsInput}
            onChange={e => setFeaturesEsInput(e.target.value)}
            placeholder={"Sumador Analógico\n3 Revisiones\nEntrega HD"}
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
            Features (EN) — one per line
          </label>
          <TextArea
            value={featuresEnInput}
            onChange={e => setFeaturesEnInput(e.target.value)}
            placeholder={"Analog Summing\n3 Revisions\nHigh-Res Delivery"}
            rows={4}
          />
        </div>
      </div>

      {/* Imagen */}
      <ImageUpload
        value={form.imageUrl}
        onChange={url => update('imageUrl', url)}
        label="Imagen del servicio (opcional)"
      />

      {/* Orden */}
      <div>
        <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text mb-2">
          Orden
        </label>
        <Input
          type="number"
          min="0"
          value={String(form.sortOrder)}
          onChange={e => update('sortOrder', e.target.value)}
          placeholder="0"
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPopular}
            onChange={e => update('isPopular', e.target.checked)}
            className="w-4 h-4 accent-yellow-500"
          />
          <span className="text-sm text-j-light-text dark:text-j-dark-text">⭐ Popular</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={e => update('active', e.target.checked)}
            className="w-4 h-4 accent-warm-glow"
          />
          <span className="text-sm text-j-light-text dark:text-j-dark-text">🌐 Activo (visible)</span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-xl">{error}</p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear servicio'}
        </Button>
      </div>
    </form>
  );
};
