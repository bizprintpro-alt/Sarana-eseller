'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ENTITY_LABELS, TIER_CONFIG, DEMO_FEED, type EntityType, type FeedItemData } from '@/lib/types/entity';
import EsellerLogo from '@/components/shared/EsellerLogo';
import MobileNav from '@/components/shared/MobileNav';
import {
  MapPin, Phone, Star, Shield, ChevronRight, ExternalLink,
  Calendar, Eye, MessageCircle, Share2, Award, Building2, Car,
  Briefcase, Clock, Users, Grid3x3, List,
} from 'lucide-react';

/* Demo entity profiles */
const DEMO_ENTITIES: Record<string, any> = {
  agent: {
    'erdenbat': { name: 'Б. Эрдэнэбат', slug: 'erdenbat', profilePhoto: null, coverImage: null, bio: 'Үл хөдлөх хөрөнгийн чиглэлээр 12 жил ажилласан мэргэжлийн агент. Орон сууц, оффис, газрын зуучлалаар мэргэшсэн.', experience: 12, specialties: ['Орон сууц', 'Оффис', 'Газар'], licenseNumber: 'RE-2024-0142', phone: '9911-2233', district: 'СБД', isVerified: true, rating: 4.9, reviewCount: 87 },
  },
  company: {
    'mongolian-properties': { name: 'Монголиан Пропертиз', slug: 'mongolian-properties', logo: null, coverImage: null, description: 'Шинэ барилга, орон сууцны төсөл хөгжүүлэгч. 2010 оноос хойш 15+ төсөл амжилттай хэрэгжүүлсэн.', foundedYear: 2010, employeeCount: 85, licenseNumber: 'BC-2024-0058', awards: ['Шилдэг барилгын компани 2024', 'ISO 9001'], phone: '7012-3456', district: 'ХУД', isVerified: true, rating: 4.7, reviewCount: 124 },
  },
  auto_dealer: {
    'autocity': { name: 'AutoCity Mongolia', slug: 'autocity', logo: null, coverImage: null, description: 'Шинэ болон хуучин автомашин импортлогч, худалдаа. Toyota, Hyundai, Kia, Honda брэндүүд.', brands: ['Toyota', 'Hyundai', 'Kia', 'Honda'], phone: '7700-8899', district: 'БЗД', isVerified: true, rating: 4.5, reviewCount: 203 },
  },
  service: {
    'digitalmn': { name: 'DigitalMN Studio', slug: 'digitalmn', logo: null, coverImage: null, description: 'Вэб сайт, аппликейшн хөгжүүлэлт, дижитал маркетинг. 50+ амжилттай төсөл.', serviceTypes: ['Вэб хөгжүүлэлт', 'Аппликейшн', 'Дижитал маркетинг', 'UI/UX дизайн'], phone: '8800-1122', isVerified: false, rating: 4.6, reviewCount: 45 },
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
  const [activeTab, setActiveTab] = useState('listings');
  const [showPhone, setShowPhone] = useState(false);

  const entities = DEMO_ENTITIES[entityType] || {};
  const entity = entities[slug];
  const entityInfo = ENTITY_LABELS[entityType as EntityType] || { label: entityType, emoji: '📋' };
  const tabs = TAB_CONFIG[entityType] || [{ key: 'about', label: 'Тухай' }];
  const feedItems = DEMO_FEED.filter((f) => f.entityType === entityType);

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

      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-indigo-600 to-purple-700 relative">
        {entity.coverImage && <img src={entity.coverImage} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Profile Card */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0 -mt-12 border-4 border-white">
              {entity.logo || entity.profilePhoto
                ? <img src={entity.logo || entity.profilePhoto} alt="" className="w-full h-full rounded-2xl object-cover" />
                : entity.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-gray-900">{entity.name}</h1>
                {entity.isVerified && <Shield className="w-5 h-5 text-blue-500 fill-blue-500" />}
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                  {entityInfo.emoji} {entityInfo.label}
                </span>
              </div>

              {entity.rating && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn('w-3.5 h-3.5', i < Math.round(entity.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{entity.rating} ({entity.reviewCount} үнэлгээ)</span>
                </div>
              )}

              {entity.district && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" /> {entity.district}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setShowPhone(!showPhone)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition border-none cursor-pointer">
                <Phone className="w-4 h-4" />
                {showPhone ? entity.phone : 'Дугаар харах'}
              </button>
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
          {tabs.map((tab) => (
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
            {entity.bio && <p className="text-sm text-gray-700 leading-relaxed">{entity.bio}</p>}
            {entity.description && <p className="text-sm text-gray-700 leading-relaxed">{entity.description}</p>}

            {entity.experience && (
              <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-indigo-500" /> <span className="font-semibold">{entity.experience} жилийн туршлага</span></div>
            )}
            {entity.licenseNumber && (
              <div className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-green-500" /> <span>Лиценз: <strong>{entity.licenseNumber}</strong></span></div>
            )}
            {entity.foundedYear && (
              <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-indigo-500" /> <span>Үүсгэн байгуулагдсан: <strong>{entity.foundedYear}</strong></span></div>
            )}
            {entity.employeeCount && (
              <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-indigo-500" /> <span>Ажилтны тоо: <strong>{entity.employeeCount}</strong></span></div>
            )}

            {entity.specialties?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Мэргэшсэн чиглэл</h4>
                <div className="flex flex-wrap gap-2">
                  {entity.specialties.map((s: string) => (
                    <span key={s} className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {entity.brands?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Брэндүүд</h4>
                <div className="flex flex-wrap gap-2">
                  {entity.brands.map((b: string) => (
                    <span key={b} className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
            )}
            {entity.serviceTypes?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Үйлчилгээнүүд</h4>
                <div className="flex flex-wrap gap-2">
                  {entity.serviceTypes.map((s: string) => (
                    <span key={s} className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {entity.awards?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Шагнал & Гэрчилгээ</h4>
                {entity.awards.map((a: string) => (
                  <div key={a} className="flex items-center gap-2 text-sm mb-1"><Award className="w-3.5 h-3.5 text-amber-500" /> {a}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listings/Projects/Vehicles tab */}
        {(activeTab === 'listings' || activeTab === 'projects' || activeTab === 'vehicles' || activeTab === 'portfolio' || activeTab === 'services') && (
          <div className="space-y-4">
            {feedItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3 opacity-30">📋</div>
                <p className="text-sm text-gray-400 font-semibold">Зар байхгүй байна</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {feedItems.map((item) => {
                  const tierConf = TIER_CONFIG[item.tier];
                  const disc = item.originalPrice && item.price ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;
                  return (
                    <div key={item.id} className={cn('bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all', tierConf.bgColor, item.tier === 'vip' && 'border-2 col-span-2')}>
                      {/* Image placeholder */}
                      <div className={cn('bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center', item.tier === 'vip' ? 'h-48' : 'h-36')}>
                        <span className="text-4xl">{ENTITY_LABELS[item.entityType as EntityType]?.emoji || '📦'}</span>
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
                        {item.price && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-[#E31E24]">{item.price.toLocaleString()}₮</span>
                            {disc > 0 && <span className="text-xs text-gray-400 line-through">{item.originalPrice?.toLocaleString()}₮</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                          <Eye className="w-3 h-3" /> {item.viewCount}
                          {item.metadata && Object.entries(item.metadata).slice(0, 3).map(([k, v]) => (
                            <span key={k} className="bg-gray-100 px-1.5 py-0.5 rounded">{k}: {String(v)}</span>
                          ))}
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
            <p className="text-sm text-gray-500 mt-1">Удахгүй...</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
