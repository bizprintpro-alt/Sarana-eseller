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
  Package, Check,
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  isAffiliate?: boolean;
  onShare?: () => void;
}

export default function ProductModal({ product, onClose, isAffiliate, onShare }: ProductModalProps) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isWished, setIsWished] = useState(false);
  const [added, setAdded] = useState(false);
  const cart = useCartStore();
  const toast = useToast();

  useEffect(() => { setQty(1); setActiveImg(0); setSelectedSize(''); setSelectedColor(''); setAdded(false); }, [product?._id]);

  if (!product) return null;

  const images = product.images?.length ? product.images : [];
  const px = product.salePrice || product.price;
  const disc = discountPercent(product.price, product.salePrice);

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
      <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed inset-2 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-white rounded-2xl z-[999] overflow-hidden flex flex-col md:flex-row max-h-[92vh] shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 30, stiffness: 350 }}>

        {/* ═══ LEFT: Image Gallery ═══ */}
        <div className="md:w-1/2 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] relative shrink-0">
          <div className="relative h-72 md:h-full min-h-[300px] flex items-center justify-center overflow-hidden">
            {images.length > 0 ? (
              <img src={images[activeImg] || images[0]} alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300" />
            ) : (
              <span className="text-8xl">{product.emoji || '📦'}</span>
            )}

            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImg(prev => (prev - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border-none cursor-pointer flex items-center justify-center hover:bg-white transition shadow">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => setActiveImg(prev => (prev + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border-none cursor-pointer flex items-center justify-center hover:bg-white transition shadow">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </>
            )}

            {disc > 0 && (
              <span className="absolute top-4 left-4 bg-[#E24B4A] text-white text-xs font-bold px-3 py-1 rounded-lg shadow">
                -{disc}%
              </span>
            )}

            <button onClick={() => setIsWished(!isWished)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 border-none cursor-pointer flex items-center justify-center hover:bg-white transition shadow">
              <Heart className="w-4 h-4" fill={isWished ? '#E24B4A' : 'none'} color={isWished ? '#E24B4A' : '#666'} />
            </button>
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={cn('w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all',
                    i === activeImg ? 'border-[#E24B4A] shadow-md' : 'border-white/60 opacity-70 hover:opacity-100')}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ RIGHT: Product Details ═══ */}
        <div className="md:w-1/2 flex flex-col">
          <button onClick={onClose}
            className="absolute top-3 right-3 md:relative md:top-0 md:right-0 md:self-end md:m-4 w-8 h-8 rounded-full bg-gray-100 border-none cursor-pointer flex items-center justify-center hover:bg-gray-200 transition z-10">
            <X className="w-4 h-4 text-gray-500" />
          </button>

          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {product.store?.name && (
              <div className="text-xs text-gray-400 font-medium mb-1">{product.store.name}</div>
            )}

            <h2 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h2>

            {product.rating != null && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('w-4 h-4', i < Math.round(product.rating!) ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{product.rating} ({product.reviewCount || 0} үнэлгээ)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-black text-[#E24B4A]">{formatPrice(px)}</span>
              {disc > 0 && (
                <>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="text-xs font-bold text-[#E24B4A] bg-red-50 px-2 py-0.5 rounded">-{disc}% хэмнэлт</span>
                </>
              )}
            </div>

            {product.description && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Тайлбар</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Өнгө {selectedColor && <span className="font-normal text-gray-400">— {selectedColor}</span>}
                </h4>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button key={c.hex} onClick={() => setSelectedColor(c.name)}
                      className="w-8 h-8 rounded-full cursor-pointer transition-all"
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

            {sizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">Хэмжээ <span className="text-[10px] text-[#E24B4A]">• Заавал</span></h4>
                  <button className="text-[10px] text-blue-500 cursor-pointer bg-transparent border-none underline">Хэмжээний хүснэгт</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={cn('min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium border cursor-pointer transition-all',
                        selectedSize === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck className="w-4 h-4 text-green-500 shrink-0" />
                <span>Үнэгүй хүргэлт · 50,000₮-с дээш захиалгад</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                <span>2-4 цагийн дотор хүргэнэ</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
                <span>14 хоногийн дотор буцаалт боломжтой</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Баталгаат бараа · QPay аюулгүй төлбөр</span>
              </div>
            </div>

            {product.stock != null && product.stock <= 10 && (
              <div className={cn('text-xs font-medium mb-3', product.stock <= 3 ? 'text-[#E24B4A]' : 'text-amber-600')}>
                <Package className="w-3 h-3 inline mr-1" />
                Үлдсэн: {product.stock} ширхэг {product.stock <= 3 && '— Яаралтай!'}
              </div>
            )}

            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-gray-600">Тоо:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 bg-gray-50 border-none cursor-pointer hover:bg-gray-100 transition flex items-center justify-center">
                  <Minus className="w-4 h-4 text-gray-500" />
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm font-bold border-x border-gray-200">{qty}</span>
                <button onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 bg-gray-50 border-none cursor-pointer hover:bg-gray-100 transition flex items-center justify-center">
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-2">
            <button onClick={handleAdd} disabled={added}
              className={cn('w-full py-3.5 rounded-xl font-bold text-sm border-none cursor-pointer transition-all flex items-center justify-center gap-2',
                added ? 'bg-green-500 text-white' : 'bg-[#E24B4A] text-white shadow-[0_4px_12px_rgba(226,75,74,.25)] hover:bg-[#c73a39]')}>
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
    </AnimatePresence>
  );
}
