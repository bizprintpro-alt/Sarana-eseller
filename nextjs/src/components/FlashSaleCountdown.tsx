'use client';

import { useState, useEffect } from 'react';

interface Props {
  endsAt: Date | string;
}

export function FlashSaleCountdown({ endsAt }: Props) {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' });
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    function tick() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setEnded(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (ended) return null;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(0,0,0,0.35)', borderRadius: 8,
      padding: '5px 12px', marginTop: 8,
    }}>
      <span style={{ fontSize: 12 }}>⏰</span>
      {[time.h, time.m, time.s].map((val, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <span style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            fontWeight: 700, fontSize: 14, fontFamily: 'monospace',
            padding: '2px 6px', borderRadius: 5,
            minWidth: 28, textAlign: 'center',
          }}>
            {val}
          </span>
          {i < 2 && <span style={{ color: '#fff', fontWeight: 700 }}>:</span>}
        </span>
      ))}
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginLeft: 4 }}>
        үлдлээ
      </span>
    </div>
  );
}
