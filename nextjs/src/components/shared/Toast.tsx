'use client';

import { create } from 'zustand';
import { useEffect } from 'react';

interface ToastState {
  message: string | null;
  type: 'ok' | 'warn' | 'error';
  show: (msg: string, type?: 'ok' | 'warn' | 'error') => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  type: 'ok',
  show: (msg, type = 'ok') => {
    set({ message: msg, type });
    setTimeout(() => set({ message: null }), 2800);
  },
  hide: () => set({ message: null }),
}));

const BG = { ok: '#059669', warn: '#D97706', error: '#DC2626' };

export default function Toast() {
  const { message, type } = useToast();

  if (!message) return null;

  return (
    <div
      className="toast"
      style={{ background: BG[type] }}
    >
      {message}
    </div>
  );
}
