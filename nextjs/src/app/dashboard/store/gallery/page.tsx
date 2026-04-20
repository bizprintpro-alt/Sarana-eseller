'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2 } from 'lucide-react';

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/seller/gallery')
      .then((r) => r.json())
      .then((d) => setImages(d.images || []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('context', 'gallery');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.url) setImages((prev) => [data.url, ...prev]);
    } catch {
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    if (!confirm('Зургийг устгах уу?')) return;
    await fetch('/api/seller/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }).catch(() => {});
    setImages((prev) => prev.filter((u) => u !== url));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Гэрэл зургийн цомог</h1>
          <p className="text-sm text-gray-500">Барилгын ажлын зургууд</p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm cursor-pointer">
          <Upload className="w-4 h-4" />
          {uploading ? 'Байршуулж байна...' : 'Зураг нэмэх'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>Одоогоор зураг байхгүй</p>
          <p className="text-sm mt-1">Дээрх товч дарж зураг нэмнэ үү</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-square group rounded-xl overflow-hidden border">
              <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
              <button
                onClick={() => handleDelete(url)}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
