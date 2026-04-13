// ══════════════════════════════════════════════════════════════
// POST /api/achievements/seed — upsert achievement definitions
// ══════════════════════════════════════════════════════════════

import { json } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { ACHIEVEMENTS } from '@/lib/achievements';

export async function POST() {
  const results = await Promise.all(
    ACHIEVEMENTS.map((a) =>
      prisma.achievement.upsert({
        where: { key: a.key },
        update: { name: a.name, description: a.description, icon: a.icon, points: a.points },
        create: { key: a.key, name: a.name, description: a.description, icon: a.icon, points: a.points },
      })
    )
  );

  return json({ seeded: results.length });
}
