import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

const MAX_BYTES = 4.5 * 1024 * 1024; // Vercel serverless body cap
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function sanitizeFilename(name: string): string {
  // Strip path separators and non-[A-Za-z0-9._-] to block traversal / shell chars
  return name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 120);
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const contentType = req.headers.get('content-type') || '';

    // Method 1: Stream upload (Vercel Blob recommended)
    const rawFilename = req.nextUrl.searchParams.get('filename');
    if (rawFilename) {
      const filename = sanitizeFilename(rawFilename);
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      if (!ALLOWED_EXT.has(ext)) {
        return NextResponse.json({ error: 'Зөвхөн зураг оруулна уу' }, { status: 400 });
      }
      // Enforce size via Content-Length (stream body can't be pre-measured)
      const declared = Number(req.headers.get('content-length') || '0');
      if (!declared || declared > MAX_BYTES) {
        return NextResponse.json({ error: 'Файл 4.5MB-аас бага байх ёстой' }, { status: 413 });
      }
      // Content-Type in header (attacker-controlled) — require image/* and cross-check ext
      const ctLower = contentType.toLowerCase();
      if (!ctLower.startsWith('image/') || !ALLOWED_MIME.has(ctLower.split(';')[0].trim())) {
        return NextResponse.json({ error: 'Зөвхөн зураг оруулна уу' }, { status: 400 });
      }

      const uniquePath = `eseller/${user.id}/${Date.now()}-${filename}`;
      const blob = await put(uniquePath, req.body!, { access: 'public', contentType: ctLower.split(';')[0].trim() });
      return NextResponse.json({ url: blob.url });
    }

    // Method 2: FormData upload (MediaUploader / ImageUpload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) return NextResponse.json({ error: 'Файл байхгүй' }, { status: 400 });
      if (file.size === 0 || file.size > MAX_BYTES) {
        return NextResponse.json({ error: 'Файл 4.5MB-аас бага байх ёстой' }, { status: 413 });
      }
      const mime = (file.type || '').toLowerCase();
      if (!ALLOWED_MIME.has(mime)) {
        return NextResponse.json({ error: 'Зөвхөн зураг оруулна уу' }, { status: 400 });
      }
      const safeName = sanitizeFilename(file.name || 'upload');
      const ext = safeName.split('.').pop()?.toLowerCase() || 'jpg';
      if (!ALLOWED_EXT.has(ext)) {
        return NextResponse.json({ error: 'Зөвхөн зураг оруулна уу' }, { status: 400 });
      }

      const path = `eseller/${user.id}/${Date.now()}.${ext}`;
      const blob = await put(path, file, { access: 'public', contentType: mime });
      return NextResponse.json({ url: blob.url });
    }

    return NextResponse.json({ error: 'filename query param эсвэл FormData шаардлагатай' }, { status: 400 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload амжилтгүй' }, { status: 500 });
  }
}
