'use client';

import { useState, useMemo } from 'react';
import { Calculator, CreditCard, Building2, ChevronRight } from 'lucide-react';
import { calculateBNPL, BNPL_BANKS, BNPL_MONTHS } from '@/lib/bnpl';

interface BNPLCalculatorProps {
  price: number;
  onApply?: (months: number, bank: string) => void;
}

export default function BNPLCalculator({ price, onApply }: BNPLCalculatorProps) {
  const [months, setMonths] = useState<number>(6);
  const [bank, setBank] = useState<string>('KHAN');

  const calc = useMemo(() => calculateBNPL(price, months), [price, months]);

  const fmt = (n: number) => n.toLocaleString('mn-MN');

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-semibold text-gray-900">Зээлээр авах</h3>
      </div>

      {/* Month selector */}
      <div className="mb-4">
        <p className="mb-2 text-sm text-gray-500">Хугацаа сонгох</p>
        <div className="flex gap-2">
          {BNPL_MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                months === m
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {m} сар
            </button>
          ))}
        </div>
      </div>

      {/* Calculation display */}
      <div className="mb-4 space-y-2 rounded-xl bg-gray-50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Урьдчилгаа (10%)</span>
          <span className="font-medium text-gray-900">{fmt(calc.downPayment)}₮</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Сарын төлбөр</span>
          <span className="text-lg font-bold text-blue-600">{fmt(calc.monthly)}₮</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Хүү</span>
          <span className="font-medium text-gray-900">{fmt(calc.interest)}₮</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Нийт төлбөр</span>
            <span className="font-semibold text-gray-900">{fmt(calc.total)}₮</span>
          </div>
        </div>
      </div>

      {/* Bank selector */}
      <div className="mb-4">
        <p className="mb-2 text-sm text-gray-500">Банк сонгох</p>
        <div className="grid grid-cols-2 gap-2">
          {BNPL_BANKS.map((b) => (
            <button
              key={b.id}
              onClick={() => setBank(b.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                bank === b.id
                  ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Building2 className="h-4 w-4" />
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Apply button */}
      <button
        onClick={() => onApply?.(months, bank)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
      >
        <CreditCard className="h-4 w-4" />
        Зээлээр авах
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
