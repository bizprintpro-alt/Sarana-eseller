import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminDB } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  const auth = await requireAdminDB(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const where = status && status !== 'ALL' ? { status } : {}

  // 1 list + 1 groupBy instead of 4 sequential counts
  const [disputes, groups, total] = await Promise.all([
    prisma.dispute.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.dispute.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.dispute.count(),
  ])

  const byStatus = (s: string) => groups.find((g) => g.status === s)?._count._all ?? 0
  const stats = {
    total,
    open: byStatus('OPEN'),
    resolved: byStatus('RESOLVED'),
    rejected: byStatus('REJECTED'),
  }

  return NextResponse.json({ disputes, stats })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminDB(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()

  const count = await prisma.dispute.count()
  const code = `DSP-${String(count + 1).padStart(4, '0')}`

  const dispute = await prisma.dispute.create({
    data: {
      code,
      orderId: body.orderId,
      commissionId: body.commissionId,
      sellerId: body.sellerId,
      shopId: body.shopId,
      sellerName: body.sellerName,
      shopName: body.shopName,
      reason: body.reason,
      description: body.description,
    },
  })

  return NextResponse.json(dispute, { status: 201 })
}
