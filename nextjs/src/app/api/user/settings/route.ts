import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// GET /api/user/settings
export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  const u = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true, email: true, phone: true, avatar: true } });
  if (!u) return errorJson('Хэрэглэгч олдсонгүй', 404);

  return json(u);
}

// PUT /api/user/settings
export async function PUT(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  const { name, phone, avatar } = await req.json();

  await prisma.user.update({
    where: { id: user.id },
    data: { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }) },
  });

  return json({ message: 'Хадгалагдлаа' });
}
