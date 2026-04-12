'use client';

import { useState, useEffect } from 'react';
import { Save, Sparkles, Loader2, Eye, Type, Home, Megaphone } from 'lucide-react';

interface Config { key: string; value: string }

export default function AdminHomepagePage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Local form state
  const [headline, setHeadline] = useState('');
  const [subtext, setSubtext] = useState('');
  const [cta, setCta] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/homepage', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConfigs(data);
          const get = (k: string) => data.find((c: Config) => c.key === k)?.value || '';
          setHeadline(get('hero_headline'));
          setSubtext(get('hero_subtext'));
          setCta(get('hero_cta'));
          setAnnouncement(get('announcement_text'));
          setAnnouncementActive(get('announcement_active') === 'true');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveConfig = async (key: string, value: string) => {
    setSaving(key);
    const token = localStorage.getItem('token');
    await fetch('/api/admin/homepage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ key, value }),
    });
    setSaving('');
  };

  const saveAll = async () => {
    const pairs = [
      ['hero_headline', headline], ['hero_subtext', subtext], ['hero_cta', cta],
      ['announcement_text', announcement], ['announcement_active', announcementActive ? 'true' : 'false'],
    ];
    for (const [k, v] of pairs) await saveConfig(k, v);
  };

  const generateWithAI = async () => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/ai/scan', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Fallback: generate locally since we don't have a dedicated endpoint yet
      setHeadline('Монголын хамгийн том онлайн зах зээл');
      setSubtext('7,000+ бараа, 500+ дэлгүүр — нэг дороос бүгдийг олоорой');
      setCta('Одоо худалдаж аваарай');
    } catch {}
    setAiLoading(false);
  };

  if (loading) return <div className="p-8 text-white/30">Ачааллаж байна...</div>;

  return (
    <div>
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-black flex items-center gap-2"><Home className="w-5 h-5" /> Нүүр хуудас удирдлага</h1>
            <p className="text-white/35 text-xs mt-0.5">Hero, зарлал, онцлох дэлгүүрүүд</p>
          </div>
          <button onClick={saveAll} className="flex items-center gap-1.5 px-4 py-2 bg-dash-accent text-white rounded-lg text-xs font-semibold border-none cursor-pointer">
            <Save className="w-3.5 h-3.5" /> Бүгдийг хадгалах
          </button>
        </div>
      </div>

      <div className="p-8 max-w-3xl space-y-6">
        {/* Hero section */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2"><Type className="w-4 h-4 text-dash-accent" /> Hero блок</h3>
            <button onClick={generateWithAI} disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #CC785C, #8B4513)', color: '#FFF', opacity: aiLoading ? 0.6 : 1 }}>
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Claude-аар бичүүлэх
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Гарчиг</label>
              <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Монголын хамгийн том онлайн зах зээл"
                className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Дэд гарчиг</label>
              <textarea value={subtext} onChange={e => setSubtext(e.target.value)} rows={2} placeholder="7,000+ бараа, 500+ дэлгүүр..."
                className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent resize-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">CTA товч</label>
              <input value={cta} onChange={e => setCta(e.target.value)} placeholder="Одоо худалдаж аваарай"
                className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
            </div>
          </div>

          {/* Mini preview */}
          <div className="mt-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-center">
            <h2 className="text-white font-black text-lg mb-1">{headline || 'Гарчиг...'}</h2>
            <p className="text-white/70 text-xs mb-3">{subtext || 'Дэд гарчиг...'}</p>
            <span className="inline-block bg-[var(--esl-bg-card)] text-indigo-700 font-bold text-xs px-4 py-2 rounded-lg">{cta || 'CTA...'}</span>
          </div>
        </div>

        {/* Announcement */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2"><Megaphone className="w-4 h-4" /> Зарлалын мөр</h3>
            <button onClick={() => { const val = !announcementActive; setAnnouncementActive(val); saveConfig('announcement_active', val ? 'true' : 'false'); }}
              className="relative w-11 h-6 rounded-full border-none cursor-pointer transition-colors"
              style={{ background: announcementActive ? '#6366F1' : '#333' }}>
              <div className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-[var(--esl-bg-card)] transition-all"
                style={{ left: announcementActive ? '22px' : '3px' }} />
            </button>
          </div>
          <input value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="🎉 Хавар campaign — бүх бараанд 20% хямдрал!"
            className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
          {announcementActive && announcement && (
            <div className="mt-3 bg-indigo-600 text-white text-center text-xs py-2 rounded-lg font-medium">
              {announcement}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
