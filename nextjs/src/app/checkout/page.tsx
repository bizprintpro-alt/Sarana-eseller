'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OrdersAPI, PaymentAPI } from '@/lib/api';
import { useCartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import Toast, { useToast } from '@/components/shared/Toast';
import EsellerLogo from '@/components/shared/EsellerLogo';

/* ═══════════ Constants ═══════════ */
const DISTRICTS = [
  'Баянгол',
  'Баянзүрх',
  'Сүхбаатар',
  'Хан-Уул',
  'Чингэлтэй',
  'Сонгинохайрхан',
  'Налайх',
  'Багануур',
  'Багахангай',
];

const FREE_DELIVERY_THRESHOLD = 50000;
const DELIVERY_FEE = 3000;

/* ═══════════ Form State ═══════════ */
interface DeliveryForm {
  name: string;
  phone: string;
  district: string;
  khoroo: string;
  address: string;
  note: string;
}

const initialForm: DeliveryForm = {
  name: '',
  phone: '',
  district: '',
  khoroo: '',
  address: '',
  note: '',
};

/* ═══════════ Validation ═══════════ */
function validate(form: DeliveryForm): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = 'Нэрээ оруулна уу';
  if (!form.phone.trim()) errors.phone = 'Утасны дугаараа оруулна уу';
  else if (!/^\d{8}$/.test(form.phone.trim()))
    errors.phone = 'Утасны дугаар 8 оронтой байх ёстой';
  if (!form.district) errors.district = 'Дүүргээ сонгоно уу';
  if (!form.khoroo.trim()) errors.khoroo = 'Хороогоо оруулна уу';
  if (!form.address.trim()) errors.address = 'Хаягаа оруулна уу';
  return errors;
}

/* ═══════════ Page Component ═══════════ */
export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const cart = useCartStore();
  const toast = useToast();

  const [form, setForm] = useState<DeliveryForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'qpay' | 'card'>('qpay');
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load cart on mount
  useEffect(() => {
    cart.load();
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auth guard
  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.replace('/login');
    }
  }, [mounted, isLoggedIn, router]);

  // Pre-fill name from user
  useEffect(() => {
    if (user?.name && !form.name) {
      setForm((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Derived values ── */
  const items = cart.items;
  const subtotal = cart.total();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  /* ── Field change helper ── */
  function updateField(field: keyof DeliveryForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  /* ── Submit ── */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.show('Мэдээллээ бүрэн бөглөнө үү', 'warn');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.salePrice || item.price,
          quantity: item.qty,
        })),
        total,
        delivery: {
          phone: form.phone.trim(),
          address: {
            district: form.district,
            street: form.khoroo.trim(),
            building: form.address.trim(),
          },
          note: form.note.trim() || undefined,
        },
      };

      const order = await OrdersAPI.create(orderData);

      // Create QPay invoice
      try {
        await PaymentAPI.createQPay({
          orderId: order._id,
          amount: total,
          description: `eseller.mn захиалга #${order.orderNumber || order._id}`,
        });
      } catch {
        // QPay invoice creation failure is non-blocking
      }

      cart.clear();
      setOrderNumber(order.orderNumber || order._id);
      toast.show('Захиалга амжилттай үүслээ!', 'ok');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Захиалга үүсгэхэд алдаа гарлаа';
      toast.show(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Loading / Auth guard ── */
  if (!mounted || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="animate-spin h-8 w-8 border-4 rounded-full" style={{ borderColor: '#CC0000', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  /* ── Success State ── */
  if (orderNumber) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center max-w-md w-full shadow-sm">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#059669' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Захиалга амжилттай!</h2>
            <p className="text-gray-500 mb-1">Таны захиалгын дугаар:</p>
            <p className="text-lg font-mono font-bold mb-6" style={{ color: '#CC0000' }}>
              #{orderNumber}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Бид таны захиалгыг хүлээн авлаа. QPay-р төлбөрөө төлсний дараа захиалга баталгаажна.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/store"
                className="inline-block w-full py-3 rounded-xl font-semibold text-white text-center transition-colors"
                style={{ background: '#CC0000' }}
              >
                Дэлгүүр рүү буцах
              </Link>
              <Link
                href="/dashboard"
                className="inline-block w-full py-3 rounded-xl font-semibold border border-gray-200 text-gray-700 text-center hover:bg-gray-50 transition-colors"
              >
                Захиалгуудаа харах
              </Link>
            </div>
          </div>
        </div>
        <Toast />
      </div>
    );
  }

  /* ── Empty Cart ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center max-w-md w-full shadow-sm">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Сагс хоосон байна</h2>
            <p className="text-gray-500 mb-6">
              Захиалга хийхийн тулд эхлээд бараа сонгоно уу.
            </p>
            <Link
              href="/store"
              className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition-colors"
              style={{ background: '#CC0000' }}
            >
              Дэлгүүр рүү очих
            </Link>
          </div>
        </div>
        <Toast />
      </div>
    );
  }

  /* ── Main Checkout ── */
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Захиалга баталгаажуулах</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ═══ LEFT: Form ═══ */}
          <div className="lg:col-span-3 space-y-6">
            {/* Delivery Info */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ background: '#CC0000' }}>1</span>
                Хүргэлтийн мэдээлэл
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Нэр" error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Жишээ: Бат"
                    className={inputClass(errors.name)}
                  />
                </Field>

                <Field label="Утас" error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="8 оронтой дугаар"
                    className={inputClass(errors.phone)}
                  />
                </Field>

                <Field label="Дүүрэг" error={errors.district}>
                  <select
                    value={form.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    className={inputClass(errors.district)}
                  >
                    <option value="">Сонгох...</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Хороо" error={errors.khoroo}>
                  <input
                    type="text"
                    value={form.khoroo}
                    onChange={(e) => updateField('khoroo', e.target.value)}
                    placeholder="Жишээ: 3-р хороо"
                    className={inputClass(errors.khoroo)}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Байр / Гудамж" error={errors.address}>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Байр, орц, тоот эсвэл гудамжны нэр"
                      className={inputClass(errors.address)}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Нэмэлт тайлбар">
                    <textarea
                      value={form.note}
                      onChange={(e) => updateField('note', e.target.value)}
                      placeholder="Жолоочид нэмэлт заавар (заавал биш)"
                      rows={2}
                      className={inputClass()}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ background: '#CC0000' }}>2</span>
                Төлбөрийн арга
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === 'qpay'
                      ? 'border-[#CC0000] bg-red-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'qpay'}
                    onChange={() => setPaymentMethod('qpay')}
                    className="accent-[#CC0000]"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">QPay</span>
                    <p className="text-sm text-gray-500">Банкны аппликэйшнээр төлөх</p>
                  </div>
                  <span className="text-2xl">📱</span>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 opacity-50 cursor-not-allowed">
                  <input type="radio" name="payment" disabled className="accent-[#CC0000]" />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-400">Банкны карт</span>
                    <p className="text-sm text-gray-400">Тун удахгүй нэмэгдэнэ</p>
                  </div>
                  <span className="text-2xl opacity-50">💳</span>
                </label>
              </div>
            </section>
          </div>

          {/* ═══ RIGHT: Order Summary ═══ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Захиалгын мэдээлэл</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span>{item.emoji || '📦'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.qty} x {formatPrice(item.salePrice || item.price)}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatPrice((item.salePrice || item.price) * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Дүн</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Хүргэлт</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">Үнэгүй</span>
                  ) : (
                    <span>{formatPrice(deliveryFee)}</span>
                  )}
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-gray-400">
                    {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} нэмбэл хүргэлт үнэгүй
                  </p>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Нийт</span>
                  <span style={{ color: '#CC0000' }}>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 py-3.5 rounded-xl font-bold text-white text-center transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: submitting ? '#999' : '#CC0000' }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Уншиж байна...
                  </span>
                ) : (
                  `Захиалга баталгаажуулах — ${formatPrice(total)}`
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Захиалга баталгаажуулснаар та үйлчилгээний нөхцлийг зөвшөөрч байна.
              </p>
            </div>
          </div>
        </form>
      </main>

      <Toast />
    </div>
  );
}

/* ═══════════ Sub-components ═══════════ */

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/store" className="flex items-center gap-2">
          <EsellerLogo size={24} />
          <span className="font-bold text-gray-900 text-sm">eseller.mn</span>
        </Link>
        <Link
          href="/store"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Буцах
        </Link>
      </div>
    </header>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: '#CC0000' }}>{error}</p>}
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${
    error
      ? 'border-red-400 bg-red-50/30 focus:border-red-500'
      : 'border-gray-200 bg-white focus:border-[#CC0000]'
  }`;
}
