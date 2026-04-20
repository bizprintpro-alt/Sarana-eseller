'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Vehicle {
  _id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  status: 'available' | 'sold' | 'reserved';
  images: string[];
}

const STATUS_LABEL: Record<string, string> = {
  available: 'Зарна',
  sold: 'Зарагдсан',
  reserved: 'Захиалгатай',
};

const STATUS_CLASS: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  sold: 'bg-gray-100 text-gray-600',
  reserved: 'bg-yellow-100 text-yellow-700',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/vehicles')
      .then((r) => r.json())
      .then((d) => setVehicles(d.vehicles || d.products || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Тээврийн хэрэгслүүд</h1>
        <Link
          href="/dashboard/store/products/new"
          className="px-4 py-2 bg-black text-white rounded-xl text-sm"
        >
          + Машин нэмэх
        </Link>
      </div>
      {loading ? (
        <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Одоогоор машин байхгүй</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div key={v._id} className="bg-white rounded-xl border overflow-hidden">
              {v.images?.[0] && (
                <div className="relative h-40">
                  <Image
                    src={v.images[0]}
                    alt={v.title || `${v.brand} ${v.model}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold">
                  {v.brand} {v.model} {v.year}
                </h3>
                <p className="text-red-600 font-bold">{v.price?.toLocaleString()}₮</p>
                <p className="text-sm text-gray-500">{v.mileage?.toLocaleString()} км</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${STATUS_CLASS[v.status]}`}
                >
                  {STATUS_LABEL[v.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
