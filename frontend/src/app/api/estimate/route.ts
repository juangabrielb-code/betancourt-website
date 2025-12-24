import { NextResponse } from 'next/server';
import type { ProjectWizardState } from '@/types';

export async function POST(request: Request) {
  const state: ProjectWizardState = await request.json();

  let base = 0;

  // Music
  if (state.category === 'MUSIC') {
    if (state.serviceType === 'stereo_mix') base = 150;
    if (state.serviceType === 'dolby_atmos') base = 300;
    if (state.serviceType === 'editing') base = 50;
    if (state.serviceType === 'music_production') base = 500;
    if (state.answers?.['duration'] === 'gt_11') base *= 1.5;
    if (state.answers?.['tracks'] === '64_128') base += 100;
  }

  // Media
  if (state.category === 'MEDIA') {
    if (state.serviceType === 'media_mix') base = 200;
    if (state.serviceType === 'sound_design') base = 300;
    if (state.serviceType === 'audio_repair') base = 100;
    if (state.serviceType === 'composition') base = 400;
    if (state.answers?.['content_type'] === 'feature_film') base *= 3;
    if (state.answers?.['format'] === '5.1') base += 150;
  }

  // Podcast
  if (state.category === 'PODCAST') {
    if (state.serviceType === 'podcast_edit') base = 50;
    if (state.serviceType === 'podcast_production') base = 200;
    if (state.answers?.['raw_duration'] === 'gt_60') base += 40;
  }

  // Timeframe multiplier
  if (state.timeframe === '24-48H') base *= 1.5;
  if (state.timeframe === 'NO_RUSH') base *= 0.9;

  const estimatedPrice = Math.round(base);

  return NextResponse.json({ estimatedPrice });
}
