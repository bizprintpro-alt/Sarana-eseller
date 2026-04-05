'use client';

import { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
}

export function ShareModal({ isOpen, onClose, url, title, description }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const socials = [
    { name: 'Facebook', color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'Twitter', color: '#1DA1F2', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { name: 'LinkedIn', color: '#0A66C2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />

      {/* Modal */}
      <div style={{
        position: 'relative', width: '90%', maxWidth: 400,
        background: 'var(--esl-bg-card)', borderRadius: 16, border: '0.5px solid #2A2A2A',
        padding: 24, color: '#FFF',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12,
          width: 28, height: 28, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', background: 'none', color: '#777', cursor: 'pointer',
        }}>
          <X size={16} />
        </button>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Хуваалцах</h3>
        {description && <p style={{ fontSize: 12, color: '#777', marginBottom: 16 }}>{description}</p>}

        {/* QR Code */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <QRCodeDisplay value={url} size={140} label="QR код уншуулах" />
        </div>

        {/* Copy link */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16,
          background: 'var(--esl-bg-page)', borderRadius: 10, border: '0.5px solid #2A2A2A',
          padding: '8px 12px', alignItems: 'center',
        }}>
          <span style={{ flex: 1, fontSize: 12, color: '#A0A0A0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {url}
          </span>
          <button onClick={copyLink} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
            border: 'none', cursor: 'pointer',
            background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(232,36,44,0.12)',
            color: copied ? '#4ADE80' : '#E8242C',
          }}>
            {copied ? <><Check size={12} /> Хуулсан</> : <><Copy size={12} /> Хуулах</>}
          </button>
        </div>

        {/* Social links */}
        <div style={{ display: 'flex', gap: 8 }}>
          {socials.map(s => (
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 500,
                background: s.color + '15', color: s.color,
                textDecoration: 'none', border: `0.5px solid ${s.color}30`,
              }}>
              <ExternalLink size={12} /> {s.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
