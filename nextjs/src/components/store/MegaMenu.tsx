'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Shirt, Smartphone, UtensilsCrossed, Sparkles, Home,
  Dumbbell, Package, Scissors, Wrench, Printer, Factory,
  GraduationCap, Camera, Heart, Baby, Car, Palette,
  ChevronRight, ArrowRight, Star, TrendingUp, Zap,
} from 'lucide-react';

interface MegaMenuProps {
  open: boolean;
  onClose: () => void;
  onSelectCategory: (cat: string) => void;
  onSelectType: (type: 'all' | 'product' | 'service') => void;
}

const PRODUCT_CATEGORIES = [
  { key: 'fashion', icon: Shirt, label: 'Хувцас & Гутал', emoji: '👗', count: 1240 },
  { key: 'electronics', icon: Smartphone, label: 'Электроник', emoji: '📱', count: 890 },
  { key: 'food', icon: UtensilsCrossed, label: 'Хоол хүнс', emoji: '🍔', count: 2100 },
  { key: 'beauty', icon: Sparkles, label: 'Гоо сайхан', emoji: '💄', count: 650 },
  { key: 'home', icon: Home, label: 'Гэр ахуй', emoji: '🏡', count: 430 },
  { key: 'sports', icon: Dumbbell, label: 'Спорт & Фитнесс', emoji: '⚽', count: 320 },
  { key: 'baby', icon: Baby, label: 'Хүүхэд & Нялхас', emoji: '👶', count: 280 },
  { key: 'auto', icon: Car, label: 'Авто сэлбэг', emoji: '🚗', count: 190 },
];

const SERVICE_CATEGORIES = [
  { key: 'salon', icon: Scissors, label: 'Үсчин & Салон', emoji: '💇', count: 85 },
  { key: 'beauty_service', icon: Heart, label: 'Гоо сайхны үйлчилгээ', emoji: '💅', count: 62 },
  { key: 'repair', icon: Wrench, label: 'Засвар үйлчилгээ', emoji: '🔧', count: 45 },
  { key: 'printing', icon: Printer, label: 'Хэвлэх үйлчилгээ', emoji: '🖨️', count: 28 },
  { key: 'factory', icon: Factory, label: 'Үйлдвэр & Захиалгат', emoji: '🏭', count: 15 },
  { key: 'tutoring', icon: GraduationCap, label: 'Сургалт & Хичээл', emoji: '📚', count: 34 },
  { key: 'photo', icon: Camera, label: 'Зураг авалт', emoji: '📷', count: 22 },
  { key: 'design', icon: Palette, label: 'Дизайн & Бүтээл', emoji: '🎨', count: 18 },
];

const FEATURED_SHOPS = [
  { name: 'FashionMN', emoji: '👗', slug: 'fashionmn', type: 'product' },
  { name: 'TechUB', emoji: '📱', slug: 'techub', type: 'product' },
  { name: 'Sarana Salon', emoji: '💇', slug: 'demo-salon', type: 'service' },
  { name: 'BeautyMN', emoji: '💄', slug: 'beautymn', type: 'product' },
];

export default function MegaMenu({ open, onClose, onSelectCategory, onSelectType }: MegaMenuProps) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const handleCategory = (key: string) => {
    onSelectCategory(key);
    onClose();
  };

  const handleType = (type: 'all' | 'product' | 'service') => {
    onSelectType(type);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Menu panel */}
          <motion.div
            className="absolute top-full left-0 right-0 z-50 bg-white shadow-[0_20px_60px_rgba(0,0,0,.12)] border-t border-gray-100"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-[1320px] mx-auto px-4 py-6">
              <div className="grid grid-cols-12 gap-6">

                {/* ═══ БАРАА АНГИЛАЛ — Left column ═══ */}
                <div className="col-span-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-[#E31E24]" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Бараа бүтээгдэхүүн</h3>
                  </div>
                  <div className="space-y-0.5">
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => handleCategory(cat.key)}
                        onMouseEnter={() => setHoveredCat(cat.key)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border-none cursor-pointer transition-all group',
                          hoveredCat === cat.key ? 'bg-red-50' : 'bg-transparent hover:bg-gray-50'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors',
                          hoveredCat === cat.key ? 'bg-[#E31E24] text-white' : 'bg-gray-100'
                        )}>
                          {hoveredCat === cat.key ? <cat.icon className="w-4 h-4" /> : cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-[#E31E24] transition-colors">{cat.label}</div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">{cat.count}+</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#E31E24] transition-colors" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleType('product')}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#E31E24] bg-red-50 hover:bg-red-100 border-none cursor-pointer transition"
                  >
                    Бүх бараа харах <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* ═══ ҮЙЛЧИЛГЭЭ АНГИЛАЛ — Middle column ═══ */}
                <div className="col-span-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Scissors className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Үйлчилгээ</h3>
                  </div>
                  <div className="space-y-0.5">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => handleCategory(cat.key)}
                        onMouseEnter={() => setHoveredCat(cat.key)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border-none cursor-pointer transition-all group',
                          hoveredCat === cat.key ? 'bg-indigo-50' : 'bg-transparent hover:bg-gray-50'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors',
                          hoveredCat === cat.key ? 'bg-indigo-600 text-white' : 'bg-gray-100'
                        )}>
                          {hoveredCat === cat.key ? <cat.icon className="w-4 h-4" /> : cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{cat.label}</div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">{cat.count}+</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleType('service')}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-none cursor-pointer transition"
                  >
                    Бүх үйлчилгээ харах <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* ═══ RIGHT COLUMN — Featured + Promo ═══ */}
                <div className="col-span-4 space-y-5">
                  {/* Promo banner */}
                  <div className="bg-gradient-to-br from-[#E31E24] to-[#8B0000] rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-white/10" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Zap className="w-4 h-4 text-yellow-300" />
                        <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider">Онцлох</span>
                      </div>
                      <h4 className="text-base font-black mb-1">Шинэ хямдрал!</h4>
                      <p className="text-xs text-white/70 mb-3">50% хүртэл хямдрал бүх ангилалд</p>
                      <button
                        onClick={() => { onSelectCategory('all'); onClose(); }}
                        className="bg-white text-[#E31E24] text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-white/90 transition"
                      >
                        Үзэх →
                      </button>
                    </div>
                  </div>

                  {/* Featured shops */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Онцлох дэлгүүрүүд</h3>
                    </div>
                    <div className="space-y-2">
                      {FEATURED_SHOPS.map((shop) => (
                        <Link
                          key={shop.slug}
                          href={shop.type === 'service' ? `/s/${shop.slug}` : `/u/${shop.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition no-underline group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                            {shop.emoji}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{shop.name}</div>
                            <div className="text-[10px] text-gray-400">{shop.type === 'service' ? 'Үйлчилгээ' : 'Дэлгүүр'}</div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* All shops link */}
                  <Link href="/shops" onClick={onClose}
                    className="flex items-center justify-between bg-[#1A1A2E] rounded-xl p-3 no-underline hover:bg-[#2D2B55] transition-colors group">
                    <div>
                      <div className="text-xs font-bold text-white">Бүх дэлгүүр & үйлчилгээ</div>
                      <div className="text-[10px] text-white/50">Нийт жагсаалт харах</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
