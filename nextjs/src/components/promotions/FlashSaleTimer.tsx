'use client';
import { useState, useEffect } from 'react';

export function FlashSaleTimer({ endAt }: { endAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endAt]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1">
      {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-[#E8242C] font-bold">:</span>}
          <span className="bg-[#E8242C] text-white px-1.5 py-0.5 rounded-md font-extrabold text-[13px] font-mono min-w-[28px] text-center">
            {pad(v)}
          </span>
        </span>
      ))}
    </div>
  );
}
