import { NextRequest, NextResponse } from 'next/server';
import { getEntityBySlug, getEntityFeedItems, type EntityType } from '@/lib/entity-data';

type Ctx = { params: Promise<{ type: string; slug: string }> };

const VALID_TYPES = ['agent', 'company', 'auto_dealer', 'service'];

// GET /api/entity/[type]/[slug] — entity profile + feed items
export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { type, slug } = await ctx.params;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Буруу entity төрөл' }, { status: 400 });
    }

    const entity = await getEntityBySlug(type as EntityType, slug);
    if (!entity) {
      return NextResponse.json({ error: 'Олдсонгүй' }, { status: 404 });
    }

    const feedItems = await getEntityFeedItems(type as EntityType, entity.id);

    return NextResponse.json({ entity, feedItems });
  } catch (e: unknown) {
    console.error('[entity/[type]/[slug]]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
