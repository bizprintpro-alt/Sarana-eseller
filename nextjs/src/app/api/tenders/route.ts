import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAdmin } from '@/lib/api-auth';

// GET /api/tenders — list tenders with filters and pagination
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // OPEN | CLOSED | AWARDED
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [tenders, total] = await Promise.all([
      prisma.governmentTender.findMany({
        where,
        orderBy: { deadline: 'asc' },
        skip,
        take: limit,
        include: {
          _count: { select: { bids: true } },
        },
      }),
      prisma.governmentTender.count({ where }),
    ]);

    return json({
      tenders: tenders.map((t) => ({
        ...t,
        bidCount: t._count.bids,
        _count: undefined,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}

// POST /api/tenders — create tender (admin only)
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const { agencyName, title, description, budget, deadline, requirements } = body;

    if (!agencyName || !title || !description || budget == null || !deadline) {
      return errorJson('agencyName, title, description, budget, deadline бүгд шаардлагатай');
    }

    const tender = await prisma.governmentTender.create({
      data: {
        agencyName,
        title,
        description,
        budget: parseFloat(budget),
        deadline: new Date(deadline),
        requirements: Array.isArray(requirements) ? requirements : [],
        status: 'OPEN',
      },
    });

    return json(tender, 201);
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}
