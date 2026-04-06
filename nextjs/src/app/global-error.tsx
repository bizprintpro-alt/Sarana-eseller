'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ background: '#0A0A0A', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😵</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Алдаа гарлаа</h2>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Уучлаарай, системд алдаа гарлаа.</p>
          <button onClick={reset}
            style={{ background: '#E8242C', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Дахин оролдох
          </button>
        </div>
      </body>
    </html>
  );
}
