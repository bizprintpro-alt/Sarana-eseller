'use client';
import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  time: string;
}

const now = () => new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', content: 'Сайн байна уу! Би eseller.mn-ийн туслах юм. Ямар асуулт байна вэ? 😊', role: 'assistant', time: now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input;
    setMessages((prev) => [...prev, { id: Date.now().toString(), content: text, role: 'user', time: now() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setHistory((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: data.reply }]);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), content: data.reply, role: 'assistant', time: now() }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), content: 'Алдаа гарлаа. Дахин оролдоно уу.', role: 'assistant', time: now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#E8242C] border-none cursor-pointer text-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-[1000]"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="fixed bottom-[90px] right-6 w-[360px] h-[500px] bg-[var(--esl-bg-card,#141414)] rounded-[20px] shadow-2xl flex flex-col z-[999] border border-[var(--esl-border,#222)] overflow-hidden max-sm:w-[calc(100vw-48px)]">
          {/* Header */}
          <div className="p-3.5 bg-[#E8242C] flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🤖</div>
            <div>
              <div className="text-white font-bold text-sm">Eseller Туслах</div>
              <div className="text-white/70 text-[11px]">● Онлайн · 24/7</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#E8242C] text-white rounded-[16px_16px_4px_16px]'
                    : 'bg-[var(--esl-bg-section,#1A1A1A)] text-[var(--esl-text,#eee)] rounded-[16px_16px_16px_4px]'
                }`}>
                  {msg.content}
                  <div className="text-[10px] mt-1 opacity-60 text-right">{msg.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 px-3.5 py-2.5 bg-[var(--esl-bg-section,#1A1A1A)] rounded-[16px_16px_16px_4px] w-fit">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#E8242C] animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 pt-2 flex gap-1.5 flex-wrap shrink-0">
            {['Захиалга хянах', 'Буцаалт хийх', 'Gold гишүүнчлэл'].map((q) => (
              <button key={q} onClick={() => setInput(q)}
                className="bg-[var(--esl-bg-section,#1A1A1A)] border border-[var(--esl-border,#222)] rounded-xl px-2.5 py-1 text-[11px] text-[var(--esl-text-muted,#999)] cursor-pointer hover:border-[#E8242C] transition-colors">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-2.5 flex gap-2 border-t border-[var(--esl-border,#222)] shrink-0">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Мессеж бичих..."
              className="flex-1 bg-[var(--esl-bg-section,#1A1A1A)] border border-[var(--esl-border,#222)] rounded-xl px-3.5 py-2 text-[var(--esl-text,#eee)] text-[13px] outline-none focus:border-[#E8242C] transition-colors"
            />
            <button onClick={send} disabled={!input.trim() || loading}
              className={`w-10 h-10 rounded-xl border-none text-lg ${input.trim() ? 'bg-[#E8242C] text-white cursor-pointer' : 'bg-[var(--esl-bg-section,#1A1A1A)] text-[var(--esl-text-muted,#555)] cursor-not-allowed'}`}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
