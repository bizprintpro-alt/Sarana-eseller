'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { MediaUploader } from '@/components/shared/MediaUploader';
import { ArrowLeft, Send, MapPin, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';

const ENTITY_FIELDS: Record<string, { label: string; fields: { key: string; label: string; type: string; ph: string }[] }> = {
  agent: { label: 'Үл хөдлөх', fields: [
    { key: 'sqm', label: 'Талбай (м²)', type: 'number', ph: '78' },
    { key: 'rooms', label: 'Өрөөний тоо', type: 'number', ph: '3' },
    { key: 'floor', label: 'Давхар', type: 'number', ph: '5' },
  ]},
  auto_dealer: { label: 'Авто', fields: [
    { key: 'year', label: 'Он', type: 'number', ph: '2022' },
    { key: 'mileage', label: 'Гүйлт (км)', type: 'number', ph: '45000' },
    { key: 'fuel', label: 'Түлш', type: 'text', ph: 'Бензин / Hybrid' },
  ]},
  company: { label: 'Барилга', fields: [
    { key: 'sqm', label: 'Талбай (м²)', type: 'number', ph: '65' },
    { key: 'rooms', label: 'Өрөөний тоо', type: 'number', ph: '2' },
    { key: 'completionYear', label: 'Ашиглалтын он', type: 'number', ph: '2027' },
  ]},
  service: { label: 'Үйлчилгээ', fields: [
    { key: 'duration', label: 'Үргэлжлэх хугацаа', type: 'text', ph: '60 минут' },
  ]},
};

const DISTRICTS = ['СБД', 'ХУД', 'БЗД', 'ЧД', 'БГД', 'СХД', 'НД', 'БНД', 'Баганууд', 'Налайх'];

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', price: '', originalPrice: '', category: '', district: '', tier: 'normal' });
  const [images, setImages] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const entityType = (user as any)?.entityType || 'store';
  const config = ENTITY_FIELDS[entityType];
  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const updateMeta = (k: string, v: string) => setMetadata(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title) { setError('Гарчиг оруулна уу'); return; }
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const res = await fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        ...form,
        price: form.price ? Number(form.price) : undefined,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        images,
        entityType,
        metadata: Object.fromEntries(Object.entries(metadata).filter(([, v]) => v)),
      }),
    });

    if (res.ok) {
      router.push('/dashboard/store/listings');
    } else {
      const d = await res.json();
      setError(d.error || d.data?.error || 'Алдаа гарлаа');
    }
    setLoading(false);
  };

  const inputCls = "w-full px-3 py-2.5 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)] outline-none focus:border-[#E8242C]";
  const labelCls = "text-xs font-semibold text-[var(--esl-text-secondary)] mb-1.5 block";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/store/listings" className="w-8 h-8 rounded-lg bg-[var(--esl-bg-section)] border border-[var(--esl-border)] flex items-center justify-center text-[var(--esl-text-muted)] no-underline hover:bg-[var(--esl-bg-card)]">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-[var(--esl-text-primary)]">Зар нэмэх</h1>
          <p className="text-xs text-[var(--esl-text-secondary)]">{config?.label || 'Шинэ зар'}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Үндсэн мэдээлэл */}
      <div className="bg-[var(--esl-bg-card)] rounded-2xl border border-[var(--esl-border)] p-6 space-y-4">
        <h3 className="font-bold text-[var(--esl-text-primary)] flex items-center gap-2"><Tag className="w-4 h-4" /> Үндсэн</h3>
        <div>
          <label className={labelCls}>Гарчиг *</label>
          <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="3 өрөө байр, 13-р хороолол" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Тайлбар</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} placeholder="Дэлгэрэнгүй тайлбар..." className={inputCls + " resize-y"} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Үнэ (₮)</label>
            <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="280000000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Хуучин үнэ (₮)</label>
            <input type="number" value={form.originalPrice} onChange={e => update('originalPrice', e.target.value)} placeholder="Хоосон = хямдралгүй" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Зурагнууд */}
      <div className="bg-[var(--esl-bg-card)] rounded-2xl border border-[var(--esl-border)] p-6">
        <MediaUploader context="product" value={images} onChange={setImages} maxFiles={10} label={`Зурагнууд (${images.length}/10)`} />
      </div>

      {/* Байршил */}
      <div className="bg-[var(--esl-bg-card)] rounded-2xl border border-[var(--esl-border)] p-6 space-y-4">
        <h3 className="font-bold text-[var(--esl-text-primary)] flex items-center gap-2"><MapPin className="w-4 h-4" /> Байршил</h3>
        <div>
          <label className={labelCls}>Дүүрэг</label>
          <select value={form.district} onChange={e => update('district', e.target.value)} className={inputCls}>
            <option value="">Сонгох...</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Ангилал</label>
          <input value={form.category} onChange={e => update('category', e.target.value)} placeholder="home-living, auto-moto, electronics..." className={inputCls} />
        </div>
      </div>

      {/* Entity-тусгай metadata */}
      {config && config.fields.length > 0 && (
        <div className="bg-[var(--esl-bg-card)] rounded-2xl border border-[var(--esl-border)] p-6 space-y-4">
          <h3 className="font-bold text-[var(--esl-text-primary)]">{config.label} мэдээлэл</h3>
          <div className="grid grid-cols-2 gap-4">
            {config.fields.map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input type={f.type} value={metadata[f.key] || ''} onChange={e => updateMeta(f.key, e.target.value)} placeholder={f.ph} className={inputCls} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#E8242C] text-white rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-red-700 transition disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? 'Илгээж байна...' : 'Зар нэмэх'}
      </button>
    </div>
  );
}
