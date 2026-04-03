'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/shared/Toast';

interface DomainConfig {
  subdomain: string;
  customDomain: string;
  customDomainVerified: boolean;
  sslEnabled: boolean;
}

const DOMAIN_KEY = 'eseller_domain_config';

export default function DomainPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [config, setConfig] = useState<DomainConfig>({
    subdomain: '',
    customDomain: '',
    customDomainVerified: false,
    sslEnabled: true,
  });
  const [editing, setEditing] = useState(false);
  const [subInput, setSubInput] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DOMAIN_KEY);
      if (saved) {
        setConfig(JSON.parse(saved));
      } else {
        const defaultSub = (user?.store?.name || user?.name || 'store').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        setConfig((prev) => ({ ...prev, subdomain: defaultSub }));
        setSubInput(defaultSub);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    setSubInput(config.subdomain);
  }, [config.subdomain]);

  const save = (updates: Partial<DomainConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);
    localStorage.setItem(DOMAIN_KEY, JSON.stringify(next));
    toast.show('✅ Хадгалагдлаа');
  };

  const isValidSub = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subInput) && subInput.length >= 3;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-black text-gray-900">🌐 Домайн нэр</h1>
        <p className="text-sm text-gray-400 mt-0.5">Дэлгүүрийн веб хаягийг тохируулна</p>
      </div>

      <div className="p-8 max-w-3xl space-y-6">

        {/* Current Domain */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">🌐</div>
            <div>
              <div className="text-xs text-gray-500 font-semibold">Одоогийн хаяг</div>
              <div className="text-lg font-black text-gray-900">
                {config.subdomain || 'store'}.eseller.mn
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-green-600 font-semibold">Идэвхтэй</span>
            {config.sslEnabled && (
              <>
                <span className="text-gray-300 mx-1">·</span>
                <span className="text-xs text-gray-400">🔒 SSL идэвхтэй</span>
              </>
            )}
          </div>
        </div>

        {/* ═══ Subdomain ═══ */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Субдомайн</h3>
              <p className="text-xs text-gray-400 mt-0.5">Үнэгүй eseller.mn субдомайн</p>
            </div>
            <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded-md">Үнэгүй</span>
          </div>

          <div className="flex items-center gap-0 rounded-xl border border-gray-200 overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
            <span className="text-sm text-gray-400 bg-gray-50 px-4 py-2.5 border-r border-gray-200 shrink-0">https://</span>
            <input
              value={subInput}
              onChange={(e) => setSubInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 px-3 py-2.5 text-sm font-semibold outline-none border-none"
              placeholder="miiny-delguur"
            />
            <span className="text-sm text-gray-400 bg-gray-50 px-4 py-2.5 border-l border-gray-200 shrink-0">.eseller.mn</span>
          </div>

          {subInput && !isValidSub && (
            <p className="text-xs text-red-500 mt-2">Дор хаяж 3 тэмдэгт, зөвхөн жижиг үсэг, тоо, зураас (-).</p>
          )}

          {subInput !== config.subdomain && (
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => isValidSub && save({ subdomain: subInput })}
                disabled={!isValidSub}
                className="bg-brand text-white px-5 py-2 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Хадгалах
              </button>
              <button
                onClick={() => setSubInput(config.subdomain)}
                className="text-gray-400 text-xs font-semibold bg-transparent border-none cursor-pointer hover:text-gray-600"
              >
                Цуцлах
              </button>
            </div>
          )}
        </div>

        {/* ═══ Custom Domain ═══ */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Хувийн домайн</h3>
              <p className="text-xs text-gray-400 mt-0.5">Өөрийн домайн холбох (жишээ: minii-delguur.mn)</p>
            </div>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-1 rounded-md">Pro багц</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={config.customDomain}
              onChange={(e) => setConfig({ ...config, customDomain: e.target.value, customDomainVerified: false })}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
              placeholder="minii-delguur.mn"
            />
            <button
              onClick={() => {
                if (config.customDomain) {
                  save({ customDomain: config.customDomain, customDomainVerified: false });
                }
              }}
              disabled={!config.customDomain}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              Холбох
            </button>
          </div>

          {config.customDomain && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                {config.customDomainVerified ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-green-600 font-bold">Баталгаажсан</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs text-amber-600 font-bold">DNS тохиргоо хүлээгдэж байна</span>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-3">
                Домайнаа холбохын тулд дараах DNS бичлэгийг нэмнэ үү:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-200">
                      <th className="text-left py-2 px-3">Төрөл</th>
                      <th className="text-left py-2 px-3">Нэр</th>
                      <th className="text-left py-2 px-3">Утга</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3 font-mono font-bold">CNAME</td>
                      <td className="py-2 px-3 font-mono">{config.customDomain}</td>
                      <td className="py-2 px-3 font-mono text-brand">cname.eseller.mn</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold">TXT</td>
                      <td className="py-2 px-3 font-mono">_eseller-verify</td>
                      <td className="py-2 px-3 font-mono text-brand">{config.subdomain}-verify-{Date.now().toString(36).slice(-6)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => {
                  save({ customDomainVerified: true });
                  toast.show('✅ Домайн баталгаажлаа!');
                }}
                className="mt-3 bg-white text-gray-700 px-4 py-2 rounded-lg text-xs font-bold border border-gray-200 cursor-pointer hover:border-brand hover:text-brand transition-all"
              >
                🔄 Шалгах
              </button>
            </div>
          )}
        </div>

        {/* ═══ SSL ═══ */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">🔒 SSL Гэрчилгээ</h3>
              <p className="text-xs text-gray-400 mt-0.5">Автоматаар үнэгүй Let&apos;s Encrypt SSL</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.sslEnabled}
                onChange={(e) => save({ sslEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
            </label>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-700">
          <strong>💡 Мэдээлэл:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-blue-600">
            <li>Субдомайн (store.eseller.mn) бүх багцад үнэгүй</li>
            <li>Хувийн домайн холбох нь Pro багцаас дээш боломжтой</li>
            <li>DNS өөрчлөлт хүчин төгөлдөр болоход 24-48 цаг шаардагдана</li>
            <li>SSL гэрчилгээ автоматаар үнэгүй олгогдоно</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
