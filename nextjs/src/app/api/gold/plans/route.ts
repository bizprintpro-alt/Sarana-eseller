import { NextResponse } from "next/server";

const GOLD_PLANS = [
  { id: "MONTHLY", name: "Monthly", price: 19900, duration: 30, description: "Gold membership — 30 days" },
  { id: "QUARTERLY", name: "Quarterly", price: 49900, duration: 90, description: "Gold membership — 90 days (save 17%)" },
  { id: "ANNUAL", name: "Annual", price: 149900, duration: 365, description: "Gold membership — 365 days (save 37%)" },
];

export async function GET() {
  return NextResponse.json({ plans: GOLD_PLANS });
}
