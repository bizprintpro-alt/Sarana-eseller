'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, roleHome } from '@/lib/auth';
import { AuthAPI } from '@/lib/api';
import { useToast } from '@/components/shared/Toast';
import EsellerLogo from '@/components/shared/EsellerLogo';
import MobileNav from '@/components/shared/MobileNav';

const ROLES = [
  { value: 'seller', icon: '🏪', label: 'Дэлгүүр эзэн', desc: 'Бараагаа байршуулж зарлуул', badge: '70–85%', color: 'border-green-500/20' },
  { value: 'affiliate', icon: '📢', label: 'Борлуулагч', desc: 'Линкээр зарж комисс ол', badge: '10–20%', color: 'border-amber-500/20' },
  { value: 'buyer', icon: '🛍️', label: 'Худалдан авагч', desc: 'Бараа худалдаж авах', badge: 'Үнэгүй', color: 'border-blue-500/20' },
  { value: 'delivery', icon: '🚚', label: 'Жолооч', desc: 'Захиалга хүргэж орлого ол', badge: 'Хүргэлт бүрт', color: 'border-cyan-500/20' },
];

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('seller');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPw, setShowPw] = useState(false);

  const { login, isLoggedIn, user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (isLoggedIn && user) router.replace(roleHome(user.role));
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    if (window.location.hash === '#register') setMode('register');
  }, []);

  const pwStrength = (v: string) => {
    if (!v) return { score: 0, label: '', color: '' };
    const strong = v.length >= 10 && /[A-Z]/.test(v) && /\d/.test(v);
    const med = v.length >= 6 && (/[A-Z]/.test(v) || /\d/.test(v));
    if (strong) return { score: 3, label: '— Хүчтэй', color: '#059669' };
    if (med) return { score: 2, label: '— Дунд', color: '#F59E0B' };
    return { score: 1, label: '— Сул', color: '#EF4444' };
  };

  const pw = pwStrength(password);

  const doLogin = async () => {
    if (!email || !password) { setError('Бүх талбарыг бөглөнө үү'); return; }
    setLoading(true); setError('');
    try {
      const data = await AuthAPI.login(email, password);
      if (data.token) {
        login(data.token, data.user);
        setSuccess('Амжилттай нэвтэрлээ!');
        setTimeout(() => router.push(roleHome(data.user.role)), 700);
      }
    } catch (e: any) {
      setError(e.message || 'Холболтын алдаа');
    } finally { setLoading(false); }
  };

  const doRegister = async () => {
    if (!name || !email || !password) { setError('Бүх талбарыг бөглөнө үү'); return; }
    if (password.length < 6) { setError('Нууц үг дор хаяж 6 тэмдэгт'); return; }
    setLoading(true); setError('');
    try {
      const data = await AuthAPI.register(name, email, password, role);
      if (data.token) {
        login(data.token, data.user);
        setSuccess('Бүртгэл амжилттай!');
        setTimeout(() => router.push(roleHome(data.user.role)), 700);
      }
    } catch (e: any) {
      setError(e.message || 'Холболтын алдаа');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL - Desktop only */}
      <div
        className="hidden lg:flex flex-col justify-between w-[48%] p-10 relative overflow-hidden"
        style={{ background: 'var(--esl-bg-page)', color: 'var(--esl-text-primary)' }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-brand/8 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[200px] h-[200px] rounded-full bg-blue-600/6 blur-[80px]" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 no-underline mb-12">
            <EsellerLogo size={26} />
            <span className="text-xl font-black" style={{ color: 'var(--esl-text-primary)' }}>eseller<em className="text-brand not-italic">.mn</em></span>
          </Link>

          <h2 className="text-4xl font-black leading-[1.1] mb-4">
            Борлуулалт<br /><em className="text-brand not-italic">хамтдаа л байна.</em>
          </h2>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--esl-text-muted)' }}>
            Барааны эзэн дангаараа борлуулж чадахгүй. Борлуулагчтай нэгдэж, хамтдаа ашиг ол.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            { ic: '🏪', t: 'Дэлгүүр эзэн', d: 'Бараагаа байршуул.', earn: '70–85%' },
            { ic: '📢', t: 'Борлуулагч', d: 'Сүлжээгээр зарж комисс ол.', earn: '10–20%' },
            { ic: '🛍️', t: 'Худалдан авагч', d: 'Хамгийн сайн бараа, шилдэг үнэ.', earn: '2–4ц хүргэлт' },
            { ic: '🚚', t: 'Жолооч', d: 'Цагаа тохируулж орлого ол.', earn: 'Хүргэлт бүрт' },
          ].map((r) => (
            <div key={r.t} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
              <span className="text-xl">{r.ic}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>{r.t}</h4>
                <p className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>{r.d}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ color: 'var(--esl-text-muted)', background: 'var(--esl-bg-elevated)' }}>{r.earn}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'var(--esl-text-muted)' }}>
          &copy; 2026 eseller.mn &middot; Улаанбаатар, Монгол
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: 'var(--esl-bg-page)' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 no-underline mb-8 lg:hidden justify-center">
            <EsellerLogo size={24} />
            <span className="text-lg font-black" style={{ color: 'var(--esl-text-primary)' }}>eseller<em className="text-brand not-italic">.mn</em></span>
          </Link>

          {/* Tabs */}
          <div className="flex rounded-2xl p-1 shadow-sm mb-8" style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${
                mode === 'login' ? 'bg-brand text-white shadow-md' : 'bg-transparent'
              }`}
              style={mode !== 'login' ? { color: 'var(--esl-text-muted)' } : undefined}
            >
              Нэвтрэх
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${
                mode === 'register' ? 'bg-brand text-white shadow-md' : 'bg-transparent'
              }`}
              style={mode !== 'register' ? { color: 'var(--esl-text-muted)' } : undefined}
            >
              Бүртгүүлэх
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mb-4">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm font-semibold px-4 py-3 rounded-xl mb-4">
              ✅ {success}
            </div>
          )}

          {mode === 'login' ? (
            <>
              <div className="text-xl font-black mb-1" style={{ color: 'var(--esl-text-primary)' }}>Сайн уу! 👋</div>
              <div className="text-sm mb-6" style={{ color: 'var(--esl-text-muted)' }}>Данс руугаа нэвтрэх</div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--esl-text-muted)' }}>Имэйл хаяг</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(204,0,0,.12)] transition"
                    style={{ border: '1.5px solid var(--esl-border)', background: 'var(--esl-bg-card)', color: 'var(--esl-text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--esl-text-muted)' }}>Нууц үг</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(204,0,0,.12)] transition pr-12"
                      style={{ border: '1.5px solid var(--esl-border)', background: 'var(--esl-bg-card)', color: 'var(--esl-text-primary)' }}
                      onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                    />
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-sm"
                      tabIndex={-1}
                    >
                      {showPw ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={doLogin}
                  disabled={loading}
                  className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-base border-none cursor-pointer shadow-[0_2px_8px_rgba(204,0,0,.25)] hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Нэвтрэх...' : 'Нэвтрэх'}
                </button>
              </div>

              {/* DAN OAuth separator and button */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px" style={{ background: 'var(--esl-border)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--esl-text-muted)' }}>эсвэл</span>
                <div className="flex-1 h-px" style={{ background: 'var(--esl-border)' }} />
              </div>

              <a
                href="/api/auth/dan"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base text-white border-none cursor-pointer transition-all hover:opacity-90 no-underline"
                style={{ background: '#2563EB' }}
              >
                🇲🇳 ДАН-аар нэвтрэх
              </a>
              <p className="text-center text-xs mt-2" style={{ color: 'var(--esl-text-muted)' }}>
                E-Mongolia иргэний нэвтрэлт
              </p>

              <p className="text-center text-sm mt-6" style={{ color: 'var(--esl-text-muted)' }}>
                Данс байхгүй юу?{' '}
                <button onClick={() => setMode('register')} className="text-brand font-bold bg-transparent border-none cursor-pointer">
                  Бүртгүүлэх
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-xl font-black mb-1" style={{ color: 'var(--esl-text-primary)' }}>Нэгдэцгээе! 🚀</div>
              <div className="text-sm mb-6" style={{ color: 'var(--esl-text-muted)' }}>Та ямар үүргээр нэгдэх вэ?</div>

              <div className="space-y-4">
                {/* Role selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--esl-text-muted)' }}>Үүрэг сонгох</label>
                  <div className="space-y-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer transition-all ${
                          role === r.value
                            ? 'shadow-[0_0_0_3px_rgba(204,0,0,.12)]'
                            : 'hover:opacity-80'
                        }`}
                        style={{
                          background: 'var(--esl-bg-card)',
                          border: role === r.value ? '1.5px solid var(--brand, #CC0000)' : '1.5px solid var(--esl-border)',
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{ border: role === r.value ? '2px solid var(--brand, #CC0000)' : '2px solid var(--esl-border)' }}
                        >
                          {role === r.value && <div className="w-2 h-2 rounded-full bg-brand" />}
                        </div>
                        <span className="text-lg">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>{r.label}</h5>
                          <p className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>{r.desc}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ color: 'var(--esl-text-muted)', background: 'var(--esl-bg-elevated)' }}>
                          {r.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--esl-text-muted)' }}>Бүтэн нэр</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Таны нэр"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(204,0,0,.12)] transition"
                    style={{ border: '1.5px solid var(--esl-border)', background: 'var(--esl-bg-card)', color: 'var(--esl-text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--esl-text-muted)' }}>Имэйл хаяг</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(204,0,0,.12)] transition"
                    style={{ border: '1.5px solid var(--esl-border)', background: 'var(--esl-bg-card)', color: 'var(--esl-text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--esl-text-muted)' }}>
                    Нууц үг{' '}
                    {password && <span style={{ color: pw.color }} className="text-[11px] font-medium normal-case tracking-normal">{pw.label}</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Дор хаяж 6 тэмдэгт"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(204,0,0,.12)] transition pr-12"
                      style={{ border: '1.5px solid var(--esl-border)', background: 'var(--esl-bg-card)', color: 'var(--esl-text-primary)' }}
                      onKeyDown={(e) => e.key === 'Enter' && doRegister()}
                    />
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-sm"
                      tabIndex={-1}
                    >
                      {showPw ? '🙈' : '👁'}
                    </button>
                  </div>
                  {password && (
                    <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--esl-bg-elevated)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${(pw.score / 3) * 100}%`, background: pw.color }}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={doRegister}
                  disabled={loading}
                  className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-base border-none cursor-pointer shadow-[0_2px_8px_rgba(204,0,0,.25)] hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Бүртгүүлж байна...' : 'Бүртгүүлэх →'}
                </button>
              </div>

              {/* DAN OAuth separator and button */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px" style={{ background: 'var(--esl-border)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--esl-text-muted)' }}>эсвэл</span>
                <div className="flex-1 h-px" style={{ background: 'var(--esl-border)' }} />
              </div>

              <a
                href="/api/auth/dan"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base text-white border-none cursor-pointer transition-all hover:opacity-90 no-underline"
                style={{ background: '#2563EB' }}
              >
                🇲🇳 ДАН-аар нэвтрэх
              </a>
              <p className="text-center text-xs mt-2" style={{ color: 'var(--esl-text-muted)' }}>
                E-Mongolia иргэний нэвтрэлт
              </p>

              <p className="text-center text-sm mt-6" style={{ color: 'var(--esl-text-muted)' }}>
                Данс байгаа юу?{' '}
                <button onClick={() => setMode('login')} className="text-brand font-bold bg-transparent border-none cursor-pointer">
                  Нэвтрэх
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
