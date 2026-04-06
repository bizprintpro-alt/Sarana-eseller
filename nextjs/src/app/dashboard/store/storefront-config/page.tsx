'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/shared/Toast';
import {
  Palette, Type, Layout, Image, ToggleLeft, Save, ExternalLink, Eye,
  ChevronDown, Check, Globe, Sparkles,
} from 'lucide-react';

/* ═══ Types ═══ */
interface StorefrontConfig {
  theme: 'minimal' | 'bold' | 'modern' | 'luxury';
  primaryColor: string;
  bgMode: 'light' | 'dark';
  fontHeading: string;
  fontBody: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  sections: string[];
  isPublished: boolean;
}

const DEFAULT_CONFIG: StorefrontConfig = {
  theme: 'modern',
  primaryColor: '#E8242C',
  bgMode: 'light',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  heroTitle: '',
  heroSubtitle: '',
  ctaText: 'Захиалах',
  sections: ['hero', 'products', 'about', 'reviews', 'contact'],
  isPublished: false,
};

const THEMES = [
  { key: 'minimal', label: 'Minimal', desc: 'Цэвэр, энгийн', emoji: '⬜', colors: ['#FFFFFF', '#F5F5F5', '#0A0A0A'] },
  { key: 'bold', label: 'Bold', desc: 'Тод, хүчтэй', emoji: '🟥', colors: ['#E8242C', '#0A0A0A', '#FFFFFF'] },
  { key: 'modern', label: 'Modern', desc: 'Орчин үеийн', emoji: '🔵', colors: ['#1A1A2E', '#E8242C', '#FFFFFF'] },
  { key: 'luxury', label: 'Luxury', desc: 'Тансаг, дээд', emoji: '✨', colors: ['#0A0A0A', '#D4AF37', '#FFFFFF'] },
] as const;

const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Montserrat', 'Poppins'];

const SECTIONS = [
  { key: 'hero', label: 'Hero хэсэг', emoji: '🎬', required: true },
  { key: 'products', label: 'Бүтээгдэхүүн', emoji: '🛍️', required: true },
  { key: 'about', label: 'Тухай', emoji: 'ℹ️' },
  { key: 'reviews', label: 'Үнэлгээ', emoji: '⭐' },
  { key: 'map', label: 'Газрын зураг', emoji: '📍' },
  { key: 'contact', label: 'Холбоо барих', emoji: '📞' },
  { key: 'seller_cta', label: 'Борлуулагч CTA', emoji: '📢' },
];

const PRESET_COLORS = ['#E8242C', '#2563EB', '#059669', '#7C3AED', '#D97706', '#0891B2', '#DC2626', '#0A0A0A'];

/* ═══ Section Label ═══ */
function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
      <Icon className="w-4 h-4 text-[#E8242C]" />
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--esl-text-muted)' }}>{label}</span>
    </div>
  );
}

/* ═══ Main Page ═══ */
export default function StorefrontConfigPage() {
  const { user } = useAuth();
  const toast = useToast();
  const storeSlug = user?.username || 'mystore';

  const [config, setConfig] = useState<StorefrontConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const update = useCallback((partial: Partial<StorefrontConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
    setPreviewKey(k => k + 1);
  }, []);

  const toggleSection = (key: string) => {
    const sections = config.sections.includes(key)
      ? config.sections.filter(s => s !== key)
      : [...config.sections, key];
    update({ sections });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/store/storefront', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ config }),
      });
      if (res.ok) toast.show('Хадгалагдлаа!', 'ok');
      else toast.show('Алдаа гарлаа', 'error');
    } catch { toast.show('Алдаа гарлаа', 'error'); }
    finally { setSaving(false); }
  };

  const handlePublish = async () => {
    update({ isPublished: true });
    setSaving(true);
    try {
      await fetch('/api/store/storefront', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ config: { ...config, isPublished: true } }),
      });
      toast.show('Нийтлэгдлээ! Таны дэлгүүр live боллоо', 'ok');
    } catch { toast.show('Алдаа гарлаа', 'error'); }
    finally { setSaving(false); }
  };

  const previewUrl = `/${storeSlug}`;

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-0 -m-6 lg:-m-8">

      {/* ═══ LEFT: Config Panel ═══ */}
      <div className="w-[340px] shrink-0 border-r overflow-y-auto" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-[#E8242C]" />
            <h1 className="text-lg font-bold" style={{ color: 'var(--esl-text-primary)' }}>Storefront тохиргоо</h1>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--esl-text-muted)' }}>
            eseller.mn/{storeSlug} хуудсаа тохируулна уу
          </p>

          {/* ── 1. THEME ── */}
          <SectionLabel icon={Layout} label="Загвар" />
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(t => (
              <button key={t.key} onClick={() => update({ theme: t.key as StorefrontConfig['theme'] })}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  config.theme === t.key ? 'border-[#E8242C] bg-[rgba(232,36,44,0.05)]' : 'border-[var(--esl-border)] hover:border-[var(--esl-border-strong)]'
                }`} style={{ background: config.theme === t.key ? undefined : 'var(--esl-bg-section)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{t.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--esl-text-primary)' }}>{t.label}</span>
                  {config.theme === t.key && <Check className="w-3 h-3 text-[#E8242C] ml-auto" />}
                </div>
                <p className="text-[10px]" style={{ color: 'var(--esl-text-muted)' }}>{t.desc}</p>
                <div className="flex gap-1 mt-1.5">
                  {t.colors.map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ background: c }} />
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* ── 2. COLORS ── */}
          <SectionLabel icon={Palette} label="Өнгө" />
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold block mb-1.5" style={{ color: 'var(--esl-text-secondary)' }}>Үндсэн өнгө</label>
              <div className="flex gap-1.5 mb-2">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => update({ primaryColor: c })}
                    className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-all ${config.primaryColor === c ? 'border-[var(--esl-text-primary)] scale-110' : 'border-transparent'}`}
                    style={{ background: c }} />
                ))}
              </div>
              <div className="flex gap-2">
                <input type="color" value={config.primaryColor} onChange={e => update({ primaryColor: e.target.value })}
                  className="w-10 h-8 rounded-lg cursor-pointer border-none" />
                <input type="text" value={config.primaryColor} onChange={e => update({ primaryColor: e.target.value })}
                  className="flex-1 h-8 px-3 rounded-lg border text-xs font-mono outline-none"
                  style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold block mb-1.5" style={{ color: 'var(--esl-text-secondary)' }}>Арын фон</label>
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map(m => (
                  <button key={m} onClick={() => update({ bgMode: m })}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                      config.bgMode === m ? 'border-[#E8242C] text-[#E8242C]' : 'border-[var(--esl-border)]'
                    }`} style={{ background: config.bgMode === m ? 'rgba(232,36,44,0.05)' : 'var(--esl-bg-section)', color: config.bgMode !== m ? 'var(--esl-text-secondary)' : undefined }}>
                    {m === 'light' ? '☀️ Өдөр' : '🌙 Шөнө'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── 3. FONTS ── */}
          <SectionLabel icon={Type} label="Фонт" />
          <div className="space-y-3">
            {[
              { key: 'fontHeading' as const, label: 'Гарчиг' },
              { key: 'fontBody' as const, label: 'Текст' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-semibold block mb-1.5" style={{ color: 'var(--esl-text-secondary)' }}>{f.label} фонт</label>
                <select value={config[f.key]} onChange={e => update({ [f.key]: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border text-xs outline-none cursor-pointer"
                  style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }}>
                  {FONTS.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* ── 4. HERO ── */}
          <SectionLabel icon={Image} label="Hero хэсэг" />
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold block mb-1.5" style={{ color: 'var(--esl-text-secondary)' }}>Гарчиг</label>
              <input type="text" value={config.heroTitle} onChange={e => update({ heroTitle: e.target.value })}
                placeholder="Манай дэлгүүрт тавтай морил"
                className="w-full h-9 px-3 rounded-lg border text-sm outline-none focus:border-[#E8242C]"
                style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
            </div>
            <div>
              <label className="text-[10px] font-semibold block mb-1.5" style={{ color: 'var(--esl-text-secondary)' }}>Дэд гарчиг</label>
              <textarea value={config.heroSubtitle} onChange={e => update({ heroSubtitle: e.target.value })}
                placeholder="Бидний тухай товч тайлбар..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#E8242C] resize-none"
                style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
            </div>
            <div>
              <label className="text-[10px] font-semibold block mb-1.5" style={{ color: 'var(--esl-text-secondary)' }}>CTA товчны текст</label>
              <input type="text" value={config.ctaText} onChange={e => update({ ctaText: e.target.value })}
                placeholder="Захиалах"
                className="w-full h-9 px-3 rounded-lg border text-sm outline-none focus:border-[#E8242C]"
                style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
            </div>
          </div>

          {/* ── 5. SECTIONS ── */}
          <SectionLabel icon={ToggleLeft} label="Хэсгүүд" />
          <div className="space-y-1.5">
            {SECTIONS.map(s => {
              const active = config.sections.includes(s.key);
              return (
                <button key={s.key} onClick={() => !s.required && toggleSection(s.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    s.required ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  } ${active ? 'border-[#E8242C]/30 bg-[rgba(232,36,44,0.03)]' : 'border-[var(--esl-border)]'}`}
                  style={{ background: active ? undefined : 'var(--esl-bg-section)' }}>
                  <span className="text-sm">{s.emoji}</span>
                  <span className="flex-1 text-xs font-medium" style={{ color: 'var(--esl-text-primary)' }}>{s.label}</span>
                  <div className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-colors ${active ? 'bg-[#E8242C]' : 'bg-[var(--esl-border)]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-3' : 'translate-x-0'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── 6. ACTIONS ── */}
          <div className="mt-6 space-y-2 pb-4">
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border cursor-pointer transition-all"
              style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }}>
              <Save className="w-4 h-4" /> {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
            <button onClick={handlePublish} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-[#E8242C] text-white border-none cursor-pointer hover:bg-[#C41E25] transition-all shadow-sm">
              <Sparkles className="w-4 h-4" /> {config.isPublished ? 'Шинэчлэх & Нийтлэх' : 'Нийтлэх →'}
            </button>
            {config.isPublished && (
              <a href={previewUrl} target="_blank" rel="noopener"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold no-underline transition-all"
                style={{ color: 'var(--esl-text-muted)' }}>
                <ExternalLink className="w-3.5 h-3.5" /> eseller.mn/{storeSlug} харах
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: Live Preview ═══ */}
      <div className="flex-1 flex flex-col" style={{ background: 'var(--esl-bg-section)' }}>
        {/* Preview toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: 'var(--esl-text-muted)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--esl-text-secondary)' }}>Урьдчилсан харагдац</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: config.isPublished ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)', color: config.isPublished ? '#16A34A' : '#D97706' }}>
              {config.isPublished ? '● Live' : '● Ноорог'}
            </span>
            <a href={previewUrl} target="_blank" rel="noopener"
              className="text-xs font-medium px-3 py-1.5 rounded-lg border no-underline flex items-center gap-1"
              style={{ borderColor: 'var(--esl-border)', color: 'var(--esl-text-secondary)', background: 'var(--esl-bg-card)' }}>
              <ExternalLink className="w-3 h-3" /> Шинэ цонхонд
            </a>
          </div>
        </div>

        {/* iframe preview */}
        <div className="flex-1 p-4">
          <div className="w-full h-full rounded-xl overflow-hidden border shadow-lg" style={{ borderColor: 'var(--esl-border)' }}>
            <iframe
              key={previewKey}
              src={previewUrl}
              className="w-full h-full border-none"
              title="Storefront Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
