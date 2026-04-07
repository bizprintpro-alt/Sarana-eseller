import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sellers = await prisma.sellerProfile.findMany({
    where: {
      OR: [
        { influencerVerified: false, followers: { gt: 0 } },
        { sellerType: { not: 'REGULAR' } },
      ],
    },
    orderBy: { followers: 'desc' },
  })

  return NextResponse.json({ sellers })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, action, tier } = body

  if (action === 'approve' && tier) {
    const seller = await prisma.sellerProfile.update({
      where: { id },
      data: {
        sellerType: tier,
        influencerVerified: true,
      },
    })
    return NextResponse.json(seller)
  }

  if (action === 'reject') {
    const seller = await prisma.sellerProfile.update({
      where: { id },
      data: {
        influencerVerified: false,
        influencerNote: 'Татгалзсан',
      },
    })
    return NextResponse.json(seller)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
