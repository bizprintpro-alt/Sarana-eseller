import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { collectSystemSnapshot, analyzeSystemWithClaude, saveInsights, checkEndpoints } from '@/lib/ai/analyzeSystem';

// POST /api/admin/ai/scan — гар аргаар шинжилгээ эхлүүлэх
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    // Collect DB snapshot + check live endpoints
    const origin = req.nextUrl.origin;
    const [snapshot, endpointResults] = await Promise.all([
      collectSystemSnapshot(),
      checkEndpoints(origin),
    ]);

    // Add endpoint health to snapshot
    const failedEndpoints = endpointResults.filter(e => !e.ok);
    if (failedEndpoints.length > 0) {
      snapshot.errorLogs = failedEndpoints.map(e => ({
        type: 'API_ERROR',
        endpoint: e.endpoint,
        status: e.status,
        error: e.error || `HTTP ${e.status}`,
      }));
    }

    const insights = await analyzeSystemWithClaude(snapshot);
    const created = await saveInsights(insights);

    await prisma.aiActivityLog.create({
      data: {
        action: 'manual_scan',
        description: `Гар шинжилгээ: ${created} шинэ санал, ${failedEndpoints.length} API алдаа олдлоо`,
        metadata: { total: insights.length, created, adminId: admin.id, failedEndpoints: failedEndpoints.length },
      },
    });

    return NextResponse.json({ success: true, created, total: insights.length, endpointsChecked: endpointResults.length, endpointsFailed: failedEndpoints.length });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
