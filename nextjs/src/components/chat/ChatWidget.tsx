'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  createdAt?: string;
}

interface ChatWidgetProps {
  shopId: string;
  shopName: string;
  primaryColor?: string;
}

export default function ChatWidget({ shopId, shopName, primaryColor = '#E8242C' }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const initials = shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const c = primaryColor;
  const quickReplies = ['Үнэ хэд вэ?', 'Хэзээ хүргэх вэ?', 'Захиалах →'];

  // Welcome message
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `${shopName}-д тавтай морилно уу! Яаж тусалж болох вэ?`,
        time: new Date().toLocaleTimeString('mn', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [open, messages.length, shopName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages (seller replies) every 3s
  useEffect(() => {
    if (!sessionId || !open) return;
    const interval = setInterval(async () => {
      try {
        const lastMsg = messages[messages.length - 1];
        const after = lastMsg?.createdAt || '';
        const res = await fetch(`/api/chat/messages/${sessionId}${after ? `?after=${after}` : ''}`);
        const data = await res.json();
        if (data.messages?.length > 0) {
          const newMsgs = data.messages
            .filter((m: any) => !messages.some(e => e.id === m.id))
            .map((m: any) => ({ ...m, role: m.role === 'customer' ? 'user' as const : 'assistant' as const }));
          if (newMsgs.length > 0) setMessages(prev => [...prev, ...newMsgs]);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId, open, messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      content,
      time: new Date().toLocaleTimeString('mn', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          shopId,
          message: content,
          role: 'customer',
          history: messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
        }),
      });
      const data = await res.json();

      // Save session ID for polling
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);

      if (data.reply) {
        setMessages(prev => [...prev, {
          id: data.replyMessage?.id || `a_${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          time: new Date().toLocaleTimeString('mn', { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `e_${Date.now()}`,
        role: 'assistant',
        content: 'Холболтын алдаа. Дахин оролдоно уу.',
        time: new Date().toLocaleTimeString('mn', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Chat bubble */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 64, right: 0, width: 340,
          background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)',
          borderRadius: '16px 16px 4px 16px', overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        }}>
          {/* Header */}
          <div style={{ background: c, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{shopName}</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#86EFAC' }} />
                AI туслах бэлэн
              </p>
            </div>
            <button onClick={() => setOpen(false)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div style={{ height: 280, overflowY: 'auto', padding: 12, background: 'var(--esl-bg-section)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 6, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {initials}
                  </div>
                )}
                <div>
                  <div style={{
                    maxWidth: 220, padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.role === 'user' ? c : 'var(--esl-bg-card)',
                    color: msg.role === 'user' ? '#fff' : 'var(--esl-text-primary)',
                    border: msg.role === 'assistant' ? '1px solid var(--esl-border)' : 'none',
                    fontSize: 12, lineHeight: 1.6,
                  }}>
                    {msg.content}
                  </div>
                  <p style={{ fontSize: 9, color: 'var(--esl-text-muted)', textAlign: msg.role === 'user' ? 'right' : 'left', marginTop: 2 }}>{msg.time}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff' }}>{initials}</div>
                <div style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)', borderRadius: '12px 12px 12px 2px', padding: '10px 14px' }}>
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--esl-text-muted)' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div style={{ padding: '6px 10px', display: 'flex', gap: 5, flexWrap: 'wrap', borderTop: '1px solid var(--esl-border)' }}>
            {quickReplies.map((qr, i) => (
              <button key={i} onClick={() => sendMessage(qr)} style={{
                padding: '4px 10px', borderRadius: 99, fontSize: 11, cursor: 'pointer',
                border: `1px solid ${c}`, background: 'none', color: c, whiteSpace: 'nowrap',
              }}>
                {qr}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '8px 10px', borderTop: '1px solid var(--esl-border)', display: 'flex', gap: 6 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Мессеж бичих..."
              style={{ flex: 1, border: '1px solid var(--esl-border)', borderRadius: 20, padding: '7px 14px', fontSize: 12, background: 'var(--esl-bg-section)', color: 'var(--esl-text-primary)', outline: 'none' }} />
            <button onClick={() => sendMessage()} style={{
              width: 32, height: 32, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Trigger */}
      <button onClick={() => setOpen(!open)} style={{
        width: 52, height: 52, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 16px ${c}60`, transition: 'transform 0.15s',
      }}>
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}
