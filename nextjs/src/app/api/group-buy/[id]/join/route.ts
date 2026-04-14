import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// POST /api/group-buy/[id]/join — join group buy
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;

  const groupBuy = await prisma.groupBuy.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  });

  if (!groupBuy) return errorJson('Group buy олдсонгүй', 404);
  if (groupBuy.status !== 'OPEN') return errorJson('Group buy хаагдсан');
  if (groupBuy.expiresAt < new Date()) return errorJson('Хугацаа дууссан');

  // Check existing
  const existing = await prisma.groupBuyMember.findUnique({
    where: { groupBuyId_userId: { groupBuyId: id, userId: user.id } },
  });
  if (existing) return errorJson('Та аль хэдийн нэгдсэн');

  // Add member
  await prisma.groupBuyMember.create({
    data: { groupBuyId: id, userId: user.id, isPaid: false },
  });

  const newCount = groupBuy.currentCount + 1;
  const completed = newCount >= groupBuy.targetCount;

  await prisma.groupBuy.update({
    where: { id },
    data: {
      currentCount: newCount,
      status: completed ? 'COMPLETED' : 'OPEN',
    },
  });

  return json({
    currentCount: newCount,
    targetCount: groupBuy.targetCount,
    completed,
  });
}
