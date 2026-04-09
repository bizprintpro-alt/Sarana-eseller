'use client';

import { useState, useEffect } from 'react';
import { Search, Star, Eye } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';

interface Theme {
  id: string;
  name: string;
  slug: string;
  style: string;
  price: number;
  description: string;
  previewClass: string;
  entityTypes: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
}

const STYLE_LABELS: Record<string, string> = {
  minimal: 'Minimal', bold: 'Bold', modern: 'Modern', luxury: 'Luxury',
};

const TYPE_LABELS: Record<string, string> = {
  store: 'Дэлгүүр', preorder: 'Pre-order', agent: 'Агент',
  company: 'Компани', auto: 'Авто', service: 'Үйлчилгээ', digital: 'Дижитал',
};

const INDUSTRY_CHIPS = [
  { key: 'all', label: 'Бүгд' },
  { key: 'fashion', label: 'Хувцас & Гоо сайхан' },
  { key: 'food', label: 'Хоол & Ундаа' },
  { key: 'tech', label: 'Электроник' },
  { key: 'realestate', label: 'Үл хөдлөх' },
  { key: 'auto', label: 'Авто түрээс' },
  { key: 'service', label: 'Үйлчилгээ' },
  { key: 'digital', label: 'Дижитал контент' },
];

const PREVIEW_GRADIENTS: Record<string, string> = {
  'preview-minimal': 'linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%)',
  'preview-bold': 'linear-gradient(135deg, #E8242C 0%, #1a1a1a 100%)',
  'preview-modern': 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
  'preview-luxury': 'linear-gradient(135deg, #0a0a0a 0%, #1a1210 100%)',
  'preview-nature': 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
  'preview-ocean': 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
};

export default function ThemeStorePage() {
  const toast = useToast();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('all');
  const [sort, setSort] = useState('relevance');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tab !== 'all') params.set('tab', tab);
    if (search) params.set('q', search);
    fetch(`/api/themes?${params}`)
      .then(r => r.json())
      .then(data => setThemes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, search]);

  // Client-side filtering & sorting
  let filtered = [...themes];
  if (industry !== 'all') {
    filtered = filtered.filter(t => t.entityTypes?.some(et =>
      et === industry || (industry === 'fashion' && et === 'store')
    ));
  }
  if (sort === 'price_low') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price_high') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  if (sort === 'newest') filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  const isDark = (style: string) => style === 'modern' || style === 'luxury';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--esl-bg-page)' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--esl-bg-section)', borderBottom: '0.5px solid #2A2A2A',
        padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16, height: 52,
      }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#FFF', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8242C' }} />
          eseller.mn theme store
        </div>

        <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Theme хайх..."
            style={{ width: '100%', height: 34, border: '0.5px solid #2A2A2A', borderRadius: 8, padding: '0 10px 0 32px', background: 'var(--esl-bg-card)', color: '#FFF', fontSize: 12, outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: 0, marginLeft: 'auto' }}>
          {[
            { key: 'all', label: 'Бүх theme' },
            { key: 'free', label: 'Үнэгүй' },
            { key: 'popular', label: 'Эрэлттэй' },
            { key: 'new', label: 'Шинэ' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0 14px', height: 52, display: 'flex', alignItems: 'center',
              fontSize: 12, cursor: 'pointer', border: 'none', background: 'none',
              color: tab === t.key ? '#E8242C' : '#777',
              borderBottom: tab === t.key ? '2px solid #E8242C' : '2px solid transparent',
              fontWeight: tab === t.key ? 500 : 400,
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* Industry chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {INDUSTRY_CHIPS.map(chip => (
            <button key={chip.key} onClick={() => setIndustry(chip.key)} style={{
              padding: '5px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
              border: industry === chip.key ? '0.5px solid #E8242C' : '0.5px solid #2A2A2A',
              background: industry === chip.key ? '#E8242C' : '#111',
              color: industry === chip.key ? '#FFF' : '#777',
              fontWeight: industry === chip.key ? 500 : 400,
              whiteSpace: 'nowrap',
            }}>
              {chip.label}
            </button>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#777' }}>{filtered.length} theme олдлоо</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#555' }}>Эрэмбэлэх:</span>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              height: 32, padding: '0 28px 0 10px', border: '0.5px solid #2A2A2A',
              borderRadius: 8, background: 'var(--esl-bg-section)', color: '#FFF', fontSize: 12, outline: 'none', cursor: 'pointer',
            }}>
              <option value="relevance">Хамааралтай</option>
              <option value="newest">Шинэ түрүүнд</option>
              <option value="price_low">Үнэ: бага → их</option>
              <option value="price_high">Үнэ: их → бага</option>
              <option value="rating">Үнэлгээ</option>
            </select>
          </div>
        </div>

        {/* Theme grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>Ачааллаж байна...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {filtered.map(theme => (
              <div key={theme.id} style={{
                background: 'var(--esl-bg-section)', border: theme.isFeatured ? '2px solid #E8242C' : '0.5px solid #2A2A2A',
                borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                transition: 'transform 0.15s, border-color 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
              >
                {/* Preview */}
                <div style={{
                  position: 'relative', aspectRatio: '16/10', overflow: 'hidden',
                  background: PREVIEW_GRADIENTS[theme.previewClass] || PREVIEW_GRADIENTS['preview-minimal'],
                }}>
                  {/* Mock storefront preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Mock nav */}
                    <div style={{
                      height: 24, background: isDark(theme.style) ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.9)',
                      display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8,
                    }}>
                      <div style={{ width: 40, height: 6, borderRadius: 3, background: isDark(theme.style) ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)' }} />
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                        {[1, 2, 3].map(i => <div key={i} style={{ width: 20, height: 4, borderRadius: 2, background: isDark(theme.style) ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)' }} />)}
                      </div>
                    </div>
                    {/* Mock hero */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ height: 8, width: 80, background: 'rgba(255,255,255,0.8)', borderRadius: 4, margin: '0 auto 6px' }} />
                        <div style={{ height: 5, width: 100, background: 'rgba(255,255,255,0.5)', borderRadius: 3, margin: '0 auto 8px' }} />
                        <div style={{ height: 14, width: 60, background: '#E8242C', borderRadius: 4, margin: '0 auto' }} />
                      </div>
                    </div>
                    {/* Mock products */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: 6, background: isDark(theme.style) ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' }}>
                      {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 28, background: isDark(theme.style) ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', borderRadius: 4 }} />)}
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
                    {theme.price === 0 && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: '#E8242C', color: '#FFF' }}>Үнэгүй</span>}
                    {theme.isNew && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: '#0C447C', color: '#FFF' }}>Шинэ</span>}
                    {theme.isPopular && !theme.isNew && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: '#059669', color: '#FFF' }}>Эрэлттэй</span>}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#FFF' }}>{theme.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: theme.price === 0 ? '#E8242C' : '#FFF' }}>
                      {theme.price === 0 ? 'Үнэгүй' : theme.price.toLocaleString() + '₮'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#555' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={10} color="#F59E0B" fill="#F59E0B" />
                      <span>{theme.rating}%</span>
                    </div>
                    <span>·</span>
                    <span>{theme.reviewCount} үнэлгээ</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#444' }}>by eseller.mn</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                    {theme.entityTypes?.map(tp => (
                      <span key={tp} style={{
                        fontSize: 9, padding: '1px 6px', borderRadius: 99,
                        background: 'var(--esl-bg-card)', color: '#555', border: '0.5px solid #2A2A2A',
                      }}>
                        {TYPE_LABELS[tp] || tp}
                      </span>
                    ))}
                  </div>
                  {/* Apply button */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const token = localStorage.getItem('token');
                        const THEME_CONFIGS: Record<string, any> = {
                          minimal: { theme: 'minimal', primaryColor: '#0A0A0A', bgMode: 'light', fontHeading: 'Inter', fontBody: 'Inter' },
                          bold: { theme: 'bold', primaryColor: '#E8242C', bgMode: 'dark', fontHeading: 'Montserrat', fontBody: 'Inter' },
                          modern: { theme: 'modern', primaryColor: '#E8242C', bgMode: 'dark', fontHeading: 'Inter', fontBody: 'Inter' },
                          luxury: { theme: 'luxury', primaryColor: '#D4AF37', bgMode: 'dark', fontHeading: 'Playfair Display', fontBody: 'Inter' },
                        };
                        const themeConfig = THEME_CONFIGS[theme.style] || THEME_CONFIGS.modern;
                        await fetch('/api/store/storefront', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                          body: JSON.stringify({ config: themeConfig }),
                        });
                        toast.show('Theme амжилттай тохируулагдлаа!');
                      } catch { toast.show('Алдаа гарлаа', 'error'); }
                    }}
                    style={{
                      width: '100%', marginTop: 8, padding: '8px 0', borderRadius: 8,
                      background: '#E8242C', color: '#FFF', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#C41E25')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#E8242C')}
                  >
                    Ашиглах
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
            <Eye size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p>Тохирох theme олдсонгүй</p>
          </div>
        )}
      </div>
    </div>
  );
}
