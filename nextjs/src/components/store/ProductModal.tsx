'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/lib/api';
import { useCartStore } from '@/lib/cart';
import { formatPrice, discountPercent, cn } from '@/lib/utils';
import { useToast } from '@/components/shared/Toast';
import {
  X, ShoppingCart, Minus, Plus, Share2, Heart, Star,
  Truck, Shield, RotateCcw, Clock, ChevronLeft, ChevronRight,
  Package, Check, Play, ZoomIn, Info, ThumbsUp, MessageSquare,
  Tag, Layers, Ruler, Weight, Palette, Box,
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  isAffiliate?: boolean;
  onShare?: () => void;
}

/* ═══ Specs generation based on category ═══ */
function getProductSpecs(product: Product): { icon: typeof Box; label: string; value: string }[] {
  const cat = product.category;
  if (cat === 'Электроник' || cat === 'electronics') return [
    { icon: Box, label: 'Брэнд', value: product.name.split(' ')[0] },
    { icon: Shield, label: 'Баталгаа', value: '12 сар' },
    { icon: Package, label: 'Бүрдэл', value: 'Бүрэн комплект' },
    { icon: Layers, label: 'Нөхцөл', value: 'Шинэ' },
  ];
  if (cat === 'Хувцас' || cat === 'fashion') return [
    { icon: Palette, label: 'Материал', value: '100% хөвөн' },
    { icon: Ruler, label: 'Хэмжээ', value: 'XS - XXL' },
    { icon: Tag, label: 'Улирал', value: '4 улирал' },
    { icon: Layers, label: 'Хийц', value: 'Premium' },
  ];
  if (cat === 'Гоо сайхан' || cat === 'beauty') return [
    { icon: Shield, label: 'Гарал', value: 'Солонгос' },
    { icon: Clock, label: 'Хүчинтэй', value: '24 сар' },
    { icon: Layers, label: 'Төрөл', value: 'Органик' },
    { icon: Package, label: 'Хэмжээ', value: '50мл' },
  ];
  if (cat === 'Гэр ахуй' || cat === 'home') return [
    { icon: Ruler, label: 'Хэмжээ', value: 'Стандарт' },
    { icon: Weight, label: 'Жин', value: '2.5кг' },
    { icon: Palette, label: 'Өнгө', value: 'Олон сонголт' },
    { icon: Shield, label: 'Баталгаа', value: '6 сар' },
  ];
  return [
    { icon: Package, label: 'Нөхцөл', value: 'Шинэ' },
    { icon: Shield, label: 'Баталгаа', value: 'Тийм' },
    { icon: Truck, label: 'Хүргэлт', value: 'Боломжтой' },
  ];
}

/* ═══ Demo reviews ═══ */
const DEMO_REVIEWS = [
  { name: 'Б. Мөнхзул', rating: 5, text: 'Маш сайн чанартай бараа. Хүргэлт хурдан байсан.', date: '2 өдрийн өмнө' },
  { name: 'О. Тэмүүлэн', rating: 4, text: 'Зурагтай адилхан харагдаж байна. Үнэ цэнэдээ таарсан.', date: '5 өдрийн өмнө' },
  { name: 'Г. Сарантуяа', rating: 5, text: 'Гайхалтай! Найзууддаа санал болгож байна.', date: '1 долоо хоногийн өмнө' },
];

export default function ProductModal({ product, onClose, isAffiliate, onShare }: ProductModalProps) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isWished, setIsWished] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'reviews'>('info');
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);
  const cart = useCartStore();
  const toast = useToast();

  useEffect(() => {
    setQty(1); setActiveImg(0); setSelectedSize(''); setSelectedColor('');
    setAdded(false); setActiveTab('info');
  }, [product?._id]);

  useEffect(() => {
    if (product) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  if (!product) return null;

  const images = product.images?.length ? product.images : [];
  const px = product.salePrice || product.price;
  const disc = discountPercent(product.price, product.salePrice);
  const specs = getProductSpecs(product);

  const sizes = product.category === 'Хувцас' ? ['XS', 'S', 'M', 'L', 'XL'] : product.category === 'Спорт' ? ['S', 'M', 'L'] : [];
  const colors = product.category === 'Хувцас' ? [
    { name: 'Хар', hex: '#1a1a1a' }, { name: 'Цагаан', hex: '#f5f5f5' }, { name: 'Улаан', hex: '#dc2626' },
  ] : product.category === 'Гоо сайхан' ? [
    { name: 'Ягаан', hex: '#ec4899' }, { name: 'Цагаан', hex: '#fafafa' },
  ] : [];

  const handleAdd = () => {
    if (sizes.length > 0 && !selectedSize) { toast.show('Хэмжээ сонгоно уу', 'error'); return; }
    cart.add(product, qty, [], []);
    setAdded(true);
    toast.show(`${product.name} сагсанд нэмэгдлээ`, 'ok');
    setTimeout(() => onClose(), 800);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

      {/* Modal */}
      <motion.div
        className="fixed inset-2 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl bg-white rounded-2xl z-[999] overflow-hidden flex flex-col md:flex-row max-h-[94vh] shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 30, stiffness: 350 }}>

        {/* ═══ LEFT: Image Gallery ═══ */}
        <div className="md:w-[55%] bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] relative shrink-0 flex flex-col">
          {/* Main image */}
          <div className="relative flex-1 min-h-[280px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImg] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300 cursor-zoom-in"
                onClick={() => setZoomedImg(images[activeImg])}
              />
            ) : (
              <span className="text-8xl">{product.emoji || '📦'}</span>
            )}

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImg(prev => (prev - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border-none cursor-pointer flex items-center justify-center hover:bg-white transition shadow-lg">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => setActiveImg(prev => (prev + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border-none cursor-pointer flex items-center justify-center hover:bg-white transition shadow-lg">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {disc > 0 && (
                <span className="bg-[#E24B4A] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                  -{disc}% хямдрал
                </span>
              )}
              {product.stock != null && product.stock <= 5 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  Үлдсэн {product.stock}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button onClick={() => setIsWished(!isWished)}
                className="w-10 h-10 rounded-full bg-white/90 border-none cursor-pointer flex items-center justify-center hover:bg-white transition shadow-lg">
                <Heart className="w-4 h-4" fill={isWished ? '#E24B4A' : 'none'} color={isWished ? '#E24B4A' : '#666'} />
              </button>
              {images.length > 0 && (
                <button onClick={() => setZoomedImg(images[activeImg])}
                  className="w-10 h-10 rounded-full bg-white/90 border-none cursor-pointer flex items-center justify-center hover:bg-white transition shadow-lg">
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                {activeImg + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 bg-white/80 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={cn('w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all shrink-0',
                    i === activeImg ? 'border-[#E24B4A] shadow-md scale-105' : 'border-gray-200 opacity-60 hover:opacity-100')}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ RIGHT: Product Details ═══ */}
        <div className="md:w-[45%] flex flex-col">
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-3 right-3 md:relative md:top-0 md:right-0 md:self-end md:m-3 w-8 h-8 rounded-full bg-gray-100 border-none cursor-pointer flex items-center justify-center hover:bg-gray-200 transition z-10">
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {/* Store */}
            {product.store?.name && (
              <div className="text-xs text-gray-400 font-medium mb-1">{product.store.name}</div>
            )}

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h2>

            {/* Rating */}
            {product.rating != null && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('w-4 h-4', i < Math.round(product.rating!) ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{product.rating} ({product.reviewCount || 0} үнэлгээ)</span>
                <span className="text-xs text-blue-500 font-medium cursor-pointer" onClick={() => setActiveTab('reviews')}>Үнэлгээ харах</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-black text-[#E24B4A]">{formatPrice(px)}</span>
              {disc > 0 && (
                <>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="text-xs font-bold text-[#E24B4A] bg-red-50 px-2 py-0.5 rounded">-{disc}%</span>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
              {[
                { key: 'info' as const, label: 'Мэдээлэл' },
                { key: 'specs' as const, label: 'Үзүүлэлт' },
                { key: 'reviews' as const, label: `Үнэлгээ (${product.reviewCount || DEMO_REVIEWS.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn('flex-1 py-2 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all',
                    activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700')}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Info */}
            {activeTab === 'info' && (
              <>
                {product.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Colors */}
                {colors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Өнгө {selectedColor && <span className="font-normal text-gray-400">— {selectedColor}</span>}
                    </h4>
                    <div className="flex gap-2">
                      {colors.map(c => (
                        <button key={c.hex} onClick={() => setSelectedColor(c.name)}
                          className="w-9 h-9 rounded-full cursor-pointer transition-all"
                          style={{
                            background: c.hex,
                            border: selectedColor === c.name ? '3px solid #E24B4A' : '2px solid #e5e7eb',
                            outline: selectedColor === c.name ? '2px solid white' : 'none',
                            outlineOffset: '-4px',
                          }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {sizes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">Хэмжээ <span className="text-[10px] text-[#E24B4A]">• Заавал</span></h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map(s => (
                        <button key={s} onClick={() => setSelectedSize(s)}
                          className={cn('min-w-[42px] h-10 px-3 rounded-lg text-sm font-medium border cursor-pointer transition-all',
                            selectedSize === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900')}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trust badges */}
                <div className="bg-gray-50 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs text-gray-600">
                    <Truck className="w-4 h-4 text-green-500 shrink-0" />
                    <span><strong>Үнэгүй хүргэлт</strong> · 50,000₮-с дээш захиалгад</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-600">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <span><strong>2-4 цагийн</strong> дотор хүргэнэ</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-600">
                    <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><strong>14 хоног</strong> дотор буцаалт боломжтой</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-600">
                    <Shield className="w-4 h-4 text-purple-500 shrink-0" />
                    <span><strong>Баталгаат бараа</strong> · QPay аюулгүй төлбөр</span>
                  </div>
                </div>
              </>
            )}

            {/* Tab: Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-0.5">
                {specs.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className={cn('flex items-center gap-3 py-3 px-3 rounded-lg', i % 2 === 0 ? 'bg-gray-50' : 'bg-white')}>
                      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-500 flex-1">{s.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{s.value}</span>
                    </div>
                  );
                })}
                {product.description && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Rating summary */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-900">{product.rating || 4.7}</p>
                    <div className="flex gap-0.5 justify-center my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('w-3.5 h-3.5', i < Math.round(product.rating || 4.7) ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400">{product.reviewCount || DEMO_REVIEWS.length} үнэлгээ</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map(n => {
                      const count = DEMO_REVIEWS.filter(r => r.rating === n).length;
                      const pct = (count / DEMO_REVIEWS.length) * 100;
                      return (
                        <div key={n} className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 w-3">{n}</span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review list */}
                {DEMO_REVIEWS.map((r, i) => (
                  <div key={i} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{r.name}</span>
                      <span className="text-[10px] text-gray-400">{r.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-1.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={cn('w-3 h-3', j < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══ Footer: Qty + Add to Cart ═══ */}
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-600">Тоо:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 bg-gray-50 border-none cursor-pointer hover:bg-gray-100 transition flex items-center justify-center">
                    <Minus className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-sm font-bold border-x border-gray-200">{qty}</span>
                  <button onClick={() => setQty(qty + 1)}
                    className="w-9 h-9 bg-gray-50 border-none cursor-pointer hover:bg-gray-100 transition flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              </div>
              <span className="text-lg font-black text-gray-900">{formatPrice(px * qty)}</span>
            </div>

            <button onClick={handleAdd} disabled={added}
              className={cn('w-full py-3.5 rounded-xl font-bold text-sm border-none cursor-pointer transition-all flex items-center justify-center gap-2',
                added ? 'bg-green-500 text-white' : 'bg-[#E24B4A] text-white shadow-[0_4px_16px_rgba(226,75,74,.3)] hover:bg-[#c73a39] hover:shadow-[0_6px_20px_rgba(226,75,74,.4)]')}>
              {added ? <><Check className="w-4 h-4" /> Нэмэгдлээ!</> : <><ShoppingCart className="w-4 h-4" /> Сагсанд нэмэх — {formatPrice(px * qty)}</>}
            </button>

            {isAffiliate && onShare && (
              <button onClick={onShare}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold text-sm border-none cursor-pointer hover:bg-gray-200 transition flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" /> Хуваалцах линк хуулах
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ═══ Fullscreen Zoom ═══ */}
      {zoomedImg && (
        <motion.div
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center cursor-zoom-out"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setZoomedImg(null)}
        >
          <img src={zoomedImg} alt="" className="max-w-[95vw] max-h-[95vh] object-contain" />
          <button onClick={() => setZoomedImg(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border-none cursor-pointer flex items-center justify-center text-white hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
