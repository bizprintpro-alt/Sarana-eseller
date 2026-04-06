import { NextRequest, NextResponse } from 'next/server';
import { getAiReply } from '@/lib/chat/aiChatEngine';

export async function POST(req: NextRequest) {
  try {
    const { shopId, message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const reply = await getAiReply(message, shopId || '', history || []);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ reply: 'Уучлаарай, алдаа гарлаа. Дахин оролдоно уу.' });
  }
}
