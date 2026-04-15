import { NextRequest } from 'next/server';
import { requireAuth, json } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// GET /api/wallet/transactions?page=1&type=TOPUP
// Returns paginated history entries from Wallet.history Json[]
export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = 20;
  const typeFilter = searchParams.get('type');

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) {
    return json({ transactions: [], total: 0, page, pageSize, totalPages: 0 });
  }

  // history is Json[] — each entry is unstructured, normalize access
  const all = (wallet.history as unknown as Record<string, unknown>[]) || [];

  const filtered = typeFilter
    ? all.filter((tx) => String(tx.type ?? '').toUpperCase() === typeFilter.toUpperCase())
    : all;

  // Sort newest-first by createdAt (new entries) or date (legacy entries)
  const sorted = [...filtered].sort((a, b) => {
    const aTs = String(a.createdAt ?? a.date ?? '');
    const bTs = String(b.createdAt ?? b.date ?? '');
    return bTs.localeCompare(aTs);
  });

  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const transactions = sorted.slice(start, start + pageSize);

  return json({
    transactions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
