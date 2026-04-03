'use client';

import { useCartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '../shared/Toast';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQty, remove } = useCartStore();
  const count = useCartStore((s) => s.count());
  const subtotal = useCartStore((s) => s.total());
  const delivery = subtotal >= 50000 ? 0 : 3000;
  const total = subtotal + delivery;
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const goCheckout = () => {
    if (!isLoggedIn) {
      sessionStorage.setItem('sarana_redirect', '/checkout');
      toast.show('Захиалахын тулд нэвтэрнэ үү', 'warn');
      setTimeout(() => router.push('/login'), 900);
      return;
    }
    onClose();
    router.push('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[998] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[999] flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-black">🛒 Сагс {count > 0 && `(${count})`}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#F1F5F9] border-none text-lg cursor-pointer hover:bg-[#E2E8F0] transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl opacity-35 mb-3">🛒</div>
              <p className="text-sm font-semibold text-[#94A3B8]">Сагс хоосон байна</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      item.emoji || '📦'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{item.name}</div>
                    <div className="text-sm font-black text-brand mt-0.5">
                      {formatPrice((item.salePrice || item.price) * item.qty)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        className="w-7 h-7 rounded-lg bg-[#F1F5F9] border-none text-sm cursor-pointer hover:bg-[#E2E8F0]"
                        onClick={() => updateQty(item._id, item.qty - 1)}
                      >
                        −
                      </button>
                      <span className="text-sm font-bold min-w-[20px] text-center">{item.qty}</span>
                      <button
                        className="w-7 h-7 rounded-lg bg-[#F1F5F9] border-none text-sm cursor-pointer hover:bg-[#E2E8F0]"
                        onClick={() => updateQty(item._id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="w-7 h-7 rounded-lg bg-red-50 border-none text-sm cursor-pointer hover:bg-red-100 text-red-500"
                    onClick={() => remove(item._id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] p-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#94A3B8]">Дүн:</span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#94A3B8]">Хүргэлт:</span>
            <span className="font-bold">{delivery === 0 ? '🎉 Үнэгүй' : formatPrice(delivery)}</span>
          </div>
          <div className="flex justify-between text-base font-black pt-2 border-t border-[#E2E8F0]">
            <span>Нийт:</span>
            <span className="text-brand">{formatPrice(total)}</span>
          </div>
          <button
            onClick={goCheckout}
            disabled={count === 0}
            className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-sm border-none cursor-pointer shadow-[0_2px_8px_rgba(204,0,0,.25)] hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            🛒 Захиалга өгөх
          </button>
        </div>
      </div>
    </>
  );
}
