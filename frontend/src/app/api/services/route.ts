import { NextResponse } from 'next/server';
import type { Language, RawService, Service, ServiceType } from '@/types';

// Default Data (copiar de betancourt-audio/services/api.ts)
const DEFAULT_RAW_SERVICES: RawService[] = [
  {
    id: '1',
    name: { en: 'Stem Mixing', es: 'Mezcla por Stems' },
    description: {
      en: 'Professional mixing service for up to 20 stems. Analog warmth meets digital precision.',
      es: 'Servicio profesional de mezcla hasta 20 stems. Calidez analógica con precisión digital.'
    },
    priceUsd: 150,
    priceCop: 600000,
    type: 'MIXING' as ServiceType,
    features: {
      en: ['Analog Summing', 'Vocal Tuning', '3 Revisions', 'High-Res Delivery'],
      es: ['Sumador Analógico', 'Afinación Vocal', '3 Revisiones', 'Entrega en Alta Resolución']
    },
    isPopular: true
  },
  {
    id: '2',
    name: { en: 'Stereo Mastering', es: 'Masterización Estéreo' },
    description: {
      en: 'The final polish your track needs to compete on streaming platforms.',
      es: 'El pulido final que tu track necesita para competir en plataformas de streaming.'
    },
    priceUsd: 60,
    priceCop: 240000,
    type: 'MASTERING' as ServiceType,
    features: {
      en: ['Loudness Optimization', 'EQ & Compression', 'Metadata Tagging', 'Apple Digital Master'],
      es: ['Optimización de Loudness', 'EQ y Compresión', 'Metadatos', 'Apple Digital Master']
    },
    imageUrl: 'https://picsum.photos/400/300'
  },
  {
    id: '3',
    name: { en: 'Full Production', es: 'Producción Completa' },
    description: {
      en: 'From a simple demo to a radio-ready hit. Full instrumental production.',
      es: 'De un simple demo a un éxito radial. Producción instrumental completa.'
    },
    priceUsd: 500,
    priceCop: 2000000,
    type: 'PRODUCTION' as ServiceType,
    features: {
      en: ['Custom Composition', 'Session Musicians', 'Arrangement', 'Mixing Included'],
      es: ['Composición Personalizada', 'Músicos de Sesión', 'Arreglos', 'Mezcla Incluida']
    }
  },
  {
    id: '4',
    name: { en: 'Career Consultation', es: 'Consultoría de Carrera' },
    description: {
      en: '1-on-1 strategy session to plan your next release or career move.',
      es: 'Sesión estratégica 1 a 1 para planear tu próximo lanzamiento o paso profesional.'
    },
    priceUsd: 100,
    priceCop: 400000,
    type: 'CONSULTATION' as ServiceType,
    features: {
      en: ['1 Hour Video Call', 'Release Strategy', 'Playlist Pitching Guide'],
      es: ['Videollamada de 1 Hora', 'Estrategia de Lanzamiento', 'Guía de Pitching']
    }
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get('lang') || 'en') as Language;

  // Simulate latency
  await new Promise(resolve => setTimeout(resolve, 300));

  const services: Service[] = DEFAULT_RAW_SERVICES.map(s => ({
    id: s.id,
    name: s.name[lang],
    description: s.description[lang],
    priceUsd: s.priceUsd,
    priceCop: s.priceCop,
    type: s.type,
    features: s.features[lang],
    imageUrl: s.imageUrl,
    isPopular: s.isPopular
  }));

  return NextResponse.json(services);
}
