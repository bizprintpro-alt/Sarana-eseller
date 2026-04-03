'use client';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="h-48 bg-[#F5F5F5] animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-[#F5F5F5] rounded-full w-1/3 animate-pulse" />
        <div className="h-4 bg-[#F5F5F5] rounded-full w-4/5 animate-pulse" />
        <div className="h-3 bg-[#F5F5F5] rounded-full w-1/2 animate-pulse" />
        <div className="h-5 bg-[#F5F5F5] rounded-full w-2/5 animate-pulse" />
      </div>
    </div>
  );
}

export function ModalSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-[#F5F5F5] rounded-t-2xl" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-[#F5F5F5] rounded-full w-1/4" />
        <div className="h-6 bg-[#F5F5F5] rounded-full w-3/4" />
        <div className="h-4 bg-[#F5F5F5] rounded-full w-1/3" />
        <div className="h-8 bg-[#F5F5F5] rounded-full w-1/2" />
        <div className="space-y-2 pt-4">
          <div className="h-3 bg-[#F5F5F5] rounded-full w-full" />
          <div className="h-3 bg-[#F5F5F5] rounded-full w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-[#F5F5F5] rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-[#F5F5F5] rounded-2xl" />
      <div className="h-48 bg-[#F5F5F5] rounded-2xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-10 bg-[#F8FAFC] border-b border-gray-100" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50">
          <div className="w-8 h-8 bg-[#F5F5F5] rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-[#F5F5F5] rounded-full w-1/3" />
            <div className="h-2 bg-[#F5F5F5] rounded-full w-1/5" />
          </div>
          <div className="h-3 bg-[#F5F5F5] rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}
