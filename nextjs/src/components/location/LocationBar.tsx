'use client';

import { useState } from 'react';
import { MapPin, ChevronDown, Navigation, X, Loader2 } from 'lucide-react';
import { UB_DISTRICTS } from '@/lib/location/userLocation';

interface LocationBarProps {
  district: { key: string; label: string } | null;
  loading: boolean;
  permissionDenied: boolean;
  nearbyCount?: number;
  onDistrictChange: (key: string) => void;
  onRefresh: () => void;
}

export default function LocationBar({
  district, loading, permissionDenied, nearbyCount, onDistrictChange, onRefresh,
}: LocationBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
        <div className="w-9 h-9 rounded-full bg-[rgba(232,36,44,0.1)] flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-[#E8242C]" />
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--esl-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--esl-text-muted)' }}>Байршил тодорхойлж байна...</span>
            </div>
          ) : district ? (
            <>
              <p className="text-sm font-semibold" style={{ color: 'var(--esl-text-primary)' }}>{district.label} дүүрэг</p>
              {nearbyCount !== undefined && (
                <p className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>Таны ойролцоо {nearbyCount} дэлгүүр, үйлчилгээ</p>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--esl-text-muted)' }}>
              {permissionDenied ? 'Дүүрэг сонгоно уу' : 'Байршил тодорхойлогдоогүй'}
            </p>
          )}
        </div>
        <button onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition"
          style={{ background: 'var(--esl-bg-section)', color: 'var(--esl-text-secondary)' }}>
          Өөрчлөх <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* District Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setPickerOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border p-5" onClick={e => e.stopPropagation()}
            style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: 'var(--esl-text-primary)' }}>Дүүрэг сонгох</h3>
              <button onClick={() => setPickerOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer" style={{ background: 'var(--esl-bg-section)', color: 'var(--esl-text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GPS button */}
            <button onClick={() => { onRefresh(); setPickerOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border mb-3 cursor-pointer transition hover:border-[#E8242C]"
              style={{ background: 'rgba(232,36,44,0.05)', borderColor: 'rgba(232,36,44,0.2)', color: '#E8242C' }}>
              <Navigation className="w-4 h-4" />
              <span className="text-sm font-semibold">GPS-ээр тодорхойлох</span>
            </button>

            {/* District list */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(UB_DISTRICTS).map(([key, d]) => (
                <button key={key} onClick={() => { onDistrictChange(key); setPickerOpen(false); }}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-all text-left ${
                    district?.key === key ? 'border-[#E8242C] bg-[rgba(232,36,44,0.05)] text-[#E8242C]' : ''
                  }`} style={district?.key !== key ? { background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' } : undefined}>
                  <MapPin className="w-3 h-3 inline mr-1" />{d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
