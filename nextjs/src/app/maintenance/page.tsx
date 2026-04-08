'use client';

import { useEffect, useState } from 'react';
import { Zap, Clock, ArrowRight } from 'lucide-react';

export default function MaintenancePage() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const iv = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 600);
    return () => clearInterval(iv);
  }, []);

  // Poll every 30s to check if maintenance is over
  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const res = await fetch('/api/maintenance-status');
        const data = await res.json();
        if (!data.maintenance) {
          window.location.href = '/';
        }
      } catch {}
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 50%, #0A0A0A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{
          width: 64, height: 64, borderRadius: 20, margin: '0 auto 32px',
          background: 'linear-gradient(135deg, #E8242C, #C41E25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(232,36,44,0.3)',
        }}>
          <Zap size={32} color="#FFF" />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 32, fontWeight: 900, color: '#FFF',
          margin: '0 0 12px', letterSpacing: '-0.02em',
        }}>
          eseller<span style={{ color: '#E8242C' }}>.mn</span>
        </h1>

        {/* Status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(232,36,44,0.1)', border: '1px solid rgba(232,36,44,0.2)',
          borderRadius: 99, padding: '8px 20px', marginBottom: 32,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#E8242C',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E8242C' }}>
            Засвар хийгдэж байна{dots}
          </span>
        </div>

        {/* Message */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20, padding: '32px 28px', marginBottom: 32,
        }}>
          <Clock size={28} color="#555" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E0E0E0', margin: '0 0 12px' }}>
            Тун удахгүй эргэн ажиллана
          </h2>
          <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7, margin: 0 }}>
            Бид системийн шинэчлэл хийж байна. Энэ нь ердийн үйл ажиллагааны хүрээнд хийгдэж буй засвар бөгөөд тун удахгүй дуусна.
          </p>
        </div>

        {/* Contact */}
        <p style={{ fontSize: 13, color: '#555' }}>
          Асуулт байвал{' '}
          <a href="mailto:info@eseller.mn" style={{ color: '#E8242C', textDecoration: 'none', fontWeight: 600 }}>
            info@eseller.mn
          </a>
          {' '}руу хандана уу
        </p>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.85); }
          }
        `}</style>
      </div>
    </div>
  );
}
