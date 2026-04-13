import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin, json, errorJson } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;

  try {
    const agents = await prisma.partnerAgent.findMany({
      orderBy: { joinedAt: 'desc' },
      take: 100,
    });
    return json(agents);
  } catch (e) {
    return json([]);
  }
}
