import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TIERS = [
  { name: "PLATINUM", min: 50000 },
  { name: "GOLD", min: 20000 },
  { name: "SILVER", min: 5000 },
  { name: "BRONZE", min: 0 },
] as const;

function getTier(lifetime: number) {
  return TIERS.find((t) => lifetime >= t.min)!.name;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, type, points, description, refType, refId } = await req.json();

    if (!userId || !type || !points || points <= 0) {
      return NextResponse.json({ error: "userId, type, and positive points required" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const transaction = await prisma.loyaltyTransaction.create({
      data: { userId, type, points, description: description || `Earned ${points} points`, refType, refId, expiresAt },
    });

    const account = await prisma.loyaltyAccount.upsert({
      where: { userId },
      create: { userId, balance: points, lifetimeEarned: points, tier: getTier(points) },
      update: {
        balance: { increment: points },
        lifetimeEarned: { increment: points },
      },
    });

    const newTier = getTier(account.lifetimeEarned);
    if (newTier !== account.tier) {
      await prisma.loyaltyAccount.update({
        where: { userId },
        data: { tier: newTier },
      });
    }

    return NextResponse.json({ transaction, balance: account.balance, tier: newTier });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
