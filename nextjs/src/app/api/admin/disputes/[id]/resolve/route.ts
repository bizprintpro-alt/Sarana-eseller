import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminDB } from '@/lib/api-auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminDB(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()

  const dispute = await prisma.dispute.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      winner: body.winner,
      resolveNote: body.note,
      resolvedAt: new Date(),
      resolvedBy: auth.id,
    },
  })

  return NextResponse.json(dispute)
}
