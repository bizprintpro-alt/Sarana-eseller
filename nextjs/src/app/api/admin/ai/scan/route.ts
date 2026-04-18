import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';
import { collectSystemSnapshot, analyzeSystemWithClaude, saveInsights, testUserFlows } from '@/lib/ai/analyzeSystem';

// POST /api/admin/ai/scan — гар аргаар шинжилгээ эхлүүлэх
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const origin = req.nextUrl.origin;

    // 1. Collect DB snapshot
    const snapshot = await collectSystemSnapshot();

    // 2. Test all user flows (live endpoint checks)
    const flowResults = await testUserFlows(origin);
    snapshot.flowResults = flowResults;

    // 3. Add failed endpoints to error logs
    const failedFlows = flowResults.filter(f => !f.ok);
    snapshot.errorLogs = failedFlows.map(f => ({
      type: 'FLOW_ERROR',
      flow: f.flow,
      step: f.step,
      endpoint: f.endpoint,
      status: f.status,
      error: f.error || `HTTP ${f.status}`,
    }));

    // 4. Claude AI analysis
    const insights = await analyzeSystemWithClaude(snapshot);
    const created = await saveInsights(insights);

    // 5. Log
    await prisma.aiActivityLog.create({
      data: {
        action: 'manual_scan',
        description: `Шинжилгээ: ${created} шинэ санал, ${failedFlows.length} flow алдаа, ${flowResults.length} endpoint шалгасан`,
        metadata: {
          total: insights.length,
          created,
          adminId: admin.id,
          endpointsTested: flowResults.length,
          endpointsFailed: failedFlows.length,
          flowSummary: flowResults.map(f => `${f.ok ? '✅' : '❌'} ${f.flow}/${f.step}`),
        },
      },
    });

    return NextResponse.json({
      success: true,
      created,
      total: insights.length,
      flowResults: {
        tested: flowResults.length,
        passed: flowResults.filter(f => f.ok).length,
        failed: failedFlows.length,
        details: flowResults,
      },
    });
  } catch (e: unknown) {
    console.error('[admin/ai/scan]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
