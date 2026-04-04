'use client';

import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  label?: string;
}

// SVG-based QR code — no external dependencies
// Generates a simple visual QR placeholder + copies link
export function QRCodeDisplay({ value, size = 160, bgColor = '#FFF', fgColor = '#000', label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR-like pattern (visual placeholder — real QR needs qrcode library)
    const modules = 21;
    const cellSize = size / modules;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = fgColor;

    // Generate deterministic pattern from value
    const hash = value.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);

    // Finder patterns (3 corners)
    const drawFinder = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          const border = i === 0 || i === 6 || j === 0 || j === 6;
          const inner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
          if (border || inner) {
            ctx.fillRect((x + j) * cellSize, (y + i) * cellSize, cellSize, cellSize);
          }
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(modules - 7, 0);
    drawFinder(0, modules - 7);

    // Data pattern
    for (let i = 8; i < modules - 8; i++) {
      for (let j = 8; j < modules - 8; j++) {
        const bit = ((hash * (i * 31 + j * 17)) >>> (i + j) % 32) & 1;
        if (bit) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }

    // Timing patterns
    for (let i = 8; i < modules - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
        ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }, [value, size, bgColor, fgColor]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ borderRadius: 8, border: '1px solid #E0E0E0' }}
      />
      {label && <span style={{ fontSize: 11, color: '#777', textAlign: 'center' }}>{label}</span>}
    </div>
  );
}
