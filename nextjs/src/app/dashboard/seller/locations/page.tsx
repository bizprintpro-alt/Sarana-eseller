'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Plus, Pencil, Trash2, Clock, Phone } from 'lucide-react';
import { LocationCoordBadge } from '@/components/seller/LocationCoordReminder';

interface StoreLocation {
  id: string;
  name: string;
  isPrimary: boolean;
  district: string;
  khoroo: string;
  address: string;
  phone: string;
  lat?: number | null;
  lng?: number | null;
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  features: string[];
}

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function getTodayHours(hours: Record<string, { open: string; close: string; closed: boolean }>): string {
  const day = DAYS[new Date().getDay()];
  const h = hours?.[day];
  if (!h) return 'Тодорхойгүй';
  if (h.closed) return 'Хаалттай';
  return `${h.open} - ${h.close}`;
}

export default function LocationsListPage() {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/seller/locations', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" байршлыг устгах уу?`)) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/seller/locations/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--esl-bg-page)', color: '#FFF', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Байршлууд</h1>
          <p style={{ fontSize: '13px', color: '#777', margin: '4px 0 0 0' }}>
            {locations.length} байршил бүртгэлтэй
          </p>
        </div>
        <Link href="/dashboard/seller/locations/new"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', backgroundColor: '#E8242C', color: '#FFF', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
          <Plus size={16} /> Байршил нэмэх
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#777', textAlign: 'center', paddingTop: '60px' }}>Ачааллаж байна...</p>
      ) : locations.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <MapPin size={48} color="#3D3D3D" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#FFF', marginBottom: '8px' }}>
            Байршил нэмэгдээгүй байна
          </p>
          <p style={{ fontSize: '13px', color: '#777', marginBottom: '20px' }}>
            Дэлгүүрийн байршлаа нэмж хүргэлтэд олдохоор болго
          </p>
          <Link href="/dashboard/seller/locations/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', backgroundColor: '#E8242C', color: '#FFF', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
            <Plus size={16} /> Байршил нэмэх
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {locations.map((loc) => (
            <div key={loc.id} style={{ backgroundColor: 'var(--esl-bg-card)', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(232,36,44,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={18} color="#E8242C" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFF' }}>{loc.name}</span>
                      {loc.isPrimary && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(232,36,44,0.15)', color: '#E8242C', border: '1px solid rgba(232,36,44,0.3)' }}>
                          Үндсэн
                        </span>
                      )}
                      <LocationCoordBadge lat={loc.lat ?? null} lng={loc.lng ?? null} />
                    </div>
                    <p style={{ fontSize: '13px', color: '#A0A0A0', marginTop: '2px' }}>
                      {loc.district}, {loc.address}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <Link href={`/dashboard/seller/locations/${loc.id}/edit`}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #3D3D3D', color: '#A0A0A0', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Pencil size={12} /> Засах
                  </Link>
                  <button onClick={() => handleDelete(loc.id, loc.name)}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #3D3D3D', backgroundColor: 'transparent', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2A2A2A' }}>
                <div>
                  <p style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>Өнөөдрийн цаг</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} color="#777" />
                    <span style={{ fontSize: '12px', color: '#E0E0E0' }}>{getTodayHours(loc.hours)}</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>Утас</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} color="#777" />
                    <span style={{ fontSize: '12px', color: '#E0E0E0' }}>{loc.phone}</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>Онцлог</p>
                  <span style={{ fontSize: '12px', color: '#E0E0E0' }}>{loc.features?.length || 0} боломж</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
