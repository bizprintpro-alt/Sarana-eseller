import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [stores, listings, users, orders, partners] = await Promise.all([
    prisma.shop.count({ where: { isBlocked: false } }),
    prisma.feedItem.count({ where: { status: 'active' } }),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { status: 'confirmed' },
      _sum: { total: true },
      _count: true,
    }),
    prisma.partnerCompany.count({ where: { isActive: true } }),
  ])

  return NextResponse.json(
    {
      stores,
      listings,
      users,
      partners,
      totalOrders: orders._count,
      totalVolume: orders._sum.total || 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    }
  )
}
