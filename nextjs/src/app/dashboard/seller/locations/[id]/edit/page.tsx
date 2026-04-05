'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import LocationForm, { LocationData } from '@/components/seller/LocationForm';

export default function EditLocationPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch(`/api/seller/locations/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error('Байршил олдсонгүй');
        return r.json();
      })
      .then((loc) => setData(loc))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--esl-bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#777' }}>Ачааллаж байна...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--esl-bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#EF4444' }}>{error || 'Байршил олдсонгүй'}</p>
      </div>
    );
  }

  return <LocationForm initialData={{ ...data, id }} isEdit />;
}
