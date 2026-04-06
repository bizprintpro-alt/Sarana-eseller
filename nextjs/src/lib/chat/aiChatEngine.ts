/**
 * AI Chat Engine — Claude-powered per-store assistant
 * Uses store's product catalog + location for context
 */

import { prisma } from '@/lib/prisma';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

interface ChatHistory {
  role: 'user' | 'assistant';
  content: string;
}

export async function getAiReply(
  userMessage: string,
  shopId: string,
  history: ChatHistory[] = [],
): Promise<string> {
  // Get store context
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { name: true, industry: true, phone: true, address: true, district: true },
  });

  const products = await prisma.product.findMany({
    where: { userId: shop ? undefined : undefined, isActive: true },
    take: 15,
    select: { name: true, price: true, salePrice: true, description: true, stock: true },
  });

  const systemPrompt = `Та "${shop?.name || 'Дэлгүүр'}" дэлгүүрийн AI туслах.
Монгол хэлээр богино, найрсаг хариулна. 2 өгүүлбэрээс илүүгүй.

Барааны мэдээлэл:
${products.slice(0, 10).map(p => `- ${p.name}: ${(p.salePrice || p.price).toLocaleString()}₮${p.stock && p.stock < 5 ? ' (Цөөн үлдсэн!)' : ''}`).join('\n')}

Байршил: ${shop?.address || shop?.district || 'Улаанбаатар'}
Утас: ${shop?.phone || 'Байхгүй'}

Дүрэм:
- Мэдэхгүй зүйл: "Seller удахгүй хариулна" гэж хэл
- Захиалга: захиалгын холбоосыг өг
- Үнэ: бодит үнийг хэл
- Эелдэг, тусламжтай бай`;

  // Demo mode — no API key
  if (!ANTHROPIC_KEY) {
    return getDemoReply(userMessage, shop?.name || 'Дэлгүүр', products);
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          ...history.slice(-6),
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!res.ok) return getDemoReply(userMessage, shop?.name || '', products);

    const data = await res.json();
    return data.content?.[0]?.text || 'Уучлаарай, дахин асууна уу.';
  } catch {
    return getDemoReply(userMessage, shop?.name || '', products);
  }
}

function getDemoReply(msg: string, storeName: string, products: { name: string; price: number }[]): string {
  const t = msg.toLowerCase();
  if (t.includes('үнэ') || t.includes('хэд')) {
    const p = products[0];
    return p ? `${p.name} — ${p.price.toLocaleString()}₮. Захиалах уу?` : 'Бараагаа дэлгүүрээс харна уу!';
  }
  if (t.includes('хүргэ')) return 'Өнөөдөр 14:00-18:00 хооронд хүргэнэ. Хаяг хэлнэ үү!';
  if (t.includes('захиал')) return 'Захиалгыг баталгаажуулъя! QPay-аар төлбөр хийнэ үү 😊';
  if (t.includes('байна')) return 'Тийм, одоо нөөцтэй байна! Худалдаж авмаар байна уу?';
  return `${storeName}-д тавтай морил! Яаж тусалж болох вэ? 😊`;
}
