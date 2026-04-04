import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const existing = await prisma.goldMembership.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json({ error: "User already has a membership" }, { status: 400 });
    }

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    const membership = await prisma.goldMembership.create({
      data: { userId, plan: "TRIAL", status: "TRIAL", startsAt, endsAt, autoRenew: false },
    });

    return NextResponse.json({ membership });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
