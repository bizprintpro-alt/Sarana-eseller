import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const membership = await prisma.goldMembership.findUnique({ where: { userId } });
    if (!membership) {
      return NextResponse.json({ error: "No membership found" }, { status: 404 });
    }

    const updated = await prisma.goldMembership.update({
      where: { userId },
      data: { status: "CANCELLED", autoRenew: false },
    });

    return NextResponse.json({
      membership: updated,
      message: `Access continues until ${updated.endsAt.toISOString()}`,
    });
  } catch (error: unknown) {
    console.error('[gold/cancel]', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
