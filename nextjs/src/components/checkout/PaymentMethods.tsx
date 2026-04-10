'use client';
import { useState } from 'react';

const METHODS = [
  { id: 'qpay', name: 'QPay', icon: '🏦', desc: 'Бүх банкны апп', color: '#E8242C' },
  { id: 'socialpay', name: 'SocialPay', icon: '💳', desc: 'Голомт банк', color: '#D32F2F' },
  { id: 'monpay', name: 'MonPay', icon: '📱', desc: 'Хаан банк', color: '#0047AB' },
  { id: 'storepay', name: 'StorePay', icon: '💰', desc: '3-12 хувааж төлөх', color: '#2E7D32' },
];

export function PaymentMethods({ selected, onChange }: { selected: string; onChange: (m: string) => void }) {
  return (
    <div>
      <h3 className="text-[var(--esl-text)] font-bold mb-3 text-base">Төлбөрийн арга</h3>
      <div className="flex flex-col gap-2">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className="flex items-center gap-3.5 p-3.5 rounded-xl w-full text-left cursor-pointer transition-all border"
            style={{
              background: selected === m.id ? `${m.color}12` : 'var(--esl-bg-section)',
              borderColor: selected === m.id ? m.color : 'var(--esl-border)',
            }}
          >
            <span className="text-[28px]">{m.icon}</span>
            <div className="flex-1">
              <p className="text-[var(--esl-text)] font-bold text-[15px] m-0">{m.name}</p>
              <p className="text-[var(--esl-text-muted)] text-xs m-0">{m.desc}</p>
            </div>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ border: `2px solid ${selected === m.id ? m.color : 'var(--esl-border)'}`, background: selected === m.id ? m.color : 'transparent' }}
            >
              {selected === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>

      {selected === 'storepay' && (
        <div className="mt-3 bg-[rgba(46,125,50,0.08)] rounded-[10px] p-3.5 border border-[rgba(46,125,50,0.2)]">
          <p className="text-[var(--esl-text)] font-semibold text-[13px] mb-2">Хувааж төлөх:</p>
          <div className="flex gap-2">
            {[{ m: 3, l: '3 сар' }, { m: 6, l: '6 сар' }, { m: 12, l: '12 сар' }].map((o) => (
              <button key={o.m} className="flex-1 bg-[#2E7D32] text-white border-none rounded-lg py-2 cursor-pointer text-[13px] font-semibold">
                {o.l}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
