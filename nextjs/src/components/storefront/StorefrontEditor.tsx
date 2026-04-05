'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { StorefrontConfig, Mood, FontFamily, Section, SectionType } from '@/lib/types/storefront';
import { MOOD_COLORS, MOOD_FONTS } from '@/lib/types/storefront';
import StorefrontRenderer from './StorefrontRenderer';
import {
  Eye, EyeOff, GripVertical, ChevronUp, ChevronDown, Palette,
  Type, Sparkles, Save, ExternalLink, RotateCcw, Monitor, Smartphone,
  Plus, Trash2,
} from 'lucide-react';

interface StorefrontEditorProps {
  initialConfig: StorefrontConfig;
  onSave: (config: StorefrontConfig) => void;
  onRegenerate?: () => void;
  onPublish?: () => void;
  previewUrl?: string;
  isPublished?: boolean;
  publishedUrl?: string;
}

const MOODS: { key: Mood; label: string; emoji: string }[] = [
  { key: 'elegant', label: 'Нарийн', emoji: '🌸' },
  { key: 'bold', label: 'Тод', emoji: '🔥' },
  { key: 'minimal', label: 'Минимал', emoji: '⬜' },
  { key: 'playful', label: 'Хөгжилтэй', emoji: '🎨' },
  { key: 'earthy', label: 'Байгальд ойр', emoji: '🌿' },
  { key: 'industrial', label: 'Аж үйлдвэрийн', emoji: '🔩' },
  { key: 'luxury', label: 'Люкс', emoji: '💎' },
];

const FONTS: FontFamily[] = ['Cormorant Garamond', 'Space Grotesk', 'Playfair Display', 'DM Sans', 'Unbounded', 'Lora', 'Syne'];

const SECTION_LABELS: Record<SectionType, string> = {
  hero_fullscreen: 'Hero (бүтэн дэлгэц)',
  hero_split: 'Hero (хуваасан)',
  hero_centered: 'Hero (голлосон)',
  featured_products: 'Онцлох бараа',
  about_story: 'Бидний тухай',
  instagram_grid: 'Галерей',
  testimonials: 'Сэтгэгдэл',
  video_banner: 'Видео баннер',
  category_showcase: 'Ангилал',
  cta_banner: 'CTA баннер',
  contact_map: 'Холбоо барих',
};

export default function StorefrontEditor({ initialConfig, onSave, onRegenerate, onPublish, previewUrl, isPublished, publishedUrl }: StorefrontEditorProps) {
  const [config, setConfig] = useState<StorefrontConfig>(initialConfig);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);

  const updateTheme = useCallback((updates: Partial<StorefrontConfig['theme']>) => {
    setConfig((prev) => ({ ...prev, theme: { ...prev.theme, ...updates } }));
  }, []);

  const updateHero = useCallback((updates: Partial<StorefrontConfig['hero']>) => {
    setConfig((prev) => ({ ...prev, hero: { ...prev.hero, ...updates } }));
  }, []);

  const setMood = useCallback((mood: Mood) => {
    const colors = MOOD_COLORS[mood];
    const fonts = MOOD_FONTS[mood];
    updateTheme({
      mood,
      primaryColor: colors.primary,
      accentColor: colors.accent,
      backgroundColor: colors.bg,
      textColor: colors.text,
      fontDisplay: fonts.display,
      fontBody: fonts.body,
    });
  }, [updateTheme]);

  const toggleSection = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s),
    }));
  }, []);

  const moveSection = useCallback((id: string, dir: -1 | 1) => {
    setConfig((prev) => {
      const sections = [...prev.sections].sort((a, b) => a.order - b.order);
      const idx = sections.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= sections.length) return prev;
      const temp = sections[idx].order;
      sections[idx].order = sections[target].order;
      sections[target].order = temp;
      return { ...prev, sections };
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setConfig((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.id !== id) }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(config); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex h-screen bg-[var(--esl-bg-section)] overflow-hidden">
      {/* ═══ LEFT PANEL — Controls ═══ */}
      <div className="w-[320px] bg-white border-r border-[var(--esl-border)] flex flex-col shrink-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--esl-border)] shrink-0">
          <h2 className="text-sm font-bold text-[var(--esl-text-primary)]">Дэлгүүр засварлах</h2>
          <div className="flex gap-1">
            {onRegenerate && (
              <button onClick={onRegenerate} className="w-8 h-8 rounded-lg hover:bg-[var(--esl-bg-section)] flex items-center justify-center border-none cursor-pointer bg-transparent" title="AI дахин үүсгэх">
                <RotateCcw className="w-4 h-4 text-[var(--esl-text-muted)]" />
              </button>
            )}
            {previewUrl && (
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg hover:bg-[var(--esl-bg-section)] flex items-center justify-center no-underline" title="Шинэ цонхонд нээх">
                <ExternalLink className="w-4 h-4 text-[var(--esl-text-muted)]" />
              </a>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ─── Mood selector ─── */}
          <div className="px-4 py-4 border-b border-[var(--esl-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-[var(--esl-text-primary)] uppercase tracking-wider">Загвар</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {MOODS.map((m) => (
                <button key={m.key} onClick={() => setMood(m.key)}
                  className={cn('flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-semibold border-none cursor-pointer transition',
                    config.theme.mood === m.key ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300' : 'bg-[var(--esl-bg-section)] text-[var(--esl-text-secondary)] hover:bg-[var(--esl-bg-section)]')}>
                  <span className="text-base">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Colors ─── */}
          <div className="px-4 py-4 border-b border-[var(--esl-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-[var(--esl-text-primary)] uppercase tracking-wider">Өнгө</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'primaryColor' as const, label: 'Үндсэн' },
                { key: 'accentColor' as const, label: 'Онцгой' },
                { key: 'backgroundColor' as const, label: 'Арын фон' },
                { key: 'textColor' as const, label: 'Текст' },
              ].map((c) => (
                <label key={c.key} className="flex items-center gap-2 text-xs text-[var(--esl-text-secondary)]">
                  <input type="color" value={config.theme[c.key]} onChange={(e) => updateTheme({ [c.key]: e.target.value })}
                    className="w-7 h-7 rounded border border-[var(--esl-border)] cursor-pointer p-0" />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          {/* ─── Fonts ─── */}
          <div className="px-4 py-4 border-b border-[var(--esl-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-[var(--esl-text-primary)] uppercase tracking-wider">Фонт</span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-[var(--esl-text-muted)] mb-1 block">Гарчиг</label>
                <select value={config.theme.fontDisplay} onChange={(e) => updateTheme({ fontDisplay: e.target.value as FontFamily })}
                  className="w-full px-2 py-1.5 border border-[var(--esl-border)] rounded-lg text-xs bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[var(--esl-text-muted)] mb-1 block">Текст</label>
                <select value={config.theme.fontBody} onChange={(e) => updateTheme({ fontBody: e.target.value as FontFamily })}
                  className="w-full px-2 py-1.5 border border-[var(--esl-border)] rounded-lg text-xs bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ─── Hero ─── */}
          <div className="px-4 py-4 border-b border-[var(--esl-border)]">
            <span className="text-xs font-bold text-[var(--esl-text-primary)] uppercase tracking-wider mb-3 block">Hero</span>
            <div className="space-y-2">
              <input type="text" value={config.hero.headline} onChange={(e) => updateHero({ headline: e.target.value })} placeholder="Гарчиг"
                className="w-full px-2.5 py-2 border border-[var(--esl-border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <input type="text" value={config.hero.subheadline} onChange={(e) => updateHero({ subheadline: e.target.value })} placeholder="Дэд гарчиг"
                className="w-full px-2.5 py-2 border border-[var(--esl-border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <input type="text" value={config.hero.ctaText} onChange={(e) => updateHero({ ctaText: e.target.value })} placeholder="Товчний текст"
                className="w-full px-2.5 py-2 border border-[var(--esl-border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          {/* ─── Sections ─── */}
          <div className="px-4 py-4">
            <span className="text-xs font-bold text-[var(--esl-text-primary)] uppercase tracking-wider mb-3 block">Хэсгүүд</span>
            <div className="space-y-1">
              {[...config.sections].sort((a, b) => a.order - b.order).map((s) => (
                <div key={s.id} className={cn('flex items-center gap-2 px-2.5 py-2 rounded-lg transition', s.visible ? 'bg-[var(--esl-bg-section)]' : 'bg-[var(--esl-bg-section)]/50 opacity-50')}>
                  <GripVertical className="w-3.5 h-3.5 text-[var(--esl-text-muted)] cursor-grab shrink-0" />
                  <span className="text-xs font-medium text-[var(--esl-text-primary)] flex-1 truncate">{SECTION_LABELS[s.type] || s.type}</span>
                  <button onClick={() => moveSection(s.id, -1)} className="w-5 h-5 rounded bg-transparent border-none cursor-pointer flex items-center justify-center text-[var(--esl-text-muted)] hover:text-[var(--esl-text-secondary)]">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => moveSection(s.id, 1)} className="w-5 h-5 rounded bg-transparent border-none cursor-pointer flex items-center justify-center text-[var(--esl-text-muted)] hover:text-[var(--esl-text-secondary)]">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button onClick={() => toggleSection(s.id)} className="w-5 h-5 rounded bg-transparent border-none cursor-pointer flex items-center justify-center text-[var(--esl-text-muted)] hover:text-[var(--esl-text-secondary)]">
                    {s.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  <button onClick={() => removeSection(s.id)} className="w-5 h-5 rounded bg-transparent border-none cursor-pointer flex items-center justify-center text-[var(--esl-text-muted)] hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save + Publish */}
        <div className="px-4 py-3 border-t border-[var(--esl-border)] shrink-0 space-y-2">
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 border-none cursor-pointer transition disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
          {onPublish && (
            <button onClick={() => { handleSave(); onPublish(); }}
              className={cn('w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition',
                isPublished ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-emerald-600 text-white hover:bg-emerald-700')}>
              {isPublished ? <><ExternalLink className="w-4 h-4" /> Нийтлэгдсэн — {publishedUrl}</> : <><Sparkles className="w-4 h-4" /> Нийтлэх</>}
            </button>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Preview ═══ */}
      <div className="flex-1 flex flex-col">
        {/* Preview toolbar */}
        <div className="flex items-center justify-center gap-2 h-10 bg-gray-200/50 border-b border-[var(--esl-border)] shrink-0">
          <button onClick={() => setPreviewMode('desktop')}
            className={cn('p-1.5 rounded-md border-none cursor-pointer transition', previewMode === 'desktop' ? 'bg-white shadow-sm text-[var(--esl-text-primary)]' : 'bg-transparent text-[var(--esl-text-muted)]')}>
            <Monitor className="w-4 h-4" />
          </button>
          <button onClick={() => setPreviewMode('mobile')}
            className={cn('p-1.5 rounded-md border-none cursor-pointer transition', previewMode === 'mobile' ? 'bg-white shadow-sm text-[var(--esl-text-primary)]' : 'bg-transparent text-[var(--esl-text-muted)]')}>
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-[var(--esl-bg-section)]">
          <div className={cn('bg-white shadow-xl overflow-hidden transition-all duration-300',
            previewMode === 'mobile' ? 'w-[375px] rounded-[2rem] ring-8 ring-gray-800' : 'w-full max-w-[1200px] rounded-lg')}>
            <div className={cn(previewMode === 'mobile' ? 'h-[812px] overflow-y-auto' : 'min-h-[600px]')}>
              <StorefrontRenderer config={config} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
