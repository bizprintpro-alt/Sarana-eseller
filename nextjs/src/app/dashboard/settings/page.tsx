'use client';

import { useState } from 'react';
import { User, Phone, MapPin, Save, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: API call to update profile
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 500);
  };

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-xl font-black text-white">⚙️ Тохиргоо</h1>

      {/* Profile */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-dash-accent" /> Профайл мэдээлэл</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Нэр</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Имэйл</label>
            <input value={user?.email || ''} readOnly className="w-full bg-dash-elevated text-white/50 border border-dash-border rounded-xl px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1"><Phone className="w-3 h-3" /> Утас</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+976 9900 0000" className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Хүргэлтийн хаяг</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Дүүрэг, хороо, байр, тоот..." className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent resize-none" />
          </div>
          <button onClick={handleSave} disabled={saving} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-none cursor-pointer transition ${saved ? 'bg-green-600 text-white' : 'bg-dash-accent text-white'}`}>
            <Save className="w-4 h-4" /> {saved ? 'Хадгалсан ✓' : saving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-amber-400" /> Нууцлал</h3>
        <button className="w-full py-3 rounded-xl font-bold text-sm border border-dash-border bg-transparent text-white/50 cursor-pointer hover:bg-white/[.03]">
          Нууц үг солих
        </button>
      </div>
    </div>
  );
}
