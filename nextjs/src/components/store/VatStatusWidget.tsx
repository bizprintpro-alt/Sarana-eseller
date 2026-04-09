'use client';

import { useEffect, useState } from 'react';

export default function VatStatusWidget() {
  const [vatEnabled, setVatEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/system-settings')
      .then((r) => r.json())
      .then((d) => setVatEnabled(!!d.systemSettings?.vatEnabled))
      .catch(() => setVatEnabled(null));
  }, []);

  if (vatEnabled === null) return null;

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 600,
        background: vatEnabled ? '#dcfce7' : '#f3f4f6',
        color: vatEnabled ? '#16a34a' : '#6b7280',
      }}
    >
      {vatEnabled ? '\uD83E\uDDFEНОАТ идэвхтэй' : 'НОАТ идэвхгүй'}
    </span>
  );
}
