'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { ENTITY_LABELS, type EntityType } from '@/lib/types/entity';
import EsellerLogo from '@/components/shared/EsellerLogo';
import {
  Store, Building2, Car, Scissors, Users, ChevronRight, ChevronLeft,
  Check, Upload, MapPin, Globe, Phone, Mail, Camera, FileText,
  Shield, Sparkles, ArrowRight,
} from 'lucide-react';

const STEPS = ['Төрөл сонгох', 'Үндсэн мэдээлэл', 'Баримт бичиг', 'Профайл', 'Илгээх'];

const ENTITY_OPTIONS: { key: EntityType; icon: React.ElementType; label: string; desc: string; features: string[] }[] = [
  { key: 'store', icon: Store, label: 'Дэлгүүр', desc: 'Бараа бүтээгдэхүүн борлуулах онлайн дэлгүүр', features: ['Бараа удирдлага', 'Захиалгын систем', 'Хүргэлт', 'Хямдрал & купон'] },
  { key: 'agent', icon: Users, label: 'Үл хөдлөхийн агент', desc: 'Орон сууц, газар, оффисийн зуучлал', features: ['Зар байршуулах', 'Мэргэжлийн профайл', 'Харилцагч удирдлага', 'Аналитик'] },
  { key: 'company', icon: Building2, label: 'Барилгын компани', desc: 'Шинэ барилга, орон сууцны төсөл', features: ['Төслийн удирдлага', 'Галерей', 'Баримт бичиг', 'VIP байршил'] },
  { key: 'auto_dealer', icon: Car, label: 'Авто худалдаа', desc: 'Шинэ болон хуучин автомашин', features: ['Машины жагсаалт', 'Техник тодорхойлолт', 'Үнийн харьцуулалт', 'Тест драйв'] },
  { key: 'service', icon: Scissors, label: 'Үйлчилгээ', desc: 'Салон, засвар, хэвлэл, сургалт г.м.', features: ['Цаг захиалга', 'Үйлчилгээний жагсаалт', 'Хуанли', 'Портфолио'] },
];

const DISTRICTS = ['СБД', 'ЧД', 'БЗД', 'ХУД', 'СХД', 'БГД', 'НД', 'Хан-Уул', 'Налайх', 'Багануур', 'Багахангай'];

export default function BecomeSellerPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [entityType, setEntityType] = useState<EntityType | null>(null);
  const [form, setForm] = useState({
    name: '', slug: '', phone: '', email: user?.email || '',
    category: '', description: '',
    // KYC
    regNumber: '', licenseNumber: '', idNumber: '',
    // Profile
    address: '', district: '', socialFb: '', socialIg: '', website: '',
  });

  const updateForm = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  // Auto-generate slug
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
    setForm((prev) => ({ ...prev, name, slug }));
  };

  const canNext = () => {
    if (step === 0) return !!entityType;
    if (step === 1) return form.name.length >= 2 && form.phone.length >= 4;
    if (step === 2) return true; // KYC optional for now
    if (step === 3) return true;
    return true;
  };

  const handleSubmit = async () => {
    if (!entityType) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/entities/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ entityType, ...form }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {}
    finally { setSubmitting(false); }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Амжилттай илгээлээ!</h2>
          <p className="text-sm text-gray-500 mb-6">Таны хүсэлтийг хянаж байна. Баталгаажуулалт дууссаны дараа имэйлээр мэдэгдэнэ.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
            <p className="text-xs text-amber-700"><Shield className="w-3.5 h-3.5 inline mr-1" /> Баталгаажуулалт 1-3 ажлын өдөрт хийгдэнэ</p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold no-underline hover:bg-indigo-700 transition">
            Самбар руу очих <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 h-14 flex items-center px-4">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <EsellerLogo size={22} />
            <span className="text-base font-black text-gray-900">eseller<span className="text-[#E31E24]">.mn</span></span>
          </Link>
          <span className="text-xs text-gray-400">Бүртгэл</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <div className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-indigo-600' : 'bg-gray-200')} />
            </div>
          ))}
        </div>
        <div className="text-center mb-6">
          <span className="text-xs text-gray-400">Алхам {step + 1}/{STEPS.length}</span>
          <h2 className="text-xl font-black text-gray-900 mt-1">{STEPS[step]}</h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {/* ═══ Step 0: Entity type ═══ */}
            {step === 0 && (
              <div className="space-y-3">
                {ENTITY_OPTIONS.map((opt) => {
                  const isSelected = entityType === opt.key;
                  return (
                    <button key={opt.key} onClick={() => setEntityType(opt.key)}
                      className={cn('w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left cursor-pointer transition-all bg-white',
                        isSelected ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,.12)]' : 'border-gray-200 hover:border-gray-300')}>
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition',
                        isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400')}>
                        <opt.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold text-gray-900">{opt.label}</div>
                        <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {opt.features.map((f) => (
                            <span key={f} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100">{f}</span>
                          ))}
                        </div>
                      </div>
                      {isSelected && <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-white" /></div>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ═══ Step 1: Basic info ═══ */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Нэр *</label>
                  <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder={entityType === 'agent' ? 'Овог нэр' : 'Бизнесийн нэр'}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Slug (URL)</label>
                  <div className="flex items-center gap-0">
                    <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-xs text-gray-400">eseller.mn/</span>
                    <input type="text" value={form.slug} onChange={(e) => updateForm('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block"><Phone className="w-3 h-3 inline mr-1" />Утас *</label>
                    <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="9911-2233"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block"><Mail className="w-3 h-3 inline mr-1" />Имэйл</label>
                    <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Товч тайлбар</label>
                  <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={3} placeholder="Бизнесийн тухай товчхон... (200 тэмдэгт)"
                    maxLength={200} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  <div className="text-[10px] text-gray-400 text-right">{form.description.length}/200</div>
                </div>
              </div>
            )}

            {/* ═══ Step 2: KYC / Verification ═══ */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700">
                  <Shield className="w-3.5 h-3.5 inline mr-1" />
                  Баримт бичиг оруулснаар баталгаажуулалт хурдан хийгдэнэ. Заавал биш.
                </div>

                {(entityType === 'store' || entityType === 'company' || entityType === 'auto_dealer') && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">ААН бүртгэлийн дугаар</label>
                      <input type="text" value={form.regNumber} onChange={(e) => updateForm('regNumber', e.target.value)} placeholder="1234567"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition">
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Улсын бүртгэлийн гэрчилгээ</p>
                      <p className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG — 10MB хүртэл</p>
                    </div>
                  </>
                )}

                {entityType === 'agent' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Зуучийн лицензийн дугаар</label>
                      <input type="text" value={form.licenseNumber} onChange={(e) => updateForm('licenseNumber', e.target.value)} placeholder="RE-2024-XXXX"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition">
                      <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Лицензийн хуулбар</p>
                      <p className="text-[10px] text-gray-400 mt-1">PDF, JPG — 10MB хүртэл</p>
                    </div>
                  </>
                )}

                {entityType === 'service' && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition">
                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Холбогдох баримт бичиг (заавал биш)</p>
                    <p className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG — 10MB хүртэл</p>
                  </div>
                )}
              </div>
            )}

            {/* ═══ Step 3: Profile setup ═══ */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                {/* Cover image */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block"><Camera className="w-3 h-3 inline mr-1" />Cover зураг</label>
                  <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">1200×400 px санал болгоно</p>
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Лого / Профайл зураг</label>
                  <div className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                    <Camera className="w-6 h-6 text-gray-300" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block"><MapPin className="w-3 h-3 inline mr-1" />Хаяг</label>
                  <input type="text" value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Дэлгэрэнгүй хаяг"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Дүүрэг</label>
                  <select value={form.district} onChange={(e) => updateForm('district', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Сонгох...</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Social */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block"><Globe className="w-3 h-3 inline mr-1" />Вэбсайт</label>
                    <input type="url" value={form.website} onChange={(e) => updateForm('website', e.target.value)} placeholder="https://..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Facebook</label>
                    <input type="text" value={form.socialFb} onChange={(e) => updateForm('socialFb', e.target.value)} placeholder="fb.com/..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Step 4: Review ═══ */}
            {step === 4 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Шалгаж баталгаажуулна уу</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Төрөл</span>
                    <span className="font-semibold text-gray-900">{ENTITY_LABELS[entityType!]?.emoji} {ENTITY_LABELS[entityType!]?.label}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Нэр</span>
                    <span className="font-semibold text-gray-900">{form.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">URL</span>
                    <span className="font-mono text-xs text-indigo-600">eseller.mn/{form.slug}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Утас</span>
                    <span className="font-semibold text-gray-900">{form.phone}</span>
                  </div>
                  {form.district && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Дүүрэг</span>
                      <span className="font-semibold text-gray-900">{form.district}</span>
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-xs text-gray-500">
                    <a href="#" className="text-indigo-600 no-underline">Үйлчилгээний нөхцөл</a> болон <a href="#" className="text-indigo-600 no-underline">нууцлалын бодлого</a>-г зөвшөөрч байна.
                  </span>
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className={cn('flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer border-none',
              step === 0 ? 'text-gray-300 bg-transparent cursor-not-allowed' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50')}>
            <ChevronLeft className="w-4 h-4" /> Өмнөх
          </button>

          {step < 4 ? (
            <button onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}
              className={cn('flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition border-none cursor-pointer',
                canNext() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}>
              Дараах <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition border-none cursor-pointer">
              {submitting ? 'Илгээж байна...' : <><Sparkles className="w-4 h-4" /> Хүсэлт илгээх</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
