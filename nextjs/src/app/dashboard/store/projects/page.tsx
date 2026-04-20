'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  _id: string;
  title: string;
  location: string;
  status: 'planning' | 'in_progress' | 'completed';
  budget: number;
  completionDate: string;
  images: string[];
}

const STATUS_LABEL: Record<string, string> = {
  planning: 'Төлөвлөлт',
  in_progress: 'Явагдаж байна',
  completed: 'Дууссан',
};

const STATUS_CLASS: Record<string, string> = {
  planning: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/projects')
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Төслүүд</h1>
        <Link
          href="/dashboard/store/projects/new"
          className="px-4 py-2 bg-black text-white rounded-xl text-sm"
        >
          + Төсөл нэмэх
        </Link>
      </div>
      {loading ? (
        <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Одоогоор төсөл байхгүй</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p._id} className="bg-white rounded-xl border p-4">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">{p.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_CLASS[p.status]}`}>
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500">📍 {p.location}</p>
              <p className="text-sm text-gray-500">💰 {p.budget?.toLocaleString()}₮</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
