'use client';

import { useState } from 'react';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { useToast } from '@/components/shared/Toast';
import type { Product } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: Product;
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export default function AddToCartButton({ product, label = 'Сагслах', className, variant = 'primary' }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCartStore(s => s.add);
  const toast = useToast();

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    toast.show(`${product.name} сагсанд нэмэгдлээ`, 'ok');
    setTimeout(() => setAdded(false), 2000);
  };

  const outOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Qty selector */}
      <div className="flex items-center gap-0 border border-[var(--esl-border)] rounded-xl overflow-hidden">
        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-[var(--esl-bg-muted)] transition-colors">
          <Minus size={16} />
        </button>
        <span className="w-10 text-center text-sm font-semibold">{qty}</span>
        <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-[var(--esl-bg-muted)] transition-colors">
          <Plus size={16} />
        </button>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        disabled={outOfStock || added}
        className={cn(
          'flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
          variant === 'primary'
            ? 'bg-[#E8242C] text-white hover:bg-[#C41E25] disabled:opacity-50'
            : 'bg-[var(--esl-bg-card)] border border-[var(--esl-border)] hover:bg-[var(--esl-bg-muted)]'
        )}
      >
        {added ? <><Check size={18} /> Нэмэгдлээ</> : outOfStock ? 'Дууссан' : <><ShoppingCart size={18} /> {label}</>}
      </button>
    </div>
  );
}
