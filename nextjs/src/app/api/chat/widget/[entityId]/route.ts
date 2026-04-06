import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — widget config (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params;

  // Try to find shop and return its chat config
  const shop = await prisma.shop.findFirst({
    where: { OR: [{ id: entityId }, { slug: entityId }, { storefrontSlug: entityId }] },
    select: { id: true, name: true, storefrontConfig: true },
  });

  if (!shop) {
    return NextResponse.json({
      primaryColor: '#E8242C',
      welcomeText: 'Сайн байна уу! Яаж тусалж болох вэ?',
      aiEnabled: true,
      quickReplies: ['Үнэ хэд вэ?', 'Хэзээ хүргэх вэ?', 'Захиалах'],
    });
  }

  const config = (shop.storefrontConfig as Record<string, unknown>) || {};
  return NextResponse.json({
    primaryColor: (config.chatColor as string) || (config.primaryColor as string) || '#E8242C',
    welcomeText: (config.chatWelcome as string) || `${shop.name}-д тавтай морилно уу!`,
    aiEnabled: config.chatAiEnabled !== false,
    quickReplies: (config.chatQuickReplies as string[]) || ['Үнэ хэд вэ?', 'Хэзээ хүргэх вэ?', 'Захиалах'],
    botName: (config.chatBotName as string) || shop.name,
    shopName: shop.name,
  });
}

// PUT — update widget config
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params;
  const body = await req.json();

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ id: entityId }, { userId: entityId }] },
  });

  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

  const existing = (shop.storefrontConfig as Record<string, unknown>) || {};

  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      storefrontConfig: {
        ...existing,
        chatColor: body.primaryColor,
        chatWelcome: body.welcomeText,
        chatAiEnabled: body.aiEnabled,
        chatQuickReplies: body.quickReplies,
        chatBotName: body.botName,
      },
    },
  });

  return NextResponse.json({ success: true });
}
