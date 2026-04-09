'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Save, Lock, Loader2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    fetch(`${API}/api/user/settings`, { headers: headers() })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setName(res.data.name || '');
          setEmail(res.data.email || '');
          setPhone(res.data.phone || '');
        }
      })
      .catch(() => showToast('Мэдээлэл ачаалахад алдаа гарлаа'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/user/settings`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        showToast('Амжилттай хадгаллаа ✓');
      } else {
        showToast(data.message || 'Алдаа гарлаа');
      }
    } catch {
      showToast('Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-[var(--brand,#E8242C)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-xl font-black text-white">⚙️ Тохиргоо</h1>

      {/* Profile */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-[var(--brand,#E8242C)]" /> Профайл мэдээлэл
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Нэр</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--brand,#E8242C)]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Имэйл</label>
            <input
              value={email}
              readOnly
              className="w-full bg-dash-elevated text-white/50 border border-dash-border rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Утас
            </label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+976 9900 0000"
              className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--brand,#E8242C)]"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-none cursor-pointer transition bg-[var(--brand,#E8242C)] text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Хадгалж байна...</>
              : <><Save className="w-4 h-4" /> Хадгалах</>}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" /> Нууцлал
        </h3>
        <button className="w-full py-3 rounded-xl font-bold text-sm border border-dash-border bg-transparent text-white/50 cursor-pointer hover:bg-white/[.03]">
          Нууц үг солих
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-dash-card border border-dash-border px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg z-50 animate-[fadeIn_0.2s]">
          {toast}
        </div>
      )}
    </div>
  );
}
