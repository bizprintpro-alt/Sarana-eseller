import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson } from '@/lib/api-auth';

// GET /api/affiliate/track?code=abc123 — track click + set cookie
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return errorJson('code шаардлагатай');

  try {
    // Increment click count
    await prisma.affiliateLink.update({
      where: { code },
      data: { clicks: { increment: 1 } },
    });
  } catch {
    // Link not found or DB error — still redirect
  }

  // Set referral cookie (30 days) and redirect to store
  const res = new Response(null, {
    status: 302,
    headers: {
      Location: `${req.nextUrl.origin}/store?ref=${code}`,
      'Set-Cookie': `eseller_aff=${code};path=/;max-age=${30 * 24 * 60 * 60};SameSite=Lax`,
    },
  });

  return res;
}
