import { NextRequest } from 'next/server';
import { json, errorJson, requireSeller } from '@/lib/api-auth';
import { generateStorefrontConfig } from '@/lib/ai/generateStorefrontConfig';
import type { GenerateStorefrontInput } from '@/lib/types/storefront';

// POST /api/ai/generate-storefront
export async function POST(req: NextRequest) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const body = await req.json() as GenerateStorefrontInput;

  if (!body.sellerName || !body.description || !body.category) {
    return errorJson('sellerName, description, category шаардлагатай');
  }

  const config = await generateStorefrontConfig(body);
  config.sellerId = auth.id;
  config.lastEditedAt = new Date().toISOString();

  return json(config);
}
