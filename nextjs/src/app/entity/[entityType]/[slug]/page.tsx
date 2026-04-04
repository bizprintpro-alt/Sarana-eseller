'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ENTITY_LABELS, TIER_CONFIG, DEMO_FEED, type EntityType, type FeedItemData } from '@/lib/types/entity';
import EsellerLogo from '@/components/shared/EsellerLogo';
import MobileNav from '@/components/shared/MobileNav';
import {
  MapPin, Phone, Star, Shield,
  Calendar, Eye, MessageCircle, Clock, Users, Award,
} from 'lucide-react';

/* Demo fallback */
const DEMO_ENTITIES: Record<string, Record<string, Record<string, unknown>>> = {
  agent: {
    'erdenbat': { name: 'Б. Эрдэнэбат', slug: 'erdenbat', profilePhoto: null, coverImage: null, bio: 'Үл хөдлөх хөрөнгийн чиглэлээр 12 жил ажилласан мэргэжлийн агент.', experience: 12, specialties: ['Орон сууц', 'Оффис', 'Газар'], licenseNumber: 'RE-2024-0142', phone: '9911-2233', district: 'СБД', isVerified: true, rating: 4.9, reviewCount: 87 },
  },
  company: {
    'mongolian-properties': { name: 'Монголиан Пропертиз', slug: 'mongolian-properties', logo: null, coverImage: null, description: 'Шинэ барилга, орон сууцны төсөл хөгжүүлэгч.', foundedYear: 2010, employeeCount: 85, licenseNumber: 'BC-2024-0058', awards: ['Шилдэг барилгын компани 2024'], phone: '7012-3456', district: 'ХУД', isVerified: true, rating: 4.7, reviewCount: 124 },
  },
  auto_dealer: {
    'autocity': { name: 'AutoCity Mongolia', slug: 'autocity', logo: null, coverImage: null, description: 'Шинэ болон хуучин автомашин импортлогч, худалдаа.', brands: ['Toyota', 'Hyundai', 'Kia', 'Honda'], phone: '7700-8899', district: 'БЗД', isVerified: true, rating: 4.5, reviewCount: 203 },
  },
  service: {
    'digitalmn': { name: 'DigitalMN Studio', slug: 'digitalmn', logo: null, coverImage: null, description: 'Вэб сайт, аппликейшн хөгжүүлэлт, дижитал маркетинг.', serviceTypes: ['Вэб хөгжүүлэлт', 'Аппликейшн', 'UI/UX дизайн'], phone: '8800-1122', isVerified: false, rating: 4.6, reviewCount: 45 },
  },
};

const TAB_CONFIG: Record<string, { key: string; label: string }[]> = {
  agent: [{ key: 'listings', label: 'Зарууд' }, { key: 'about', label: 'Тухай' }, { key: 'reviews', label: 'Үнэлгээ' }],
  company: [{ key: 'projects', label: 'Төслүүд' }, { key: 'gallery', label: 'Галлерей' }, { key: 'about', label: 'Тухай' }, { key: 'docs', label: 'Баримт' }],
  auto_dealer: [{ key: 'vehicles', label: 'Машинууд' }, { key: 'about', label: 'Тухай' }, { key: 'reviews', label: 'Үнэлгээ' }],
  service: [{ key: 'portfolio', label: 'Портфолио' }, { key: 'services', label: 'Үйлчилгээ' }, { key: 'about', label: 'Тухай' }, { key: 'reviews', label: 'Үнэлгээ' }],
};

export default function EntityProfilePage() {
  const params = useParams();
  const entityType = params.entityType as string;
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [entity, setEntity] = useState<Record<string, any> | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from DB, fallback to demo
  useEffect(() => {
    setLoading(true);
    fetch(`/api/entity/${entityType}/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.entity) {
          setEntity(data.entity);
          setFeedItems(data.feedItems || []);
        } else {
          // Demo fallback
          const demoEntity = DEMO_ENTITIES[entityType]?.[slug] || null;
          setEntity(demoEntity);
          setFeedItems(DEMO_FEED.filter(f => f.entityType === entityType));
        }
      })
      .catch(() => {
        const demoEntity = DEMO_ENTITIES[entityType]?.[slug] || null;
        setEntity(demoEntity);
        setFeedItems(DEMO_FEED.filter(f => f.entityType === entityType));
      })
      .finally(() => setLoading(false));

    // Set default tab
    const tabs = TAB_CONFIG[entityType];
    if (tabs?.length) setActiveTab(tabs[0].key);
  }, [entityType, slug]);

  const entityInfo = ENTITY_LABELS[entityType as EntityType] || { label: entityType, emoji: '📋' };
  const tabs = TAB_CONFIG[entityType] || [{ key: 'about', label: 'Тухай' }];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">⏳</div>
          <p className="text-sm text-gray-400">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h2 className="text-lg font-bold text-gray-900">Олдсонгүй</h2>
          <Link href="/shops" className="text-sm text-indigo-600 mt-2 inline-block">← Бүх жагсаалт руу</Link>
        </div>
      </div>
    );
  }

  const e = entity;
  const name = (e.name as string) || '';
  const coverImage = e.coverImage;
  const logo = (e.logo || e.profilePhoto);
  const isVerified = e.isVerified;
  const rating = e.rating;
  const reviewCount = e.reviewCount;
  const district = e.district;
  const phone = e.phone;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto h-14 flex items-center px-4 gap-3">
          <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
            <EsellerLogo size={22} />
            <span className="text-base font-black text-[#1A1A2E]">eseller<span className="text-[#E31E24]">.mn</span></span>
          </Link>
          <div className="flex-1" />
          <Link href="/shops" className="text-xs font-semibold text-gray-500 no-underline hover:text-indigo-600 transition">Бүх жагсаалт</Link>
        </div>
      </nav>

      {/* Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-indigo-600 to-purple-700 relative">
        {coverImage && <img src={coverImage} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Profile Card */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0 -mt-12 border-4 border-white">
              {logo ? <img src={logo} alt="" className="w-full h-full rounded-2xl object-cover" /> : name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-gray-900">{name}</h1>
                {isVerified && <Shield className="w-5 h-5 text-blue-500 fill-blue-500" />}
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                  {entityInfo.emoji} {entityInfo.label}
                </span>
              </div>

              {rating != null && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn('w-3.5 h-3.5', i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{rating} ({reviewCount || 0} үнэлгээ)</span>
                </div>
              )}

              {district && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" /> {district}
                </div>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              {phone && (
                <button onClick={() => setShowPhone(!showPhone)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition border-none cursor-pointer">
                  <Phone className="w-4 h-4" />
                  {showPhone ? phone : 'Дугаар харах'}
                </button>
              )}
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition cursor-pointer">
                <MessageCircle className="w-4 h-4" /> Чат
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition',
                activeTab === tab.key ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-50')}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {/* About tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            {e.bio && <p className="text-sm text-gray-700 leading-relaxed">{e.bio}</p>}
            {e.description && <p className="text-sm text-gray-700 leading-relaxed">{e.description}</p>}

            {e.experience && (
              <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-indigo-500" /> <span className="font-semibold">{e.experience} жилийн туршлага</span></div>
            )}
            {e.licenseNumber && (
              <div className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-green-500" /> <span>Лиценз: <strong>{e.licenseNumber}</strong></span></div>
            )}
            {e.foundedYear && (
              <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-indigo-500" /> <span>Үүсгэн байгуулагдсан: <strong>{e.foundedYear}</strong></span></div>
            )}
            {e.employeeCount && (
              <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-indigo-500" /> <span>Ажилтны тоо: <strong>{e.employeeCount}</strong></span></div>
            )}

            {(e.specialties)?.length && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Мэргэшсэн чиглэл</h4>
                <div className="flex flex-wrap gap-2">
                  {(e.specialties).map((s: string) => (
                    <span key={s} className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {(e.brands)?.length && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Брэндүүд</h4>
                <div className="flex flex-wrap gap-2">
                  {(e.brands).map((b: string) => (
                    <span key={b} className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
            )}
            {(e.serviceTypes)?.length && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Үйлчилгээнүүд</h4>
                <div className="flex flex-wrap gap-2">
                  {(e.serviceTypes).map((s: string) => (
                    <span key={s} className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {(e.awards)?.length && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Шагнал & Гэрчилгээ</h4>
                {(e.awards).map((a: string) => (
                  <div key={a} className="flex items-center gap-2 text-sm mb-1"><Award className="w-3.5 h-3.5 text-amber-500" /> {a}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feed items tab */}
        {(activeTab === 'listings' || activeTab === 'projects' || activeTab === 'vehicles' || activeTab === 'portfolio' || activeTab === 'services') && (
          <div className="space-y-4">
            {feedItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3 opacity-30">📋</div>
                <p className="text-sm text-gray-400 font-semibold">Зар байхгүй байна</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {feedItems.map(item => {
                  const tierConf = TIER_CONFIG[item.tier] || TIER_CONFIG.normal;
                  const disc = item.originalPrice && item.price ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;
                  return (
                    <div key={item.id} className={cn('bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all', tierConf.bgColor, item.tier === 'vip' && 'border-2 col-span-2')}>
                      <div className={cn('bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center', item.tier === 'vip' ? 'h-48' : 'h-36')}>
                        {item.images?.[0]
                          ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                          : <span className="text-4xl">{ENTITY_LABELS[item.entityType as EntityType]?.emoji || '📦'}</span>}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          {item.tier !== 'normal' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tierConf.color + '15', color: tierConf.color }}>
                              {tierConf.badge} {tierConf.label}
                            </span>
                          )}
                          {item.district && <span className="text-[10px] text-gray-400">{item.district}</span>}
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                        {item.price != null && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-[#E31E24]">{item.price.toLocaleString()}₮</span>
                            {disc > 0 && <span className="text-xs text-gray-400 line-through">{item.originalPrice?.toLocaleString()}₮</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                          <Eye className="w-3 h-3" /> {item.viewCount}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <Star className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">Үнэлгээ</h3>
            <p className="text-sm text-gray-500 mt-1">{rating ? `${rating} ★ (${reviewCount || 0} үнэлгээ)` : 'Удахгүй...'}</p>
          </div>
        )}

        {/* Gallery / Docs — placeholder */}
        {(activeTab === 'gallery' || activeTab === 'docs') && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3 opacity-30">{activeTab === 'gallery' ? '🖼️' : '📄'}</div>
            <p className="text-sm text-gray-400 font-semibold">Удахгүй нэмэгдэнэ</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
