'use client';

import { X, ArrowRight, Crown } from 'lucide-react';
import Link from 'next/link';
import { PLANS } from '@/lib/subscription';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  currentPlan: string;
  requiredPlan: string;
}

export function UpgradeModal({ isOpen, onClose, reason, currentPlan, requiredPlan }: Props) {
  if (!isOpen) return null;

  const current = PLANS[currentPlan] || PLANS.free;
  const required = PLANS[requiredPlan] || PLANS.standard;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />

      <div style={{
        position: 'relative', width: '90%', maxWidth: 440,
        background: '#1A1A1A', borderRadius: 16, border: '0.5px solid #2A2A2A',
        padding: 24, color: '#FFF',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12,
          border: 'none', background: 'none', color: '#777', cursor: 'pointer',
        }}>
          <X size={16} />
        </button>

        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(232,36,44,0.12)', border: '1px solid rgba(232,36,44,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Crown size={24} color="#E8242C" />
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
          Багц шинэчлэх шаардлагатай
        </h3>

        {/* Reason */}
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(245,158,11,0.08)', border: '0.5px solid rgba(245,158,11,0.25)',
          fontSize: 13, color: '#FBBF24', textAlign: 'center', marginBottom: 16,
        }}>
          {reason}
        </div>

        {/* Plan comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, marginBottom: 20 }}>
          {/* Current */}
          <div style={{
            padding: 12, borderRadius: 10,
            background: '#0A0A0A', border: '0.5px solid #2A2A2A',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>Одоогийн</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: current.color }}>{current.name}</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
              {current.price === 0 ? 'Үнэгүй' : `${current.price.toLocaleString()}₮/сар`}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={20} color="#555" />
          </div>

          {/* Required */}
          <div style={{
            padding: 12, borderRadius: 10,
            background: required.color + '10',
            border: `1px solid ${required.color}40`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: required.color, marginBottom: 4 }}>Шаардлагатай</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: required.color }}>{required.name}</div>
            <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>
              {required.price.toLocaleString()}₮/сар
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {required.name} багцын боломжууд
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {required.features.slice(0, 6).map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#A0A0A0' }}>
                <span style={{ color: '#22C55E' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px 0', borderRadius: 10,
            border: '0.5px solid #2A2A2A', background: 'none',
            color: '#777', fontSize: 13, cursor: 'pointer',
          }}>
            Хаах
          </button>
          <Link href="/dashboard/seller/package" style={{
            flex: 2, padding: '10px 0', borderRadius: 10,
            border: 'none', background: '#E8242C', color: '#FFF',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            textAlign: 'center', textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Crown size={14} /> Upgrade хийх
          </Link>
        </div>
      </div>
    </div>
  );
}
