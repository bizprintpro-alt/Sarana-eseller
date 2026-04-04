import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PLAN_DURATIONS: Record<string, { duration: number; price: number }> = {
  MONTHLY: { duration: 30, price: 19900 },
  QUARTERLY: { duration: 90, price: 49900 },
  ANNUAL: { duration: 365, price: 149900 },
};

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, paymentId } = await req.json();
    if (!userId || !plan || !paymentId) {
      return NextResponse.json({ error: "userId, plan, and paymentId required" }, { status: 400 });
    }

    const planConfig = PLAN_DURATIONS[plan];
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const now = new Date();
    const existing = await prisma.goldMembership.findUnique({ where: { userId } });

    // Extend from current endsAt if still active, otherwise start fresh
    const startFrom =
      existing && new Date(existing.endsAt) > now ? new Date(existing.endsAt) : now;
    const endsAt = new Date(startFrom.getTime() + planConfig.duration * 24 * 60 * 60 * 1000);

    const membership = await prisma.goldMembership.upsert({
      where: { userId },
      create: { userId, plan, status: "ACTIVE", startsAt: now, endsAt, autoRenew: true },
      update: { plan, status: "ACTIVE", endsAt, autoRenew: true },
    });

    await prisma.membershipPayment.create({
      data: { membershipId: membership.id, userId, plan, amount: planConfig.price, paymentId, status: "COMPLETED" },
    });

    return NextResponse.json({ membership });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
