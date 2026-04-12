import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл байхгүй' }, { status: 400 });
    }

    // Зөвхөн зураг
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Зөвхөн зураг оруулна уу' }, { status: 400 });
    }

    // 10MB хязгаар
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Файл 10MB-аас бага байх ёстой' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `eseller/${user.id}/${Date.now()}.${ext}`;

    const { url } = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload амжилтгүй' }, { status: 500 });
  }
}
