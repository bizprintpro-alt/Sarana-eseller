'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay';
import { Check, RefreshCw, Clock, AlertCircle, Smartphone } from 'lucide-react';

interface BankLink {
  name: string;
  description: string;
  logo: string;
  link: string;
}

interface QPaYQRCodeProps {
  invoiceId: string;
  qrText: string;
  qrImage?: string;
  deepLinks: BankLink[];
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentFailed: () => void;
}

type PaymentStatus = 'waiting' | 'checking' | 'success' | 'failed' | 'expired';

const BANK_COLORS: Record<string, string> = {
  'Khan bank': '#00529C',
  'Golomt bank': '#E31937',
  'TDB': '#003D7C',
  'Xac bank': '#00A550',
  'Capitron': '#F7941D',
  'State bank': '#1A3668',
  'Bogd bank': '#8B2332',
};

const TIMEOUT_SECONDS = 300; // 5 minutes
const POLL_INTERVAL = 3000; // 3 seconds
const MAX_POLLS = 100;

export default function QPaYQRCode({
  invoiceId, qrText, qrImage, deepLinks, amount,
  onPaymentSuccess, onPaymentFailed,
}: QPaYQRCodeProps) {
  const [status, setStatus] = useState<PaymentStatus>('waiting');
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [pollCount, setPollCount] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (status !== 'waiting') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setStatus('expired'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  // Poll for payment
  const checkPayment = useCallback(async () => {
    if (status !== 'waiting' || pollCount >= MAX_POLLS) return;
    setPollCount(prev => prev + 1);
    setStatus('checking');

    try {
      const res = await fetch(`/api/checkout/check-payment/${invoiceId}`);
      const data = await res.json();

      if (data.paid) {
        setStatus('success');
        onPaymentSuccess(data.paymentId || invoiceId);
        return;
      }
      setStatus('waiting');
    } catch {
      setStatus('waiting');
    }
  }, [invoiceId, status, pollCount, onPaymentSuccess]);

  // Auto-poll
  useEffect(() => {
    if (status !== 'waiting' && status !== 'checking') return;
    const interval = setInterval(checkPayment, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkPayment, status]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatAmount = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + ' сая₮' : n.toLocaleString() + '₮';

  // ═══ SUCCESS ═══
  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-[rgba(22,163,74,0.1)] flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-[#16A34A]" />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--esl-text-primary)' }}>Төлбөр амжилттай!</h3>
        <p className="text-sm" style={{ color: 'var(--esl-text-muted)' }}>Захиалга баталгаажлаа</p>
      </div>
    );
  }

  // ═══ EXPIRED / FAILED ═══
  if (status === 'expired' || status === 'failed') {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-[rgba(220,38,38,0.1)] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[#DC2626]" />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--esl-text-primary)' }}>
          {status === 'expired' ? 'Хугацаа дууслаа' : 'Төлбөр амжилтгүй'}
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--esl-text-muted)' }}>Дахин оролдоно уу</p>
        <button onClick={onPaymentFailed}
          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#E8242C] text-white border-none cursor-pointer hover:bg-[#C41E25] transition">
          <RefreshCw className="w-4 h-4 inline mr-1.5" /> Дахин оролдох
        </button>
      </div>
    );
  }

  // ═══ WAITING / CHECKING ═══
  return (
    <div className="space-y-5">
      {/* Amount */}
      <div className="text-center">
        <p className="text-xs mb-1" style={{ color: 'var(--esl-text-muted)' }}>Төлөх дүн</p>
        <p className="text-3xl font-black text-[#E8242C]">{formatAmount(amount)}</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-4 rounded-2xl border" style={{ background: '#FFFFFF', borderColor: 'var(--esl-border)' }}>
          {qrImage ? (
            <img loading="lazy" src={`data:image/png;base64,${qrImage}`} alt="QPay QR" className="w-48 h-48" />
          ) : (
            <QRCodeDisplay value={qrText || `qpay:${invoiceId}`} size={192} />
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" style={{ color: timeLeft < 60 ? '#DC2626' : 'var(--esl-text-muted)' }} />
        <span className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-[#DC2626]' : ''}`} style={timeLeft >= 60 ? { color: 'var(--esl-text-secondary)' } : undefined}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>үлдсэн</span>
        {status === 'checking' && <RefreshCw className="w-3 h-3 animate-spin text-[#E8242C]" />}
      </div>

      <p className="text-center text-xs" style={{ color: 'var(--esl-text-muted)' }}>
        <Smartphone className="w-3 h-3 inline mr-1" />
        Банкны апп-аар QR код скан хийнэ үү
      </p>

      {/* Bank Deep Links */}
      {deepLinks.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-center mb-2" style={{ color: 'var(--esl-text-muted)' }}>
            Банкны апп-аар нэвтрэх
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {deepLinks.map(bank => (
              <a key={bank.name} href={bank.link}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border no-underline hover:shadow-md transition-all"
                style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)' }}>
                {bank.logo ? (
                  <img loading="lazy" src={bank.logo} alt={bank.name} className="w-8 h-8 rounded-lg object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: BANK_COLORS[bank.name] || '#666' }}>
                    {bank.name.charAt(0)}
                  </div>
                )}
                <span className="text-[9px] font-medium text-center leading-tight" style={{ color: 'var(--esl-text-secondary)' }}>
                  {bank.description}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
