'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { createDefaultConfig, type StorefrontConfig } from '@/lib/types/storefront';
import StorefrontEditor from '@/components/storefront/StorefrontEditor';

export default function StorefrontEditorPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try loading from API, fallback to default
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/seller/storefront', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const { data } = await res.json();
          if (data?.config) { setConfig(data.config); setLoading(false); return; }
        }
      } catch {}

      // Generate default
      const def = createDefaultConfig(user?._id || '');
      def.hero.headline = user?.store?.name || user?.name || 'Манай дэлгүүр';
      setConfig(def);
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async (updated: StorefrontConfig) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/seller/storefront', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ config: updated }),
      });
    } catch {}
  };

  const handleRegenerate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/generate-storefront', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          sellerName: user?.store?.name || user?.name || 'Дэлгүүр',
          description: 'Чанартай бараа, мэргэжлийн үйлчилгээ',
          category: 'general',
          productImages: [],
          priceRange: 'mid',
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        if (data) setConfig(data);
      }
    } catch {}
  };

  if (loading || !config) {
    return <div className="flex items-center justify-center h-screen text-gray-400 text-sm">Ачааллаж байна...</div>;
  }

  return (
    <div className="-m-6 lg:-m-8">
      <StorefrontEditor
        initialConfig={config}
        onSave={handleSave}
        onRegenerate={handleRegenerate}
        previewUrl={`/s/${user?.username || 'demo-salon'}`}
      />
    </div>
  );
}
