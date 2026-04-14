import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/stories/[id]/view — increment view count
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.story.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  } catch {}

  return NextResponse.json({ ok: true });
}
