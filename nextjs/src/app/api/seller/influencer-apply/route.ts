import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // In production, get userId from auth token
  // For now, find by a header or default
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find seller profile by looking up users
  // This is simplified — in production, decode JWT
  const sellers = await prisma.sellerProfile.findMany({
    take: 1,
    orderBy: { createdAt: 'desc' },
  })

  if (sellers.length === 0) {
    return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
  }

  const seller = await prisma.sellerProfile.update({
    where: { id: sellers[0].id },
    data: {
      socialLinks: body.socialLinks,
      followers: body.followers || 0,
      influencerNote: body.note,
    },
  })

  return NextResponse.json(seller)
}
