'use client';

import { useEffect } from 'react';
import { Trophy, ShoppingBag, Flame, Star, Wallet, Users, Radio, Mountain } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy, ShoppingBag, Flame, Star, Wallet, Users, Radio, Mountain,
};

interface Props {
  achievement: { name: string; points: number; icon: string } | null;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: Props) {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  const Icon = ICON_MAP[achievement.icon] || Trophy;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3 rounded-xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 px-5 py-3 shadow-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-yellow-800">🏆 Амжилт нээгдлээ!</p>
          <p className="text-sm font-medium text-yellow-700">{achievement.name}</p>
          <p className="text-xs text-yellow-600">+{achievement.points.toLocaleString()} оноо</p>
        </div>
        <button onClick={onClose} className="ml-2 text-yellow-400 hover:text-yellow-600 text-lg leading-none">&times;</button>
      </div>
    </div>
  );
}
