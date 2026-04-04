'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Props {
  context: 'product' | 'banner' | 'profile' | 'chat';
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
}

export function MediaUploader({ context, value, onChange, maxFiles = 5, label }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context);

    const token = localStorage.getItem('token');
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    return data.url as string;
  }, [context]);

  const handleFiles = useCallback(async (files: FileList) => {
    const remaining = maxFiles - value.length;
    if (remaining <= 0) return;

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const urls = await Promise.all(toUpload.map(uploadFile));
      onChange([...value, ...urls.filter(Boolean)]);
    } catch {}
    finally { setUploading(false); }
  }, [value, maxFiles, onChange, uploadFile]);

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {label && <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#A0A0A0', marginBottom: 6 }}>{label}</span>}

      {/* Preview grid */}
      {value.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {value.map((url, i) => (
            <div key={i} style={{
              width: 80, height: 80, borderRadius: 8, overflow: 'hidden',
              position: 'relative', border: '0.5px solid #2A2A2A',
            }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => removeFile(i)} style={{
                position: 'absolute', top: 2, right: 2,
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(0,0,0,0.7)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#FFF',
              }}>
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {value.length < maxFiles && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `1.5px dashed ${dragOver ? '#E8242C' : '#3D3D3D'}`,
            borderRadius: 10, padding: '20px 16px',
            textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'rgba(232,36,44,0.04)' : '#1A1A1A',
            transition: 'all 0.15s',
          }}
        >
          {uploading ? (
            <Loader2 size={24} color="#E8242C" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 6px' }} />
          ) : (
            <Upload size={24} color="#555" style={{ margin: '0 auto 6px' }} />
          )}
          <p style={{ fontSize: 12, fontWeight: 500, color: uploading ? '#E8242C' : '#777' }}>
            {uploading ? 'Байршуулж байна...' : 'Зураг чирж оруулах эсвэл сонгох'}
          </p>
          <p style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
            PNG, JPG, WebP · {value.length}/{maxFiles}
          </p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple hidden
        onChange={e => { if (e.target.files) handleFiles(e.target.files); }}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
