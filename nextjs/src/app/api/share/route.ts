import { NextRequest, NextResponse } from 'next/server';
import { generateQRCode } from '@/lib/share/generateShareContent';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    const qrCodeDataUrl = await generateQRCode(url);

    return NextResponse.json({ url, qrCodeDataUrl });
  } catch {
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
