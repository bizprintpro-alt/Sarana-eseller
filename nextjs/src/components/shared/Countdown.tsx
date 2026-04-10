'use client';

import { useState, useEffect } from 'react';

export default function Countdown({ endAt, onEnd }: { endAt: string | Date; onEnd?: () => void }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setTime('Дууслаа'); onEnd?.(); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(`${h}ц ${m}м ${s}с`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [endAt, onEnd]);

  return <span style={{ color: '#E8242C', fontWeight: 700 }}>⏱ {time}</span>;
}
