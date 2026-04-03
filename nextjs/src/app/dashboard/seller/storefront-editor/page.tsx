'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { createDefaultConfig, MOOD_COLORS, MOOD_FONTS, type StorefrontConfig, type Mood } from '@/lib/types/storefront';
import StorefrontEditor from '@/components/storefront/StorefrontEditor';
import { cn } from '@/lib/utils';
import {
  Sparkles, Loader2, Check, Globe, ExternalLink, Copy, Wand2,
  ArrowRight, X, Eye,
} from 'lucide-react';

type FlowStep = 'editor' | 'generating' | 'pick_mood' | 'publish';

const MOODS_TO_GENERATE: { mood: Mood; label: string; emoji: string }[] = [
  { mood: 'elegant', label: 'Нарийн & Премиум', emoji: '🌸' },
  { mood: 'bold', label: 'Тод & Хүчтэй', emoji: '🔥' },
  { mood: 'minimal', label: 'Минимал & Цэвэр', emoji: '⬜' },
];

const LOADING_STEPS = [
  'Брэндийг шинжилж байна...',
  'Дизайн боловсруулж байна...',
  'Бэлэн боллоо!',
];

export default function StorefrontEditorPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [flowStep, setFlowStep] = useState<FlowStep>('editor');

  // AI generation state
  const [genStep, setGenStep] = useState(0);
  const [moodVariants, setMoodVariants] = useState<StorefrontConfig[]>([]);

  // Publish state
  const [subdomain, setSubdomain] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Load existing config
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/seller/storefront', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const { data } = await res.json();
          if (data?.config) {
            setConfig(data.config);
            if (data.subdomain) { setSubdomain(data.subdomain); setPublished(data.published); setPublishedUrl(`${data.subdomain}.eseller.mn`); }
            setLoading(false);
            return;
          }
        }
      } catch {}
      const def = createDefaultConfig(user?._id || '');
      def.hero.headline = user?.store?.name || user?.name || 'Манай дэлгүүр';
      setConfig(def);
      setSubdomain((user?.store?.name || user?.name || 'myshop').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
      setLoading(false);
    })();
  }, [user]);

  // Save config
  const handleSave = async (updated: StorefrontConfig) => {
    setConfig(updated);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/seller/storefront', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ config: updated }),
      });
    } catch {}
  };

  // AI Generate — 3 mood variants
  const handleGenerate = async () => {
    setFlowStep('generating');
    setGenStep(0);

    const token = localStorage.getItem('token');
    const baseInput = {
      sellerName: user?.store?.name || user?.name || 'Дэлгүүр',
      description: 'Чанартай бараа, мэргэжлийн үйлчилгээ',
      category: 'general',
      productImages: [],
      priceRange: 'mid' as const,
    };

    // Animate loading steps
    const timer1 = setTimeout(() => setGenStep(1), 1200);
    const timer2 = setTimeout(() => setGenStep(2), 2500);

    // Generate 3 variants with different moods
    const variants: StorefrontConfig[] = [];
    for (const m of MOODS_TO_GENERATE) {
      try {
        const res = await fetch('/api/ai/generate-storefront', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ ...baseInput, tone: m.mood }),
        });
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            data.theme.mood = m.mood;
            data.theme.primaryColor = MOOD_COLORS[m.mood].primary;
            data.theme.accentColor = MOOD_COLORS[m.mood].accent;
            data.theme.backgroundColor = MOOD_COLORS[m.mood].bg;
            data.theme.textColor = MOOD_COLORS[m.mood].text;
            data.theme.fontDisplay = MOOD_FONTS[m.mood].display;
            data.theme.fontBody = MOOD_FONTS[m.mood].body;
            variants.push(data);
            continue;
          }
        }
      } catch {}
      // Fallback: create rule-based variant
      const def = createDefaultConfig('');
      def.theme.mood = m.mood;
      def.theme.primaryColor = MOOD_COLORS[m.mood].primary;
      def.theme.accentColor = MOOD_COLORS[m.mood].accent;
      def.theme.backgroundColor = MOOD_COLORS[m.mood].bg;
      def.theme.textColor = MOOD_COLORS[m.mood].text;
      def.theme.fontDisplay = MOOD_FONTS[m.mood].display;
      def.theme.fontBody = MOOD_FONTS[m.mood].body;
      def.hero.headline = baseInput.sellerName;
      variants.push(def);
    }

    clearTimeout(timer1);
    clearTimeout(timer2);
    setMoodVariants(variants);
    setGenStep(2);
    setTimeout(() => setFlowStep('pick_mood'), 800);
  };

  // Pick mood variant
  const handlePickMood = (variant: StorefrontConfig) => {
    setConfig(variant);
    handleSave(variant);
    setFlowStep('editor');
  };

  // Publish
  const handlePublish = async () => {
    if (!subdomain.trim()) return;
    setPublishing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/seller/storefront', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ config, published: true, subdomain: subdomain.trim() }),
      });
      if (res.ok) {
        setPublished(true);
        setPublishedUrl(`${subdomain.trim()}.eseller.mn`);
      }
    } catch {}
    finally { setPublishing(false); }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`https://${publishedUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-400 text-sm">Ачааллаж байна...</div>;
  }

  // ═══ GENERATING SCREEN ═══
  if (flowStep === 'generating') {
    return (
      <div className="-m-6 lg:-m-8 flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
            {genStep < 2 ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Check className="w-8 h-8 text-white" />}
          </div>
          <div className="space-y-3">
            {LOADING_STEPS.map((step, i) => (
              <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i <= genStep ? 1 : 0.3, x: 0 }} transition={{ delay: i * 0.3 }}
                className={cn('text-sm font-medium', i <= genStep ? 'text-gray-900' : 'text-gray-400')}>
                {i < genStep ? '✓' : i === genStep ? '⏳' : '○'} {step}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══ PICK MOOD SCREEN ═══
  if (flowStep === 'pick_mood') {
    return (
      <div className="-m-6 lg:-m-8 min-h-screen bg-[#F8FAFC] p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">Дизайн сонгоно уу</h2>
            <p className="text-sm text-gray-500 mt-1">AI 3 өөр загвар үүсгэлээ. Аль нь таалагдаж байна?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {moodVariants.map((variant, i) => {
              const m = MOODS_TO_GENERATE[i];
              return (
                <motion.button key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => handlePickMood(variant)}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer text-left group">
                  {/* Preview */}
                  <div className="h-48 relative" style={{ background: variant.theme.primaryColor }}>
                    <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                      <div>
                        <div className="text-2xl font-bold mb-1" style={{ fontFamily: variant.theme.fontDisplay }}>{variant.hero.headline}</div>
                        <div className="text-xs opacity-70">{variant.hero.subheadline}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-sm font-bold text-gray-900">{m.label}</span>
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      {[variant.theme.primaryColor, variant.theme.accentColor, variant.theme.backgroundColor].map((c, j) => (
                        <div key={j} className="w-6 h-6 rounded-full border border-gray-200" style={{ background: c }} />
                      ))}
                      <span className="text-[10px] text-gray-400 self-center ml-1">{variant.theme.fontDisplay}</span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                      Сонгох <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
          <div className="text-center mt-6">
            <button onClick={() => setFlowStep('editor')} className="text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer">
              Алгасах — гараар засах
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ PUBLISH SCREEN ═══
  if (flowStep === 'publish') {
    return (
      <div className="-m-6 lg:-m-8 flex items-center justify-center min-h-screen bg-[#F8FAFC] p-4">
        <div className="max-w-md w-full space-y-6">
          {published ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Нийтлэгдлээ!</h2>
              <p className="text-sm text-gray-500 mb-4">Таны дэлгүүр амжилттай нийтлэгдлээ</p>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-sm font-mono text-gray-700 flex-1 truncate">{publishedUrl}</span>
                <button onClick={copyUrl} className="text-xs text-indigo-600 font-semibold bg-transparent border-none cursor-pointer">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <a href={`/s/${subdomain}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold no-underline hover:bg-indigo-700 transition">
                  <Eye className="w-4 h-4" /> Харах
                </a>
                <button onClick={() => setFlowStep('editor')} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 cursor-pointer border-none transition">
                  Засах
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-black text-gray-900">Дэлгүүр нийтлэх</h2>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Домайн нэр</label>
                <div className="flex items-center gap-0">
                  <input type="text" value={subdomain} onChange={(e) => { setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSubdomainAvailable(null); }}
                    placeholder="myshop"
                    className="flex-1 px-3 py-2.5 border border-gray-200 border-r-0 rounded-l-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <span className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-r-lg text-xs text-gray-400">.eseller.mn</span>
                </div>
              </div>

              {/* Preview URL */}
              <div className="bg-indigo-50 rounded-xl p-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span className="text-sm text-indigo-700 font-mono">{subdomain || '...'}.eseller.mn</span>
              </div>

              <button onClick={handlePublish} disabled={publishing || !subdomain.trim()}
                className={cn('w-full py-3 rounded-xl text-sm font-semibold border-none cursor-pointer transition flex items-center justify-center gap-2',
                  publishing ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700')}>
                {publishing ? <><Loader2 className="w-4 h-4 animate-spin" /> Нийтэлж байна...</> : <><Sparkles className="w-4 h-4" /> Нийтлэх</>}
              </button>

              <button onClick={() => setFlowStep('editor')} className="w-full text-center text-sm text-gray-500 bg-transparent border-none cursor-pointer hover:text-gray-700">
                ← Засварлах руу буцах
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ MAIN EDITOR ═══
  if (!config) return null;

  return (
    <div className="-m-6 lg:-m-8">
      <StorefrontEditor
        initialConfig={config}
        onSave={handleSave}
        onRegenerate={handleGenerate}
        onPublish={() => setFlowStep('publish')}
        previewUrl={`/s/${user?.username || subdomain || 'demo-salon'}`}
        isPublished={published}
        publishedUrl={publishedUrl}
      />
    </div>
  );
}
