"use client";

import Link from "next/link";

interface LiveBadgeProps {
  isLive?: boolean;
  currentLiveId?: string | null;
  size?: "sm" | "md";
}

export default function LiveBadge({ isLive, currentLiveId, size = "sm" }: LiveBadgeProps) {
  if (!isLive) return null;

  const badge = (
    <span
      className={`inline-flex items-center gap-1 bg-red-600 text-white font-bold rounded-full ${
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      LIVE
    </span>
  );

  if (currentLiveId) {
    return (
      <Link href={`/live/${currentLiveId}`} className="absolute top-2 left-2 z-10">
        {badge}
      </Link>
    );
  }

  return <span className="absolute top-2 left-2 z-10">{badge}</span>;
}
