import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { ok, fail } from '@/lib/api-envelope';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        avatar: true,
        store: true,
      },
    });

    if (!user) return fail('Хэрэглэгч олдсонгүй', 404);

    return ok({
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        store: user.store,
      },
    });
  } catch (e: unknown) {
    console.error('AUTH/ME ERROR:', (e as Error).message);
    return fail('Сесс шалгахад алдаа гарлаа', 500);
  }
}
