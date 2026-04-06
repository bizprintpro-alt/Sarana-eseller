'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';
import { Save, Plus, X, Eye, EyeOff, CreditCard, Megaphone, BarChart3, Columns3, LogIn } from 'lucide-react';

interface SiteSettings {
  announcementBar: { text: string; bgColor: string; textColor: string; link: string; isVisible: boolean };
  statsBar: { icon: string; number: string; label: string }[];
  footerColumns: { title: string; links: { label: string; href: string }[] }[];
  paymentIcons: { qpay: boolean; visa: boolean; mastercard: boolean; socialpay: boolean };
  copyrightText: string;
  loginPage: {
    heroTitle: string; heroSubtitle: string; heroBgImage: string;
    buttonColor: string; showDanLogin: boolean;
    roles: { icon: string; title: string; desc: string; badge: string }[];
  };
}

const PAYMENT_LABELS: Record<string, string> = { qpay: 'QPay', visa: 'Visa', mastercard: 'Mastercard', socialpay: 'SocialPay' };

export default function SiteSettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/site-settings').then(r => r.json()).then(setSettings);
  }, []);

  const update = (partial: Partial<SiteSettings>) => setSettings(prev => prev ? { ...prev, ...partial } : prev);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch('/api/admin/site-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      toast.show('Хадгалагдлаа!', 'ok');
    } catch { toast.show('Алдаа', 'error'); }
    finally { setSaving(false); }
  };

  if (!settings) return <div className="p-8 text-center" style={{ color: 'var(--esl-text-muted)' }}>Ачааллаж байна...</div>;

  const ann = settings.announcementBar;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--esl-text-primary)' }}>Сайтын тохиргоо</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--esl-text-muted)' }}>Нүүр хуудас, footer, announcement тохируулах</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#E8242C] text-white border-none cursor-pointer hover:bg-[#C41E25] transition">
          <Save className="w-4 h-4" /> {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </div>

      {/* ═══ 1. ANNOUNCEMENT BAR ═══ */}
      <section className="rounded-2xl border p-5" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-[#E8242C]" />
          <h2 className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>Announcement Bar</h2>
          <div className="ml-auto">
            <button onClick={() => update({ announcementBar: { ...ann, isVisible: !ann.isVisible } })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer"
              style={{ background: ann.isVisible ? 'rgba(22,163,74,0.1)' : 'var(--esl-bg-section)', borderColor: ann.isVisible ? 'rgba(22,163,74,0.3)' : 'var(--esl-border)', color: ann.isVisible ? '#16A34A' : 'var(--esl-text-muted)' }}>
              {ann.isVisible ? <><Eye className="w-3 h-3" /> Харагдаж байна</> : <><EyeOff className="w-3 h-3" /> Нуусан</>}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg overflow-hidden mb-4" style={{ background: ann.bgColor }}>
          <p className="text-center py-2 text-xs font-semibold" style={{ color: ann.textColor }}>{ann.text || 'Текст оруулна уу...'}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--esl-text-muted)' }}>Текст</label>
            <input type="text" value={ann.text} onChange={e => update({ announcementBar: { ...ann, text: e.target.value } })}
              className="w-full h-9 px-3 rounded-lg border text-sm outline-none focus:border-[#E8242C]"
              style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--esl-text-muted)' }}>Link (optional)</label>
            <input type="text" value={ann.link} onChange={e => update({ announcementBar: { ...ann, link: e.target.value } })} placeholder="/store"
              className="w-full h-9 px-3 rounded-lg border text-sm outline-none"
              style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--esl-text-muted)' }}>Дэвсгэр өнгө</label>
            <div className="flex gap-2">
              <input type="color" value={ann.bgColor} onChange={e => update({ announcementBar: { ...ann, bgColor: e.target.value } })} className="w-10 h-9 rounded cursor-pointer border-none" />
              <input type="text" value={ann.bgColor} onChange={e => update({ announcementBar: { ...ann, bgColor: e.target.value } })}
                className="flex-1 h-9 px-3 rounded-lg border text-xs font-mono outline-none"
                style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--esl-text-muted)' }}>Текст өнгө</label>
            <div className="flex gap-2">
              {['#FFFFFF', '#000000'].map(c => (
                <button key={c} onClick={() => update({ announcementBar: { ...ann, textColor: c } })}
                  className={`flex-1 h-9 rounded-lg border text-xs font-bold cursor-pointer transition ${ann.textColor === c ? 'border-[#E8242C]' : ''}`}
                  style={{ background: c === '#FFFFFF' ? 'var(--esl-bg-section)' : '#1A1A1A', color: c === '#FFFFFF' ? 'var(--esl-text-primary)' : '#fff', borderColor: ann.textColor === c ? '#E8242C' : 'var(--esl-border)' }}>
                  {c === '#FFFFFF' ? 'Цагаан' : 'Хар'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. STATS BAR ═══ */}
      <section className="rounded-2xl border p-5" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-[#E8242C]" />
          <h2 className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>Stats Bar (3 мөр)</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {settings.statsBar.map((stat, i) => (
            <div key={i} className="rounded-xl border p-3" style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)' }}>
              <input type="text" value={stat.icon} onChange={e => { const s = [...settings.statsBar]; s[i] = { ...s[i], icon: e.target.value }; update({ statsBar: s }); }}
                className="w-full h-8 px-2 rounded-lg border text-center text-lg outline-none mb-2" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }} placeholder="🚚" />
              <input type="text" value={stat.number} onChange={e => { const s = [...settings.statsBar]; s[i] = { ...s[i], number: e.target.value }; update({ statsBar: s }); }}
                className="w-full h-8 px-2 rounded-lg border text-sm font-bold text-center outline-none mb-1" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} placeholder="50,000+" />
              <input type="text" value={stat.label} onChange={e => { const s = [...settings.statsBar]; s[i] = { ...s[i], label: e.target.value }; update({ statsBar: s }); }}
                className="w-full h-8 px-2 rounded-lg border text-xs text-center outline-none" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-muted)' }} placeholder="Хүргэлт" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 3. FOOTER ═══ */}
      <section className="rounded-2xl border p-5" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Columns3 className="w-4 h-4 text-[#E8242C]" />
          <h2 className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>Footer (4 багана)</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {settings.footerColumns.map((col, ci) => (
            <div key={ci} className="rounded-xl border p-3" style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)' }}>
              <input type="text" value={col.title} onChange={e => { const c = [...settings.footerColumns]; c[ci] = { ...c[ci], title: e.target.value }; update({ footerColumns: c }); }}
                className="w-full h-8 px-2 rounded-lg border text-sm font-bold outline-none mb-2"
                style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} placeholder="Гарчиг" />
              {col.links.map((link, li) => (
                <div key={li} className="flex gap-1.5 mb-1">
                  <input type="text" value={link.label} onChange={e => { const c = [...settings.footerColumns]; c[ci].links[li] = { ...c[ci].links[li], label: e.target.value }; update({ footerColumns: c }); }}
                    className="flex-1 h-7 px-2 rounded border text-xs outline-none" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} placeholder="Label" />
                  <input type="text" value={link.href} onChange={e => { const c = [...settings.footerColumns]; c[ci].links[li] = { ...c[ci].links[li], href: e.target.value }; update({ footerColumns: c }); }}
                    className="flex-1 h-7 px-2 rounded border text-xs font-mono outline-none" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-muted)' }} placeholder="/path" />
                  <button onClick={() => { const c = [...settings.footerColumns]; c[ci].links.splice(li, 1); update({ footerColumns: c }); }}
                    className="w-7 h-7 rounded flex items-center justify-center border-none cursor-pointer" style={{ background: 'var(--esl-bg-card-hover)', color: 'var(--esl-text-muted)' }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button onClick={() => { const c = [...settings.footerColumns]; c[ci].links.push({ label: '', href: '' }); update({ footerColumns: c }); }}
                className="flex items-center gap-1 text-[10px] font-semibold mt-1 cursor-pointer border-none bg-transparent" style={{ color: '#E8242C' }}>
                <Plus className="w-3 h-3" /> Нэмэх
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--esl-text-muted)' }}>Copyright текст</label>
          <input type="text" value={settings.copyrightText} onChange={e => update({ copyrightText: e.target.value })}
            className="w-full h-9 px-3 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
        </div>
      </section>

      {/* ═══ 4. PAYMENT ICONS ═══ */}
      <section className="rounded-2xl border p-5" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-[#E8242C]" />
          <h2 className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>Төлбөрийн icon</h2>
        </div>
        <div className="flex gap-3">
          {Object.entries(settings.paymentIcons).map(([key, enabled]) => (
            <button key={key} onClick={() => update({ paymentIcons: { ...settings.paymentIcons, [key]: !enabled } })}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${enabled ? 'border-[#E8242C]' : ''}`}
              style={{ background: enabled ? 'rgba(232,36,44,0.05)' : 'var(--esl-bg-section)', borderColor: enabled ? '#E8242C' : 'var(--esl-border)', color: enabled ? '#E8242C' : 'var(--esl-text-muted)' }}>
              {PAYMENT_LABELS[key]}
            </button>
          ))}
        </div>
      </section>

      {/* ═══ 5. LOGIN PAGE ═══ */}
      {settings.loginPage && (() => {
        const lp = settings.loginPage;
        const updateLp = (partial: Partial<typeof lp>) => update({ loginPage: { ...lp, ...partial } });
        return (
          <section className="rounded-2xl border p-5" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <LogIn className="w-4 h-4 text-[#E8242C]" />
              <h2 className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>Login хуудас</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--esl-text-muted)' }}>Hero гарчиг</label>
                <textarea value={lp.heroTitle} onChange={e => updateLp({ heroTitle: e.target.value })} rows={2}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--esl-text-muted)' }}>Дэд гарчиг</label>
                <textarea value={lp.heroSubtitle} onChange={e => updateLp({ heroSubtitle: e.target.value })} rows={2}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--esl-text-muted)' }}>Товчны өнгө</label>
                <div className="flex gap-2">
                  <input type="color" value={lp.buttonColor} onChange={e => updateLp({ buttonColor: e.target.value })} className="w-10 h-8 rounded cursor-pointer border-none" />
                  <input type="text" value={lp.buttonColor} onChange={e => updateLp({ buttonColor: e.target.value })}
                    className="flex-1 h-8 px-3 rounded-lg border text-xs font-mono outline-none"
                    style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
                </div>
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs" style={{ color: 'var(--esl-text-secondary)' }}>ДАН нэвтрэх харуулах</span>
                  <button onClick={() => updateLp({ showDanLogin: !lp.showDanLogin })}
                    className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors cursor-pointer border-none ${lp.showDanLogin ? 'bg-[#E8242C]' : 'bg-[var(--esl-border)]'}`}>
                    <div className={`w-5 h-5 rounded-full bg-[var(--esl-bg-card)] transition-transform ${lp.showDanLogin ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
            {/* Roles */}
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--esl-text-muted)' }}>4 роллын карт</label>
            <div className="grid grid-cols-2 gap-2">
              {lp.roles.map((role, i) => (
                <div key={i} className="rounded-lg border p-2.5" style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)' }}>
                  <div className="flex gap-2 mb-1">
                    <input type="text" value={role.icon} onChange={e => { const r = [...lp.roles]; r[i] = { ...r[i], icon: e.target.value }; updateLp({ roles: r }); }}
                      className="w-10 h-7 rounded border text-center text-sm outline-none" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }} />
                    <input type="text" value={role.title} onChange={e => { const r = [...lp.roles]; r[i] = { ...r[i], title: e.target.value }; updateLp({ roles: r }); }}
                      className="flex-1 h-7 px-2 rounded border text-xs font-semibold outline-none" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
                  </div>
                  <input type="text" value={role.desc} onChange={e => { const r = [...lp.roles]; r[i] = { ...r[i], desc: e.target.value }; updateLp({ roles: r }); }}
                    className="w-full h-6 px-2 rounded border text-[10px] outline-none mb-1" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-muted)' }} />
                  <input type="text" value={role.badge} onChange={e => { const r = [...lp.roles]; r[i] = { ...r[i], badge: e.target.value }; updateLp({ roles: r }); }}
                    className="w-full h-6 px-2 rounded border text-[10px] outline-none" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-muted)' }} />
                </div>
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
