'use client';

import { useState } from 'react';
import { Building2, ArrowRight, Loader2, CheckCircle, History } from 'lucide-react';

const BANKS = [
  { id: 'KHAN', name: 'Хаан банк', rate: 1.5, color: '#00529B' },
  { id: 'GOLOMT', name: 'Голомт банк', rate: 1.2, color: '#E30613' },
  { id: 'TDB', name: 'ТДБ банк', rate: 1.0, color: '#004B87' },
  { id: 'HAS', name: 'ХАС банк', rate: 1.0, color: '#8DC63F' },
];

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function BankLoyaltyPage() {
  const [bank, setBank] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [bankPoints, setBankPoints] = useState<number | null>(null);
  const [convertAmount, setConvertAmount] = useState('');
  const [checking, setChecking] = useState(false);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const selectedBank = BANKS.find((b) => b.id === bank);

  const checkBalance = async () => {
    if (!bank || !cardNumber) return;
    setChecking(true);
    setBankPoints(null);
    try {
      const res = await fetch('/api/bank/loyalty/balance', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ bank, cardNumber }),
      });
      const data = await res.json();
      setBankPoints(data.data?.points || 0);
    } catch {}
    setChecking(false);
  };

  const convert = async () => {
    const pts = parseInt(convertAmount);
    if (!pts || pts <= 0 || !bank || !cardNumber) return;
    setConverting(true);
    setResult(null);
    try {
      const res = await fetch('/api/bank/loyalty/convert', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ bank, cardNumber, points: pts }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.data?.message || 'Амжилттай!');
        setBankPoints((prev) => (prev !== null ? prev - pts : null));
        setConvertAmount('');
      }
    } catch {}
    setConverting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-7 h-7 text-blue-900" />
          <div>
            <h1 className="text-2xl font-bold">Банкны оноо хөрвүүлэх</h1>
            <p className="text-sm text-gray-500">Банкны оноогоо eseller оноо болго</p>
          </div>
        </div>

        {/* Bank selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {BANKS.map((b) => (
            <button
              key={b.id}
              onClick={() => { setBank(b.id); setBankPoints(null); setResult(null); }}
              className={`p-4 rounded-xl border-2 transition text-left ${
                bank === b.id ? 'border-blue-900 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-sm">{b.name}</div>
              <div className="text-xs text-gray-400 mt-1">1 оноо = {b.rate} eseller</div>
            </button>
          ))}
        </div>

        {bank && (
          <div className="bg-white rounded-xl border p-6 mb-4">
            <label className="block text-sm font-medium mb-2">Картын дугаар</label>
            <div className="flex gap-2">
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="XXXX XXXX XXXX XXXX"
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={checkBalance}
                disabled={checking || cardNumber.length < 8}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Шалгах
              </button>
            </div>
          </div>
        )}

        {bankPoints !== null && selectedBank && (
          <div className="bg-white rounded-xl border p-6 mb-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">{selectedBank.name} оноо</p>
              <p className="text-3xl font-bold" style={{ color: selectedBank.color }}>
                {bankPoints.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center flex-1">
                <input
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  className="w-full text-center text-2xl font-bold border-none bg-transparent outline-none"
                />
                <p className="text-xs text-gray-400">{selectedBank.name} оноо</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-green-600">
                  {Math.floor((parseInt(convertAmount) || 0) * selectedBank.rate).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">eseller оноо</p>
              </div>
            </div>

            <button
              onClick={convert}
              disabled={converting || !convertAmount || parseInt(convertAmount) <= 0 || parseInt(convertAmount) > bankPoints}
              className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              eseller оноо болгох
            </button>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
