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

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const account = await prisma.loyaltyAccount.upsert({
      where: { userId },
      create: { userId, balance: 0, lifetimeEarned: 0, tier: "BRONZE" },
      update: {},
    });

    const gold = await prisma.goldMembership.findUnique({ where: { userId } });

    return NextResponse.json({
      ...account,
      tier: getTier(account.lifetimeEarned),
      goldMembership: gold
        ? {
            ...gold,
            isActive:
              gold.status !== "CANCELLED" && new Date(gold.endsAt) > new Date(),
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
