'use client';

import { useRef, useState } from 'react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

// Image compression guidelines:
// - Max dimension: 1200px (width or height)
// - Format: WebP at 82% quality
// - Typical output: 100–350 KB — good quality, low storage
const MAX_PX = 1200;
const QUALITY = 0.82;

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > MAX_PX || height > MAX_PX) {
        if (width > height) {
          height = Math.round((height * MAX_PX) / width);
          width = MAX_PX;
        } else {
          width = Math.round((width * MAX_PX) / height);
          height = MAX_PX;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/webp',
        QUALITY
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = 'Imagen de portada' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlMode, setUrlMode] = useState(false);

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const sizeMB = (compressed.size / 1024 / 1024).toFixed(2);

      const form = new FormData();
      form.append('file', new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }));

      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload falló');
      onChange(data.url);
      console.info(`Imagen subida: ${sizeMB}MB (después de compresión)`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-j-light-text dark:text-j-dark-text">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setUrlMode(m => !m)}
          className="text-xs text-j-light-text/40 dark:text-j-dark-text/40 hover:text-warm-glow transition-colors"
        >
          {urlMode ? '↑ Subir archivo' : '🔗 Usar URL'}
        </button>
      </div>

      {urlMode ? (
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-3 rounded-xl bg-j-light-surface/50 dark:bg-white/5 border border-j-light-text/10 dark:border-white/10 text-j-light-text dark:text-j-dark-text text-sm focus:outline-none focus:border-warm-glow/50"
        />
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all cursor-pointer
            ${uploading ? 'opacity-50 cursor-wait' : 'hover:border-warm-glow/50 hover:bg-warm-glow/5'}
            ${value ? 'border-warm-glow/30 p-2' : 'border-j-light-text/20 dark:border-white/20 p-8'}
          `}
        >
          {value ? (
            <div className="relative w-full">
              <img src={value} alt="preview" className="w-full h-40 object-cover rounded-lg" />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onChange(''); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-red-500/80 transition-colors"
              >
                ✕
              </button>
              <div
                className="absolute inset-0 rounded-lg bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
              >
                <span className="text-white text-xs font-medium">Cambiar imagen</span>
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl">{uploading ? '⏳' : '📷'}</div>
              <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60 text-center">
                {uploading ? 'Comprimiendo y subiendo...' : 'Haz clic para subir una imagen'}
              </p>
              <p className="text-xs text-j-light-text/40 dark:text-j-dark-text/40 text-center">
                JPG, PNG, WebP · Se comprime automáticamente a máx 1200px / WebP 82%
              </p>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
      )}
    </div>
  );
};
