import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ShopRequest {
  message: string;
  history?: ChatMessage[];
  budget?: number;
  occasion?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ShopRequest = await req.json();
    const { message, history = [], budget, occasion } = body;

    if (!message?.trim()) {
      return Response.json({ error: 'Мессеж шаардлагатай' }, { status: 400 });
    }

    // Fetch real products from DB
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isDemo: false,
        ...(budget ? { price: { lte: budget } } : {}),
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        category: true,
        description: true,
        rating: true,
        stock: true,
        entityType: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const productsJson = JSON.stringify(
      products.map((p) => ({
        name: p.name,
        price: p.salePrice ?? p.price,
        originalPrice: p.salePrice ? p.price : undefined,
        category: p.category,
        description: p.description?.slice(0, 80),
        rating: p.rating,
        inStock: (p.stock ?? 0) > 0,
        type: p.entityType,
      })),
    );

    const systemPrompt = `Чи бол eseller.mn цахим захын AI худалдааны туслах. Монгол хэлээр хариулна.

Чиний үүрэг:
- Хэрэглэгчид тохирох бараа санал болгох
- Төсөв, зорилго, хэрэгцээнд тааруулан зөвлөгөө өгөх
- Бараа харьцуулалт хийх
- Бэлэг сонгоход туслах

Одоо байгаа бараанууд (JSON):
${productsJson}

Дүрэм:
- Зөвхөн дээрх жагсаалтад байгаа барааг санал болго
- Үнийг ₮ тэмдэгтэйгээр бич (жнь: 50,000₮)
- Хямдралтай бол хуучин үнийг зурсан (~~) болгож бич
- Богино, ойлгомжтой хариулт бич
- Emoji хэрэглэж болно
- Хэрэглэгч тодорхой бүтээгдэхүүн хайвал шинж чанар, үнэ, давуу талыг тайлбарла
${budget ? `- Хэрэглэгчийн төсөв: ${budget.toLocaleString()}₮` : ''}
${occasion ? `- Зорилго: ${occasion}` : ''}`;

    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      const mockProducts = products.slice(0, 3);
      const mockReply = mockProducts.length > 0
        ? `Сайн байна уу! Танд дараах барааг санал болгоё:\n\n${mockProducts.map((p, i) => `${i + 1}. **${p.name}** — ${(p.salePrice ?? p.price).toLocaleString()}₮`).join('\n')}\n\nАль нь таалагдаж байна вэ?`
        : 'Сайн байна уу! Одоогоор бараа олдсонгүй. Өөр хайлт хийж үзнэ үү.';

      return Response.json({ reply: mockReply });
    }

    // Dynamic import to avoid errors when SDK not configured
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.slice(-10),
      { role: 'user', content: message },
    ];

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 800,
      system: systemPrompt,
      messages,
    });

    // Return as a readable stream (SSE)
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          stream.on('text', (text) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
            );
          });

          await stream.finalMessage();

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          console.error('[AI Shop] Stream error:', err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: '\n\nАлдаа гарлаа. Дахин оролдоно уу.' })}\n\n`,
            ),
          );
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[AI Shop] Error:', err);
    return Response.json(
      { error: 'AI туслахтай холбогдож чадсангүй' },
      { status: 500 },
    );
  }
}
