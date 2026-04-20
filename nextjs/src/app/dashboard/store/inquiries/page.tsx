'use client';
import { useEffect, useState } from 'react';

interface Inquiry {
  _id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  listingTitle: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  new: '🔴 Шинэ',
  contacted: '🔵 Холбоо барьсан',
  closed: '✅ Хаагдсан',
};

const STATUS_CLASS: Record<string, string> = {
  new: 'bg-red-100 text-red-700',
  contacted: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-600',
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/inquiries')
      .then((r) => r.json())
      .then((d) => setInquiries(d.inquiries || []))
      .catch(() => setInquiries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Лавлагаа, Хүсэлтүүд</h1>
      {loading ? (
        <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />
      ) : inquiries.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Одоогоор лавлагаа байхгүй</div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq._id} className="bg-white rounded-xl border p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{inq.name}</p>
                  <p className="text-sm text-gray-500">
                    {inq.phone} · {inq.email}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{inq.message}</p>
                  <p className="text-xs text-gray-400 mt-1">Зар: {inq.listingTitle}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_CLASS[inq.status]}`}>
                  {STATUS_LABEL[inq.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
