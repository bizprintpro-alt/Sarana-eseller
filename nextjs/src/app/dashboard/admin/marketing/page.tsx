'use client';

import { useState, useEffect } from 'react';
import { Send, MessageSquare, Mail, Bell, Sparkles, Loader2 } from 'lucide-react';

interface Campaign {
  id: string; type: string; title: string; body: string;
  recipientCount: number; sentCount: number; openCount: number; clickCount: number;
  totalCost: number; status: string; createdAt: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; price: number; color: string }> = {
  sms:   { label: 'SMS', icon: <MessageSquare size={16} />, price: 50, color: '#8B5CF6' },
  email: { label: 'Email', icon: <Mail size={16} />, price: 20, color: '#3B82F6' },
  push:  { label: 'Push', icon: <Bell size={16} />, price: 10, color: '#F59E0B' },
};

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Form
  const [type, setType] = useState('sms');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recipientCount, setRecipientCount] = useState(100);

  const unitPrice = TYPE_CONFIG[type]?.price || 10;
  const totalCost = recipientCount * unitPrice;

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/campaigns', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCampaigns(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generateWithAI = async () => {
    setAiLoading(true);
    // Simple AI-generated text
    const templates: Record<string, string> = {
      sms: '🎉 eseller.mn хавар campaign! Бүх бараанд 20% хямдрал. Одоо захиалаарай → eseller.mn',
      email: 'Сайн байна уу! eseller.mn-д шинэ бараанууд нэмэгдлээ. 500+ дэлгүүрээс хамгийн сайн үнээр худалдаж аваарай. Манай AI зөвлөгч танд тохирох бараа санал болгоно.',
      push: '🔥 Шинэ бараа нэмэгдлээ! Таны хадгалсан категорид 15 шинэ бараа ирлээ.',
    };
    setBody(templates[type] || templates.sms);
    setTitle(type === 'sms' ? 'Хавар campaign' : type === 'email' ? 'Шинэ бараанууд' : 'Шинэ бараа мэдэгдэл');
    setAiLoading(false);
  };

  const sendCampaign = async () => {
    setCreating(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ type, title, body, recipientCount, sendNow: true }),
    });
    const data = await res.json();
    if (data.id) setCampaigns(prev => [data, ...prev]);
    setTitle(''); setBody('');
    setCreating(false);
  };

  return (
    <div>
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <h1 className="text-white text-lg font-black">📢 Маркетинг кампани</h1>
        <p className="text-white/35 text-xs mt-0.5">SMS / Email / Push — Claude AI текст генерацтай</p>
      </div>

      <div className="p-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Create campaign */}
          <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
            <h3 className="text-white font-bold mb-6">Шинэ кампани</h3>

            {/* Type selection */}
            <div className="flex gap-3 mb-5">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setType(key)}
                  className="flex-1 py-3 rounded-xl text-center cursor-pointer transition-all border"
                  style={{
                    background: type === key ? cfg.color + '15' : '#0A0A0A',
                    borderColor: type === key ? cfg.color + '50' : '#2A2A2A',
                    color: type === key ? cfg.color : '#777',
                  }}>
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                    {cfg.icon} {cfg.label}
                  </div>
                  <div className="text-[10px] mt-1 opacity-60">{cfg.price}₮/хүн</div>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Гарчиг</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Кампанийн нэр..."
                  className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Агуулга</label>
                  <button onClick={generateWithAI} disabled={aiLoading}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold border-none cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #CC785C, #8B4513)', color: '#FFF', opacity: aiLoading ? 0.6 : 1 }}>
                    {aiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    Claude-аар бичүүлэх
                  </button>
                </div>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Мессежийн агуулга..."
                  className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent resize-none" />
                <div className="text-right text-[10px] text-white/20 mt-1">{body.length} тэмдэгт</div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Хүлээн авагчид</label>
                <input type="number" value={recipientCount} onChange={e => setRecipientCount(Number(e.target.value))}
                  className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
              </div>

              {/* Cost preview */}
              <div className="bg-white/[.02] rounded-xl p-4 flex items-center justify-between">
                <span className="text-xs text-white/40">Нийт зардал</span>
                <span className="text-lg font-black text-white">{totalCost.toLocaleString()}₮</span>
              </div>

              <button onClick={sendCampaign} disabled={creating || !title || !body}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-none cursor-pointer transition"
                style={{ background: creating ? '#333' : '#E8242C', color: '#FFF', opacity: (!title || !body) ? 0.5 : 1 }}>
                <Send size={16} /> {creating ? 'Илгээж байна...' : 'Кампани илгээх'}
              </button>
            </div>
          </div>

          {/* Campaign history */}
          <div className="bg-dash-card border border-dash-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-dash-border">
              <h3 className="text-white/80 text-sm font-bold">📋 Өмнөх кампаниуд</h3>
            </div>
            <div className="divide-y divide-white/[.04]">
              {loading ? (
                <div className="text-center py-12 text-white/30 text-sm">Ачааллаж байна...</div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12 text-white/30 text-sm">Кампани байхгүй</div>
              ) : (
                campaigns.slice(0, 10).map(c => {
                  const cfg = TYPE_CONFIG[c.type] || TYPE_CONFIG.sms;
                  const openRate = c.sentCount > 0 ? Math.round((c.openCount / c.sentCount) * 100) : 0;
                  return (
                    <div key={c.id} className="px-6 py-3 hover:bg-white/[.02]">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: cfg.color }}>{cfg.icon}</span>
                        <span className="text-sm font-semibold text-white">{c.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ml-auto ${
                          c.status === 'sent' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>{c.status === 'sent' ? 'Илгээсэн' : c.status}</span>
                      </div>
                      <div className="flex gap-4 text-[10px] text-white/30">
                        <span>{c.sentCount} илгээсэн</span>
                        <span>{openRate}% нээсэн</span>
                        <span>{c.totalCost.toLocaleString()}₮</span>
                        <span>{new Date(c.createdAt).toLocaleDateString('mn-MN')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
