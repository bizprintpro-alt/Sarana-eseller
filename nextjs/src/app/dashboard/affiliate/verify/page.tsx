'use client';

import { useState } from 'react';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

export default function VerifyPage() {
  const [code, setCode] = useState('ESL-');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleVerify = async () => {
    if (!code || code === 'ESL-') return;
    setStatus('loading');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/seller/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (json.success && json.data?.verified) {
        setStatus('success');
        setMessage(json.data.message || 'Амжилттай!');
      } else {
        setStatus('error');
        setMessage(json.error || json.data?.message || 'Код буруу байна');
      }
    } catch {
      setStatus('error');
      setMessage('Сервертэй холбогдож чадсангүй');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: 'var(--foreground, #111)' }}>
        Борлуулагч баталгаажуулалт
      </h1>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="ESL-"
        maxLength={10}
        style={{
          width: '100%', padding: '10px 14px', fontSize: 16, borderRadius: 8,
          border: '1px solid var(--border, #ddd)', marginBottom: 12, fontFamily: 'monospace',
        }}
      />

      <button
        onClick={handleVerify}
        disabled={status === 'loading' || code.length < 5}
        style={{
          width: '100%', padding: '10px 0', fontSize: 15, fontWeight: 600,
          background: '#E8242C', color: '#fff', border: 'none', borderRadius: 8,
          cursor: status === 'loading' ? 'wait' : 'pointer', opacity: status === 'loading' ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {status === 'loading' && <Loader2 size={18} className="animate-spin" />}
        Баталгаажуулах
      </button>

      {status === 'success' && (
        <div style={{ marginTop: 16, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <ShieldCheck size={20} /> {message}
        </div>
      )}
      {status === 'error' && (
        <div style={{ marginTop: 16, color: '#E8242C', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} /> {message}
        </div>
      )}
    </div>
  );
}
