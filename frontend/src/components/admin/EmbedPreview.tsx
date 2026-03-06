'use client';

import { PortfolioMediaType } from '@/types';

interface EmbedPreviewProps {
  mediaType: PortfolioMediaType;
  url: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function getSpotifyEmbed(url: string): string | null {
  // https://open.spotify.com/track/xxx -> https://open.spotify.com/embed/track/xxx
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/)
  if (!match) return null
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}`
}

export const EmbedPreview: React.FC<EmbedPreviewProps> = ({ mediaType, url }) => {
  if (!url) {
    return (
      <div className="w-full h-40 rounded-xl bg-j-light-text/5 dark:bg-white/5 border border-j-light-text/10 dark:border-white/10 flex items-center justify-center">
        <p className="text-sm text-j-light-text/40 dark:text-j-dark-text/40">Preview aparecerá aquí</p>
      </div>
    )
  }

  if (mediaType === 'YOUTUBE') {
    const videoId = getYouTubeId(url)
    if (!videoId) return <p className="text-sm text-red-400">URL de YouTube inválida</p>
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (mediaType === 'SPOTIFY') {
    const embedUrl = getSpotifyEmbed(url)
    if (!embedUrl) return <p className="text-sm text-red-400">URL de Spotify inválida</p>
    return (
      <div className="w-full rounded-xl overflow-hidden">
        <iframe
          src={embedUrl}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ borderRadius: '12px' }}
        />
      </div>
    )
  }

  if (mediaType === 'SOUNDCLOUD') {
    return (
      <div className="w-full rounded-xl overflow-hidden">
        <iframe
          width="100%"
          height="166"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%237B9E87&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`}
          allow="autoplay"
        />
      </div>
    )
  }

  if (mediaType === 'FILE') {
    const isVideo = /\.(mp4|mov|webm|avi)$/i.test(url)
    const isAudio = /\.(mp3|wav|aac|flac|ogg)$/i.test(url)
    if (isVideo) return <video src={url} controls className="w-full rounded-xl" />
    if (isAudio) return <audio src={url} controls className="w-full" />
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-warm-glow underline">
        Abrir archivo ↗
      </a>
    )
  }

  return null
}
