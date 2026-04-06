import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const dispute = await prisma.dispute.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      winner: body.winner,
      resolveNote: body.note,
      resolvedAt: new Date(),
      resolvedBy: body.resolvedBy,
    },
  })

  return NextResponse.json(dispute)
}
