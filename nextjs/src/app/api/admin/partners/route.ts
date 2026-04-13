import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminDB as requireAdmin } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const partners = await prisma.partnerCompany.findMany({
    include: {
      _count: { select: { agents: true, listings: true, commissions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    total: partners.length,
    active: partners.filter((p) => p.isActive).length,
    verified: partners.filter((p) => p.isVerified).length,
    totalAgents: partners.reduce((sum, p) => sum + p._count.agents, 0),
  }

  return NextResponse.json({ partners, stats })
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json()

  const partner = await prisma.partnerCompany.create({
    data: {
      name: body.name,
      type: body.type || 'GENERAL',
      registrationNo: body.registrationNo,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      website: body.website,
      platformFee: body.platformFee ?? 2,
      agentFee: body.agentFee ?? 3,
      companyFee: body.companyFee ?? 95,
      contractStart: new Date(body.contractStart || Date.now()),
      contractEnd: body.contractEnd ? new Date(body.contractEnd) : null,
    },
  })

  return NextResponse.json(partner, { status: 201 })
}
