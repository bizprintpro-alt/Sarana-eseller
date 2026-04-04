import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { collectSystemSnapshot, analyzeSystemWithClaude, saveInsights } from '@/lib/ai/analyzeSystem';

// POST /api/admin/ai/scan — гар аргаар шинжилгээ эхлүүлэх
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const snapshot = await collectSystemSnapshot();
    const insights = await analyzeSystemWithClaude(snapshot);
    const created = await saveInsights(insights);

    await prisma.aiActivityLog.create({
      data: {
        action: 'manual_scan',
        description: `Гар шинжилгээ: ${created} шинэ санал олдлоо (нийт ${insights.length})`,
        metadata: { total: insights.length, created, adminId: admin.id },
      },
    });

    return NextResponse.json({ success: true, created, total: insights.length });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
