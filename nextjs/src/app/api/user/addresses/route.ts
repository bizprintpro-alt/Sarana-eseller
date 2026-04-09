import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json } from '@/lib/api-auth';

// Addresses stored in user.store.addresses JSON array (no separate model)
// GET /api/user/addresses
export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  const u = await prisma.user.findUnique({ where: { id: user.id }, select: { store: true } });
  const addresses = (u?.store as any)?.addresses || [];

  return json(addresses);
}

// POST /api/user/addresses — save addresses array
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  const { addresses } = await req.json();

  const u = await prisma.user.findUnique({ where: { id: user.id }, select: { store: true } });
  const store = (u?.store || {}) as any;

  await prisma.user.update({
    where: { id: user.id },
    data: { store: { ...store, addresses } },
  });

  return json({ message: 'Хадгалагдлаа' });
}
