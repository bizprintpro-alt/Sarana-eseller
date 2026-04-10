'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface Conv { id: string; shopId: string; customerName: string; productName?: string; lastMessage?: string; lastAt: string; unreadCount: number; }
interface Msg { id: string; senderId: string; senderRole: string; text?: string; imageUrl?: string; createdAt: string; }

export default function BuyerChatPage() {
  const { user } = useAuth();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<Conv | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const loadConvs = useCallback(() => {
    fetch('/api/seller/conversations', { headers: getHeaders() })
      .then(r => r.json()).then(d => { const list = Array.isArray(d) ? d : d.data || []; setConvs(list); if (!active && list.length > 0) setActive(list[0]); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [active]);

  useEffect(() => { loadConvs(); const i = setInterval(loadConvs, 5000); return () => clearInterval(i); }, [loadConvs]);

  const loadMsgs = useCallback(() => {
    if (!active) return;
    fetch(`/api/chat/conversations/${active.id}/messages`, { headers: getHeaders() })
      .then(r => r.json()).then(d => setMsgs(d.data || d || []))
      .catch(() => {});
  }, [active?.id]);

  useEffect(() => { loadMsgs(); const i = setInterval(loadMsgs, 3000); return () => clearInterval(i); }, [loadMsgs]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const sendMsg = async () => {
    if (!input.trim() || !active) return;
    setSending(true); const text = input; setInput('');
    try {
      await fetch(`/api/chat/conversations/${active.id}/messages`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ content: text }) });
      loadMsgs(); loadConvs();
    } catch {} finally { setSending(false); }
  };

  const filtered = search ? convs.filter(c => c.customerName.toLowerCase().includes(search.toLowerCase())) : convs;

  return (
    <div className="flex h-[calc(100vh-4rem)]" style={{ background: 'var(--esl-bg-page)' }}>
      {/* Conversations */}
      <div className="w-[300px] shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--esl-border)', background: 'var(--esl-bg-card)' }}>
        <div className="p-3 border-b" style={{ borderColor: 'var(--esl-border)' }}>
          <h2 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--esl-text-primary)' }}>
            <MessageCircle className="w-4 h-4" style={{ color: '#E8242C' }} /> Чат
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--esl-text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Хайх..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-xs" style={{ background: 'var(--esl-bg-page)', border: '1px solid var(--esl-border)', color: 'var(--esl-text-primary)' }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: '#E8242C' }} /></div> :
           filtered.length === 0 ? <div className="p-8 text-center text-xs" style={{ color: 'var(--esl-text-muted)' }}>Чат байхгүй</div> :
           filtered.map(c => (
            <div key={c.id} onClick={() => setActive(c)} className="px-3 py-3 cursor-pointer transition-colors"
              style={{ background: active?.id === c.id ? 'var(--esl-bg-section)' : 'transparent', borderBottom: '1px solid var(--esl-border)' }}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold truncate" style={{ color: 'var(--esl-text-primary)' }}>{c.customerName}</span>
                {c.unreadCount > 0 && <span className="w-5 h-5 rounded-full bg-[#E8242C] text-white text-[10px] font-bold flex items-center justify-center">{c.unreadCount}</span>}
              </div>
              {c.productName && <p className="text-[10px] truncate" style={{ color: '#E8242C' }}>{c.productName}</p>}
              <p className="text-[11px] truncate" style={{ color: 'var(--esl-text-muted)' }}>{c.lastMessage || '...'}</p>
            </div>
           ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {!active ? (
          <div className="flex-1 flex items-center justify-center"><div className="text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--esl-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--esl-text-muted)' }}>Чат сонгоно уу</p>
          </div></div>
        ) : (<>
          <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--esl-border)', background: 'var(--esl-bg-card)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: '#E8242C' }}>{active.customerName[0]}</div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>{active.customerName}</p>
              {active.productName && <p className="text-[10px]" style={{ color: 'var(--esl-text-muted)' }}>{active.productName}</p>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ background: 'var(--esl-bg-page)' }}>
            {msgs.map(m => {
              const isMe = m.senderId === (user as any)?._id || m.senderId === (user as any)?.id;
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[70%] px-3 py-2 rounded-xl text-sm" style={{
                    background: isMe ? '#E8242C' : 'var(--esl-bg-card)', color: isMe ? '#fff' : 'var(--esl-text-primary)',
                    border: isMe ? 'none' : '1px solid var(--esl-border)',
                  }}>
                    {m.text}
                    {m.imageUrl && <img src={m.imageUrl} alt="" className="mt-1 rounded-lg max-w-full" style={{ maxHeight: 200 }} />}
                    <p className="text-[9px] mt-1" style={{ opacity: 0.6 }}>{new Date(m.createdAt).toLocaleTimeString('mn', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--esl-border)', background: 'var(--esl-bg-card)' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Мессеж бичих..." className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--esl-bg-page)', border: '1px solid var(--esl-border)', color: 'var(--esl-text-primary)' }} />
            <button onClick={sendMsg} disabled={sending || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer text-white"
              style={{ background: input.trim() ? '#E8242C' : 'var(--esl-border)' }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>)}
      </div>
    </div>
  );
}
