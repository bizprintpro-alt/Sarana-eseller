'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';
import StatCard from '@/components/dashboard/StatCard';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'editor' | 'viewer';
  addedAt: string;
  active: boolean;
}

const ROLE_LABELS: Record<string, [string, string]> = {
  manager: ['bg-purple-100 text-purple-700', 'Менежер'],
  editor: ['bg-blue-100 text-blue-700', 'Засварлагч'],
  viewer: ['bg-gray-100 text-gray-700', 'Үзэгч'],
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  manager: 'Бүх хандалт: захиалга, бүтээгдэхүүн, тохиргоо',
  editor: 'Бүтээгдэхүүн, захиалга засах боломжтой',
  viewer: 'Зөвхөн харах эрхтэй',
};

const INITIAL_STAFF: StaffMember[] = [
  { id: '1', name: 'Дэлгэрмаа Б.', email: 'delgermaa@email.com', role: 'manager', addedAt: '2026-03-01T10:00:00Z', active: true },
  { id: '2', name: 'Ариунболд Г.', email: 'ariunbold@email.com', role: 'editor', addedAt: '2026-03-15T14:00:00Z', active: true },
  { id: '3', name: 'Мөнхзул Д.', email: 'munkhzul@email.com', role: 'viewer', addedAt: '2026-03-20T09:00:00Z', active: false },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' as StaffMember['role'] });
  const toast = useToast();

  // Fetch from DB, fallback to demo
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/seller/staff', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setStaff(data); })
      .catch(() => {});
  }, []);

  function handleAdd() {
    if (!form.name || !form.email) {
      toast.show('Нэр, имэйл заавал бөглөнө үү', 'warn');
      return;
    }
    if (staff.some((s) => s.email === form.email)) {
      toast.show('Энэ имэйл бүртгэлтэй байна', 'warn');
      return;
    }
    const newMember: StaffMember = {
      id: Date.now().toString(),
      name: form.name,
      email: form.email,
      role: form.role,
      addedAt: new Date().toISOString(),
      active: true,
    };
    setStaff((prev) => [...prev, newMember]);
    setForm({ name: '', email: '', role: 'viewer' });
    setShowModal(false);
    toast.show('Ажилтан нэмэгдлээ', 'ok');
  }

  function handleRemove(id: string) {
    if (!confirm('Энэ ажилтныг хасахдаа итгэлтэй байна уу?')) return;
    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast.show('Ажилтан хасагдлаа', 'ok');
  }

  function toggleActive(id: string) {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    toast.show('Төлөв шинэчлэгдлээ', 'ok');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ажилтнууд</h1>
          <p className="text-gray-500 mt-1">Дэлгүүрийн ажилтан нэмэх, удирдах</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm">
          + Ажилтан нэмэх
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon="👥" label="Нийт ажилтан" value={staff.length} gradient="indigo" />
        <StatCard icon="✅" label="Идэвхтэй" value={staff.filter((s) => s.active).length} gradient="green" />
        <StatCard icon="👑" label="Менежер" value={staff.filter((s) => s.role === 'manager').length} gradient="amber" />
      </div>

      {staff.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-lg font-semibold text-gray-700">Ажилтан байхгүй</h3>
          <p className="text-gray-400 mt-1">Шинэ ажилтан нэмээрэй</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Ажилтан</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Имэйл</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Эрх</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Нэмсэн огноо</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Идэвхтэй</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => {
                  const [cls, label] = ROLE_LABELS[s.role] || ['bg-gray-100 text-gray-600', s.role];
                  return (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                            {s.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{s.email}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{new Date(s.addedAt).toLocaleDateString('mn-MN')}</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActive(s.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${s.active ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleRemove(s.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                          Хасах
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Ажилтан нэмэх</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Эрх</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffMember['role'] })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="manager">Менежер</option>
                  <option value="editor">Засварлагч</option>
                  <option value="viewer">Үзэгч</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">{ROLE_DESCRIPTIONS[form.role]}</p>
              </div>
              <button onClick={handleAdd} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Нэмэх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
