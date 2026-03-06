import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Language } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get('lang') || 'en') as Language;

  const rows = await prisma.serviceItem.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
  });

  const services = rows.map(s => ({
    id: s.id,
    name: lang === 'es' ? s.nameEs : s.nameEn,
    description: lang === 'es' ? s.descriptionEs : s.descriptionEn,
    priceUsd: s.priceUsd,
    priceCop: s.priceCop,
    type: s.type,
    features: lang === 'es' ? s.featuresEs : s.featuresEn,
    imageUrl: s.imageUrl,
    isPopular: s.isPopular,
  }));

  return NextResponse.json(services);
}
