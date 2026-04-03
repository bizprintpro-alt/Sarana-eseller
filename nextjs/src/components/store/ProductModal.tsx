'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/lib/api';
import { useCartStore } from '@/lib/cart';
import { discountPercent } from '@/lib/utils';
import { useToast } from '@/components/shared/Toast';
import ModalBody from './ModalBody';
import { X } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  isAffiliate?: boolean;
  onShare?: () => void;
}

export default function ProductModal({ product, onClose, isAffiliate, onShare }: ProductModalProps) {
  const [qty, setQty] = useState(1);
  const cart = useCartStore();
  const toast = useToast();

  useEffect(() => { setQty(1); }, [product?._id]);

  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl z-[999] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 30, stiffness: 350 }}>
        {/* Image */}
        <div className="h-64 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center relative shrink-0">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">{product.emoji || '📦'}</span>
          )}
          {product.salePrice && product.salePrice < product.price && (
            <span className="absolute top-4 left-4 bg-[#E31E24] text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
              -{discountPercent(product.price, product.salePrice)}%
            </span>
          )}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm border-none cursor-pointer flex items-center justify-center hover:bg-white transition shadow-sm">
            <X className="w-4 h-4 text-[#475569]" />
          </button>
        </div>

        <ModalBody
          product={product}
          qty={qty}
          setQty={setQty}
          onAddToCart={(modifiers, addOns) => {
            cart.add(product, qty, modifiers, addOns);
            toast.show(`${product.name} сагсанд нэмэгдлээ`, 'ok');
            onClose();
          }}
          isAffiliate={isAffiliate}
          onShare={onShare}
        />
      </motion.div>
    </AnimatePresence>
  );
}
