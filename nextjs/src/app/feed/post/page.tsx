'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EsellerLogo from '@/components/shared/EsellerLogo';
import {
  Camera, X, Crown, Info, ArrowLeft, Send,
  Home, Car, Smartphone, ShoppingBag, Wrench, Sofa, Baby,
  Dumbbell, Sparkles, Package, MapPin, Phone,
} from 'lucide-react';

const CATEGORIES = [
  { key: 'apartment', label: 'Орон сууц', emoji: '🏠', Icon: Home },
  { key: 'auto', label: 'Авто', emoji: '🚗', Icon: Car },
  { key: 'electronics', label: 'Электроник', emoji: '📱', Icon: Smartphone },
  { key: 'fashion', label: 'Хувцас', emoji: '👗', Icon: ShoppingBag },
  { key: 'furniture', label: 'Тавилга', emoji: '🛋️', Icon: Sofa },
  { key: 'services', label: 'Үйлчилгээ', emoji: '🔧', Icon: Wrench },
  { key: 'kids', label: 'Хүүхэд', emoji: '🧸', Icon: Baby },
  { key: 'sports', label: 'Спорт', emoji: '⚽', Icon: Dumbbell },
  { key: 'beauty', label: 'Гоо сайхан', emoji: '💄', Icon: Sparkles },
  { key: 'other', label: 'Бусад', emoji: '📦', Icon: Package },
];

const DISTRICTS = ['СБД', 'ХУД', 'БЗД', 'ЧД', 'БГД', 'СХД', 'НД', 'БНД'];
const CONDITIONS = [
  { key: 'new', label: 'Шинэ' },
  { key: 'like_new', label: 'Бараг шинэ' },
  { key: 'used', label: 'Хэрэглэсэн' },
  { key: 'broken', label: 'Эвдэрсэн' },
];

export default function PostAdPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [condition, setCondition] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim() && price.trim() && category && district;

  const addImage = () => {
    if (images.length >= 10) return;
    const placeholders = ['📸', '🖼️', '🏞️', '📷', '🎞️'];
    setImages([...images, placeholders[images.length % placeholders.length]]);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert('Зар амжилттай илгээгдлээ! Админ шалгасны дараа нийтлэгдэнэ.');
      router.push('/feed');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#111111] border-b border-[#2A2A2A]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#3D3D3D] flex items-center justify-center text-white cursor-pointer hover:bg-[#2A2A2A] transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-white">Зар оруулах</h1>
            <p className="text-xs text-[#777]">Зурагтай зар илүү олон хүнд хүрнэ</p>
          </div>
          <Link href="/" className="flex items-center gap-2 no-underline">
            <EsellerLogo size={24} />
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Images */}
        <div className="mb-8">
          <label className="text-sm font-bold text-[#E0E0E0] mb-3 block">Зураг (10 хүртэл)</label>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={addImage}
              className="w-28 h-28 rounded-xl border-2 border-dashed border-[#3D3D3D] bg-[#1A1A1A] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#E8242C] hover:bg-[#1A1A1A] transition-colors text-[#777]"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-semibold">Нэмэх</span>
              <span className="text-[10px] text-[#555]">{images.length}/10</span>
            </button>
            {images.map((img, i) => (
              <div key={i} className="relative w-28 h-28 rounded-xl bg-[#2A2A2A] flex items-center justify-center">
                <span className="text-4xl">{img}</span>
                <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#E8242C] text-white flex items-center justify-center border-none cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-[#E8242C] text-white px-1.5 py-0.5 rounded">Нүүр</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="text-sm font-bold text-[#E0E0E0] mb-2 block">Гарчиг <span className="text-[#E8242C]">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Жишээ: iPhone 15 Pro, бараг шинэ"
            maxLength={100}
            className="w-full h-12 px-4 rounded-xl bg-[#1A1A1A] border border-[#3D3D3D] text-white text-sm outline-none focus:border-[#E8242C] placeholder:text-[#555] transition-all"
          />
          <p className="text-right text-[11px] text-[#555] mt-1">{title.length}/100</p>
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="text-sm font-bold text-[#E0E0E0] mb-3 block">Ангилал <span className="text-[#E8242C]">*</span></label>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORIES.map((c) => {
              const isActive = category === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[rgba(232,36,44,0.15)] border-[#E8242C] text-white'
                      : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#A0A0A0] hover:border-[#3D3D3D]'
                  }`}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-[11px] font-semibold">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <label className="text-sm font-bold text-[#E0E0E0] mb-2 block">Үнэ <span className="text-[#E8242C]">*</span></label>
          <div className="flex">
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              className="flex-1 h-12 px-4 rounded-l-xl bg-[#1A1A1A] border border-r-0 border-[#3D3D3D] text-white text-lg font-bold outline-none focus:border-[#E8242C] placeholder:text-[#555] transition-all"
            />
            <div className="h-12 px-5 bg-[#2A2A2A] border border-l-0 border-[#3D3D3D] rounded-r-xl flex items-center">
              <span className="text-lg font-black text-white">₮</span>
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="mb-6">
          <label className="text-sm font-bold text-[#E0E0E0] mb-3 block">Нөхцөл байдал</label>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.key}
                onClick={() => setCondition(condition === c.key ? '' : c.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all ${
                  condition === c.key
                    ? 'bg-[#E8242C] border-[#E8242C] text-white'
                    : 'bg-[#1A1A1A] border-[#3D3D3D] text-[#A0A0A0] hover:border-[#555]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* District */}
        <div className="mb-6">
          <label className="text-sm font-bold text-[#E0E0E0] mb-3 block">Дүүрэг <span className="text-[#E8242C]">*</span></label>
          <div className="flex flex-wrap gap-2">
            {DISTRICTS.map((d) => (
              <button
                key={d}
                onClick={() => setDistrict(d)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all ${
                  district === d
                    ? 'bg-[#E8242C] border-[#E8242C] text-white'
                    : 'bg-[#1A1A1A] border-[#3D3D3D] text-[#A0A0A0] hover:border-[#555]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="text-sm font-bold text-[#E0E0E0] mb-2 block">Дэлгэрэнгүй тайлбар</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Барааны нөхцөл, онцлог, тоо ширхэг гэх мэт..."
            maxLength={1000}
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#3D3D3D] text-white text-sm outline-none focus:border-[#E8242C] placeholder:text-[#555] transition-all resize-y leading-relaxed"
          />
          <p className="text-right text-[11px] text-[#555] mt-1">{description.length}/1000</p>
        </div>

        {/* Phone */}
        <div className="mb-8">
          <label className="text-sm font-bold text-[#E0E0E0] mb-2 block">Холбоо барих утас</label>
          <div className="flex">
            <div className="h-12 px-4 bg-[#2A2A2A] border border-r-0 border-[#3D3D3D] rounded-l-xl flex items-center">
              <span className="text-sm text-[#A0A0A0]">🇲🇳 +976</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
              placeholder="9911 2233"
              className="flex-1 h-12 px-4 rounded-r-xl bg-[#1A1A1A] border border-l-0 border-[#3D3D3D] text-white text-sm outline-none focus:border-[#E8242C] placeholder:text-[#555] transition-all"
            />
          </div>
        </div>

        {/* VIP Upgrade */}
        <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-[rgba(212,175,55,0.25)] flex items-center gap-4 mb-6 cursor-pointer hover:border-[rgba(212,175,55,0.5)] transition-colors">
          <span className="text-3xl">👑</span>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-[#FFD700]">ВИП зар болгох</p>
            <p className="text-xs text-[#999] mt-1">Зарыг дээд талд байрлуулж, илүү олон хүнд харуулна</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-[#FFD700]">5,000₮</p>
            <p className="text-[10px] text-[#999]">7 хоног</p>
          </div>
        </div>

        {/* Rules */}
        <div className="p-4 rounded-xl bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] flex gap-3 mb-8">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-400 mb-1">Зар оруулах дүрэм</p>
            <p className="text-xs text-[#888] leading-relaxed">• Хуурамч зар оруулахыг хориглоно<br />• Зураг бодит байх шаардлагатай<br />• Админ шалгасны дараа нийтлэгдэнэ</p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="h-12 px-8 rounded-xl bg-[#2A2A2A] text-[#A0A0A0] text-sm font-bold border-none cursor-pointer hover:bg-[#3D3D3D] transition">
            Болих
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`flex-1 h-12 rounded-xl text-white text-sm font-bold border-none cursor-pointer flex items-center justify-center gap-2 transition-all ${
              canSubmit ? 'bg-[#E8242C] hover:bg-[#CC0000]' : 'bg-[#3D3D3D] opacity-50 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Илгээж байна...' : 'Зар оруулах'}
          </button>
        </div>
      </div>
    </div>
  );
}
