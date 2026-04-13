import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson, getShopForUser } from '@/lib/api-auth';
import { sendEmail, buildEmailTemplate } from '@/lib/marketing/EmailService';
import { PLAN_LIMITS, type EnterpriseRole } from '@/lib/enterprise-permissions';
import crypto from 'crypto';

// GET /api/enterprise/invite — list team + pending invites
export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const shopId = await getShopForUser(user.id);
  if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

  const [members, invites] = await Promise.all([
    prisma.enterpriseUser.findMany({
      where: { shopId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.enterpriseInvite.findMany({
      where: { shopId, accepted: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return json({ members, invites });
}

// POST /api/enterprise/invite — send invite
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const shopId = await getShopForUser(user.id);
  if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

  // Check permission (only OWNER can invite)
  const member = await prisma.enterpriseUser.findUnique({
    where: { shopId_userId: { shopId, userId: user.id } },
  });
  if (!member || member.role !== 'OWNER') return errorJson('Зөвхөн эзэмшигч урилга илгээх эрхтэй', 403);

  const { email, role } = await req.json();
  if (!email || !role) return errorJson('Email болон role шаардлагатай');

  const validRoles: EnterpriseRole[] = ['MANAGER', 'WAREHOUSE', 'MARKETER', 'ACCOUNTANT'];
  if (!validRoles.includes(role)) return errorJson('Буруу role');

  // Check plan limits
  const enterprise = await prisma.enterpriseShop.findUnique({ where: { shopId } });
  if (!enterprise) return errorJson('Enterprise идэвхжээгүй', 404);

  const currentCount = await prisma.enterpriseUser.count({ where: { shopId } });
  const limit = PLAN_LIMITS[enterprise.plan]?.maxUsers || 5;
  if (currentCount >= limit) return errorJson(`${enterprise.plan} багцын хэрэглэгчийн хязгаар (${limit}) хүрсэн`);

  // Check if already invited
  const existing = await prisma.enterpriseInvite.findFirst({
    where: { shopId, email, accepted: false, expiresAt: { gt: new Date() } },
  });
  if (existing) return errorJson('Аль хэдийн урилга илгээсэн');

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.enterpriseInvite.create({
    data: { shopId, email, role, token, expiresAt },
  });

  // Send invite email
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { name: true } });
  await sendEmail(
    email,
    `${shop?.name || 'Дэлгүүр'} — ажилтны урилга`,
    buildEmailTemplate(
      'Та ажилтнаар урилгаа авлаа!',
      `<p><strong>${shop?.name}</strong> дэлгүүр таныг <strong>${role}</strong> эрхтэй ажилтнаар урьж байна.</p>
       <p>Урилга 24 цагийн дотор хүчинтэй.</p>`,
      `https://eseller.mn/enterprise/accept-invite?token=${token}`,
      'Урилга хүлээн авах'
    ),
  );

  return json({ message: 'Урилга илгээгдлээ' });
}

// DELETE /api/enterprise/invite — remove member or cancel invite
export async function DELETE(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const shopId = await getShopForUser(user.id);
  if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

  const { memberId, inviteId } = await req.json();

  if (inviteId) {
    await prisma.enterpriseInvite.delete({ where: { id: inviteId } });
    return json({ message: 'Урилга цуцлагдлаа' });
  }

  if (memberId) {
    const target = await prisma.enterpriseUser.findUnique({ where: { id: memberId } });
    if (!target || target.shopId !== shopId) return errorJson('Олдсонгүй', 404);
    if (target.role === 'OWNER') return errorJson('Эзэмшигчийг хасах боломжгүй');
    await prisma.enterpriseUser.delete({ where: { id: memberId } });
    return json({ message: 'Ажилтан хасагдлаа' });
  }

  return errorJson('memberId эсвэл inviteId шаардлагатай');
}
