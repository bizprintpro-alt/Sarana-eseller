import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// POST /api/seller/verify — verify ESL code
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  const { code } = await req.json();
  if (!code || !code.startsWith('ESL-')) return errorJson('ESL-XXXXXX формат шаардлагатай', 400);

  const profile = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return errorJson('Борлуулагчийн профайл олдсонгүй', 404);
  if (profile.isVerified) return json({ message: 'Аль хэдийн баталгаажсан', alreadyVerified: true });

  // Verify code matches username pattern
  const expected = `ESL-${profile.username.toUpperCase().slice(0, 6).padEnd(6, '0')}`;
  if (code.toUpperCase() !== expected) return errorJson('Буруу код', 400);

  await prisma.sellerProfile.update({
    where: { id: profile.id },
    data: { isVerified: true },
  });

  return json({ message: 'Амжилттай баталгаажлаа!', verified: true });
}
