import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const contentType = req.headers.get('content-type') || '';

    // Method 1: Stream upload (Vercel Blob recommended)
    // Client sends: fetch('/api/upload?filename=photo.jpg', { method: 'POST', body: file })
    const filename = req.nextUrl.searchParams.get('filename');
    if (filename) {
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        return NextResponse.json({ error: 'Зөвхөн зураг оруулна уу' }, { status: 400 });
      }

      const uniquePath = `eseller/${user.id}/${Date.now()}-${filename}`;
      const blob = await put(uniquePath, req.body!, { access: 'public' });
      return NextResponse.json({ url: blob.url });
    }

    // Method 2: FormData upload (fallback for MediaUploader)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'Файл байхгүй' }, { status: 400 });
      }

      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Зөвхөн зураг оруулна уу' }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Файл 10MB-аас бага байх ёстой' }, { status: 400 });
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const path = `eseller/${user.id}/${Date.now()}.${ext}`;
      const blob = await put(path, file, { access: 'public' });
      return NextResponse.json({ url: blob.url });
    }

    return NextResponse.json({ error: 'filename query param эсвэл FormData шаардлагатай' }, { status: 400 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload амжилтгүй' }, { status: 500 });
  }
}
