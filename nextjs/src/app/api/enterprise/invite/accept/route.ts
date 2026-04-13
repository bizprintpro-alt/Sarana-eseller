import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';
import { PERMISSIONS, type EnterpriseRole } from '@/lib/enterprise-permissions';

// POST /api/enterprise/invite/accept — accept invite
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { token } = await req.json();
  if (!token) return errorJson('Token шаардлагатай');

  const invite = await prisma.enterpriseInvite.findUnique({ where: { token } });
  if (!invite) return errorJson('Урилга олдсонгүй', 404);
  if (invite.accepted) return errorJson('Урилга аль хэдийн хүлээн авсан');
  if (invite.expiresAt < new Date()) return errorJson('Урилгын хугацаа дууссан');

  // Check if user email matches invite
  const userData = await prisma.user.findUnique({ where: { id: user.id } });
  if (userData?.email !== invite.email) return errorJson('Таны email урилгатай таарахгүй байна');

  // Check if already a member
  const existing = await prisma.enterpriseUser.findUnique({
    where: { shopId_userId: { shopId: invite.shopId, userId: user.id } },
  });
  if (existing) return errorJson('Та аль хэдийн энэ дэлгүүрийн ажилтан байна');

  // Create enterprise user
  const role = invite.role as EnterpriseRole;
  await prisma.enterpriseUser.create({
    data: {
      shopId: invite.shopId,
      userId: user.id,
      role: invite.role,
      permissions: PERMISSIONS[role] || [],
      invitedBy: invite.shopId,
    },
  });

  // Mark invite as accepted
  await prisma.enterpriseInvite.update({
    where: { id: invite.id },
    data: { accepted: true },
  });

  return json({ message: 'Урилга хүлээн авлаа! Дэлгүүрийн dashboard-д нэвтрэх боломжтой.' });
}
