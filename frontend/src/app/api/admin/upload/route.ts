import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = 'media';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'ADMIN') return null;
  return session;
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // Validate type (browser already compresses to webp/jpeg but accept both)
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 });
  }

  // Validate size: max 2MB after client compression (safety net)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Imagen demasiado grande (máx 2MB)' }, { status: 400 });
  }

  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `uploads/${filename}`;

  const bytes = await file.arrayBuffer();

  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type,
      'x-upsert': 'false',
    },
    body: bytes,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    // If bucket doesn't exist, give a helpful error
    if (uploadRes.status === 404 || err.includes('Bucket not found')) {
      return NextResponse.json(
        { error: 'Bucket "media" no existe. Créalo en Supabase → Storage → New bucket → "media" (public).' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: `Upload fallido: ${err}` }, { status: 500 });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  return NextResponse.json({ url: publicUrl });
}
