'use client';

export default function OfflinePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', color: '#fff', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📵</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Интернэт холболт байхгүй</h1>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Холболтоо шалгаад дахин оролдоно уу</p>
        <button onClick={() => typeof window !== 'undefined' && window.location.reload()}
          style={{ background: '#E8242C', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          🔄 Дахин оролдох
        </button>
      </div>
    </div>
  );
}
