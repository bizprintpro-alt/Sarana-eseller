'use client';

import { useEffect, useRef, useState } from 'react';

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

/**
 * Map picker using Leaflet (loaded via CDN to avoid SSR issues).
 * User can click map or drag marker to select location.
 */
export function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapObjRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = (): Promise<any> => {
      if ((window as any).L) return Promise.resolve((window as any).L);

      return new Promise((resolve) => {
        if (document.getElementById('leaflet-js')) {
          const check = setInterval(() => {
            if ((window as any).L) { clearInterval(check); resolve((window as any).L); }
          }, 50);
          return;
        }
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve((window as any).L);
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then((L) => {
      const map = L.map(mapRef.current!).setView([lat, lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const icon = L.divIcon({
        html: '<div style="width:24px;height:24px;background:#E8242C;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: '',
      });

      const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
      });

      map.on('click', (e: any) => {
        const pos = e.latlng;
        marker.setLatLng(pos);
        onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
      });

      mapObjRef.current = map;
      setLoaded(true);
    });

    return () => {
      mapObjRef.current?.remove();
      mapObjRef.current = null;
    };
  }, []);

  // Update marker when coords change externally
  useEffect(() => {
    if (markerRef.current && loaded) {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng, loaded]);

  return (
    <div>
      <div
        ref={mapRef}
        style={{
          height: '220px',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '0.5px solid #3D3D3D',
          backgroundColor: 'var(--esl-bg-elevated)',
        }}
      />
      {!loaded && (
        <p style={{ fontSize: '12px', color: '#777', marginTop: '4px', textAlign: 'center' }}>
          Газрын зураг ачааллаж байна...
        </p>
      )}
    </div>
  );
}
