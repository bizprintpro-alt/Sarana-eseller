'use client';

import { useState, useEffect } from 'react';
import { Brain, AlertTriangle, Check, X, ChevronDown, ChevronUp, Loader2, Zap } from 'lucide-react';

interface AiTask {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface Insight {
  id: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  evidence: Record<string, unknown> | null;
  suggestion: string | null;
  impact: string | null;
  effort: string | null;
  status: string;
  createdAt: string;
  tasks: AiTask[];
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  CRITICAL: { color: '#DC2626', bg: 'rgba(220,38,38,0.08)', label: 'Яаралтай' },
  HIGH:     { color: '#D97706', bg: 'rgba(245,158,11,0.08)', label: 'Өндөр' },
  MEDIUM:   { color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  label: 'Дунд' },
  LOW:      { color: '#6B7280', bg: 'rgba(107,114,128,0.08)', label: 'Бага' },
};

const TYPE_LABELS: Record<string, string> = {
  BUG: '🐛 Алдаа', PERFORMANCE: '⚡ Гүйцэтгэл', UX_ISSUE: '🤔 UX асуудал',
  SECURITY: '🔒 Аюулгүй байдал', DATA_QUALITY: '📊 Өгөгдлийн чанар',
  FEATURE_REQUEST: '✨ Шинэ функц', OPTIMIZATION: '🔧 Сайжруулалт',
  SYSTEM_HEALTH: '💚 Эрүүл мэнд',
};

export default function AiDashboardPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [stats, setStats] = useState({ pending: 0, critical: 0, approved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/ai', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.insights) setInsights(data.insights);
      if (data.stats) setStats(data.stats);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const runScan = async () => {
    setScanning(true);
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/admin/ai/scan', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      await fetchData();
    } catch {}
    setScanning(false);
  };

  const approveInsight = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/ai/${id}/approve`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    fetchData();
  };

  const rejectInsight = async (id: string, reason: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/ai/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ reason }),
    });
    fetchData();
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #CC785C 0%, #8B4513 100%)' }}>
              <Brain size={22} color="#FFF" />
            </div>
            <div>
              <h1 className="text-white text-lg font-black">Claude — Системийн хөгжүүлэгч</h1>
              <p className="text-white/35 text-xs mt-0.5">Anthropic Claude Sonnet 4.6 · 7 хоног бүр шинжилнэ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats.critical > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
                {stats.critical} яаралтай
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706', border: '1px solid rgba(245,158,11,0.2)' }}>
              {stats.pending} шинэ санал
            </span>
            <button onClick={runScan} disabled={scanning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition"
              style={{ background: scanning ? 'var(--esl-bg-elevated)' : 'var(--esl-bg-card)', color: '#A0A0A0', borderColor: '#2A2A2A' }}>
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              {scanning ? 'Шинжилж байна...' : 'Шинжилгээ эхлүүлэх'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Нийт санал', value: stats.total, color: '#FFF' },
            { label: 'Шинэ (хүлээгдэж)', value: stats.pending, color: '#D97706' },
            { label: 'Яаралтай', value: stats.critical, color: '#DC2626' },
            { label: 'Зөвшөөрсөн', value: stats.approved, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="bg-dash-card border border-dash-border rounded-xl p-4">
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{s.label}</div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Insights list */}
        {loading ? (
          <div className="text-center py-16 text-white/30">Ачааллаж байна...</div>
        ) : insights.length === 0 ? (
          <div className="text-center py-16">
            <Brain size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/30 text-sm">Одоогоор санал байхгүй байна</p>
            <p className="text-white/20 text-xs mt-1">"Шинжилгээ эхлүүлэх" товч дарж Claude-д системийг шалгуулна уу</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map(insight => {
              const cfg = PRIORITY_CONFIG[insight.priority] || PRIORITY_CONFIG.MEDIUM;
              const isExpanded = expandedId === insight.id;

              return (
                <div key={insight.id} className="bg-dash-card border border-dash-border rounded-xl overflow-hidden"
                  style={{ borderLeft: `4px solid ${cfg.color}` }}>
                  {/* Header */}
                  <div className="px-5 py-4 cursor-pointer flex items-start gap-3"
                    onClick={() => setExpandedId(isExpanded ? null : insight.id)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        <span className="text-xs text-white/40">{TYPE_LABELS[insight.type] || insight.type}</span>
                        {insight.impact && <span className="text-xs text-white/30">· {insight.impact}</span>}
                        {insight.effort && <span className="text-xs text-white/30">· ⏱ {insight.effort}</span>}
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{insight.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {isExpanded ? insight.description : insight.description.slice(0, 120) + (insight.description.length > 120 ? '...' : '')}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-white/30 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-white/30 flex-shrink-0 mt-1" />}
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="px-5 pb-4 border-t border-dash-border pt-3 space-y-3">
                      {/* Suggestion */}
                      {insight.suggestion && (
                        <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-3">
                          <p className="text-[10px] font-semibold text-blue-400 mb-1">Claude-ийн санал</p>
                          <p className="text-xs text-white/60 leading-relaxed">{insight.suggestion}</p>
                        </div>
                      )}

                      {/* Evidence */}
                      {insight.evidence && (
                        <div>
                          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Баримт нотлох мэдээлэл</p>
                          <pre className="bg-dash-elevated border border-dash-border rounded-lg p-3 text-[10px] font-mono text-white/60 overflow-auto max-h-40">
                            {JSON.stringify(insight.evidence, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Tasks */}
                      {insight.tasks.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Хийгдэх ажлууд</p>
                          {insight.tasks.map((t, i) => (
                            <div key={t.id} className="flex gap-2 py-1.5 border-b border-white/5 last:border-0 text-xs text-white/50">
                              <span className="text-white/20 w-4">{i + 1}.</span>
                              <span>{t.title}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {insight.status === 'PENDING' && (
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => approveInsight(insight.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border-none cursor-pointer"
                            style={{ background: '#E8242C', color: '#FFF' }}>
                            <Check size={14} /> Зөвшөөрч хэрэгжүүлэх
                          </button>
                          <button onClick={() => {
                            const reason = prompt('Татгалзах шалтгаан:');
                            if (reason !== null) rejectInsight(insight.id, reason);
                          }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                            style={{ background: 'none', border: '1px solid #2A2A2A', color: '#777' }}>
                            <X size={14} /> Татгалзах
                          </button>
                        </div>
                      )}

                      {insight.status === 'APPROVED' && (
                        <div className="flex items-center gap-2 text-xs text-green-400">
                          <Check size={14} /> Зөвшөөрөгдсөн — хэрэгжүүлж байна
                        </div>
                      )}

                      {insight.status === 'REJECTED' && (
                        <div className="flex items-center gap-2 text-xs text-red-400">
                          <X size={14} /> Татгалзсан
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
