import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, userId } = await req.json();
    if (!code || !userId) {
      return NextResponse.json({ error: "code and userId required" }, { status: 400 });
    }

    const referral = await prisma.referral.findFirst({ where: { code, status: "pending" } });
    if (!referral) {
      return NextResponse.json({ error: "Invalid or already used referral code" }, { status: 400 });
    }
    if (referral.referrerId === userId) {
      return NextResponse.json({ error: "Cannot use your own referral code" }, { status: 400 });
    }

    await prisma.referral.update({
      where: { id: referral.id },
      data: { referredId: userId, status: "completed" },
    });

    return NextResponse.json({ success: true, referrerId: referral.referrerId });
  } catch (error: unknown) {
    console.error('[referral/apply]', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
