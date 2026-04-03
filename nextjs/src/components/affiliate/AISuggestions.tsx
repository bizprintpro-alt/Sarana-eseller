'use client';

import { Bot, MessageCircle, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface Suggestion {
  type: 'followup' | 'opportunity' | 'tip';
  title: string;
  desc: string;
  action?: string;
  time?: string;
  priority: 'high' | 'medium' | 'low';
}

const SUGGESTIONS: Suggestion[] = [
  {
    type: 'followup',
    title: '2 хэрэглэгч сонирхоод орхисон',
    desc: 'Сүүлийн 48 цагт 2 хүн таны линкээр орж сагсанд бараа хийсэн боловч худалдан аваагүй. Тэдэнд мессеж илгээвэл үр дүнтэй.',
    action: 'Мессеж бичих',
    time: '2 цагийн өмнө',
    priority: 'high',
  },
  {
    type: 'opportunity',
    title: 'TikTok суваг 45% өссөн',
    desc: 'Энэ долоо хоногт TikTok-оос хамгийн өндөр хөрвүүлэлт ирж байна. Тус сувагт илүү их контент оруулах нь зүйтэй.',
    action: 'Контент санаа авах',
    time: 'Өнөөдөр',
    priority: 'medium',
  },
  {
    type: 'tip',
    title: 'Оройн 19-21 цагт хамгийн идэвхтэй',
    desc: 'Таны followers оройн 7-9 цагийн хооронд хамгийн идэвхтэй. Энэ цагуудад нийтлэл оруулбал хүрэх хүн илүү байна.',
    priority: 'low',
  },
];

const PRIORITY_STYLES = {
  high: { bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500', text: 'text-red-700' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500', text: 'text-amber-700' },
  low: { bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500', text: 'text-blue-700' },
};

const TYPE_ICONS = {
  followup: MessageCircle,
  opportunity: Sparkles,
  tip: Bot,
};

export default function AISuggestions() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
        <h3 className="font-bold text-[#0F172A] text-sm flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#6366F1]" />
          AI Зөвлөгөө
        </h3>
        <span className="text-[10px] font-bold text-[#6366F1] bg-[#EEF2FF] px-2 py-0.5 rounded-full uppercase tracking-wider">
          Smart
        </span>
      </div>

      <div className="divide-y divide-[#F8FAFC]">
        {SUGGESTIONS.map((s, i) => {
          const style = PRIORITY_STYLES[s.priority];
          const Icon = TYPE_ICONS[s.type];

          return (
            <div key={i} className="px-6 py-4 hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" style={{ color: style.dot.replace('bg-', '') }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    <h4 className="text-sm font-bold text-[#0F172A]">{s.title}</h4>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed mb-2">{s.desc}</p>
                  <div className="flex items-center gap-3">
                    {s.action && (
                      <button className="text-xs font-bold text-[#6366F1] bg-[#EEF2FF] px-3 py-1.5 rounded-lg hover:bg-[#6366F1] hover:text-white transition-all border-none cursor-pointer flex items-center gap-1">
                        {s.action} <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {s.time && (
                      <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
