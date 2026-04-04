import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Dimensions, RefreshControl, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BRAND = '#E8242C';

// ─── Types & Config ───────────────────────────────────────
type ItemTier = 'vip' | 'featured' | 'discounted' | 'normal';
type EntityType = 'store' | 'agent' | 'company' | 'auto_dealer' | 'service' | 'user';

const TIER_CONFIG: Record<ItemTier, { label: string; badge: string; color: string; bg: string }> = {
  vip: { label: 'ВИП', badge: '👑', color: '#D4AF37', bg: 'rgba(212,175,55,0.1)' },
  featured: { label: 'Онцлох', badge: '⭐', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  discounted: { label: 'Хямдрал', badge: '🔥', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  normal: { label: 'Энгийн', badge: '', color: '#6B7280', bg: 'transparent' },
};

const ENTITY_LABELS: Record<EntityType, { label: string; emoji: string }> = {
  store: { label: 'Дэлгүүр', emoji: '🏪' },
  agent: { label: 'Агент', emoji: '🏠' },
  company: { label: 'Компани', emoji: '🏗️' },
  auto_dealer: { label: 'Авто', emoji: '🚗' },
  service: { label: 'Үйлчилгээ', emoji: '🛎️' },
  user: { label: 'Хэрэглэгч', emoji: '👤' },
};

const CATEGORIES = [
  { key: 'all', label: 'Бүгд', icon: 'apps' as const },
  { key: 'apartment', label: 'Орон сууц', icon: 'home' as const },
  { key: 'auto', label: 'Авто', icon: 'car' as const },
  { key: 'electronics', label: 'Электроник', icon: 'laptop' as const },
  { key: 'fashion', label: 'Хувцас', icon: 'shirt' as const },
  { key: 'services', label: 'Үйлчилгээ', icon: 'construct' as const },
  { key: 'furniture', label: 'Тавилга', icon: 'bed' as const },
  { key: 'other', label: 'Бусад', icon: 'ellipsis-horizontal' as const },
];

const DISTRICTS = ['Бүгд', 'СБД', 'ХУД', 'БЗД', 'ЧД', 'БГД', 'СХД', 'НД', 'БНД'];

// ─── Demo Feed Items ──────────────────────────────────────
const DEMO_FEED = [
  { id: '1', refId: 'VIP-AGT-001', title: '3 өрөө байр, 13-р хороолол', description: '78мкв, 5 давхарт, шинэ засвартай, тавилгатай', price: 280000000, images: [], category: 'apartment', entityType: 'agent' as EntityType, entityName: 'Голден Риэлти', tier: 'vip' as ItemTier, status: 'active', viewCount: 1245, district: 'СБД', metadata: { sqm: 78, rooms: 3, floor: 5 }, createdAt: '2026-04-01' },
  { id: '2', refId: 'VIP-AUTO-001', title: 'Toyota Prius 2022', description: '45,000км, хар өнгө, чипээр ороогүй, татвар төлсөн', price: 58000000, images: [], category: 'auto', entityType: 'auto_dealer' as EntityType, entityName: 'AutoMall', tier: 'vip' as ItemTier, status: 'active', viewCount: 892, district: 'ХУД', metadata: { year: 2022, mileage: 45000, fuel: 'Hybrid' }, createdAt: '2026-04-02' },
  { id: '3', refId: 'FTR-SVC-001', title: 'Вэбсайт хийж өгнө', description: 'React, Next.js, Mobile app хөгжүүлэлт. 3-5 хоногт бэлэн', price: 2500000, images: [], category: 'services', entityType: 'service' as EntityType, entityName: 'TechPro', tier: 'featured' as ItemTier, status: 'active', viewCount: 567, district: 'СБД', createdAt: '2026-04-01' },
  { id: '4', refId: 'FTR-USR-001', title: 'iPhone 15 Pro Max 256GB', description: 'Хэрэглээгүй шинэ, баталгаатай. Утасны хайрцагтай', price: 3800000, images: [], category: 'electronics', entityType: 'user' as EntityType, entityName: 'Бат', tier: 'featured' as ItemTier, status: 'active', viewCount: 432, district: 'БЗД', createdAt: '2026-04-02' },
  { id: '5', refId: 'DSC-STR-001', title: 'Cashmere цамц 70% OFF', description: '100% монгол ноолуур. XS-XXL хэмжээтэй', price: 45000, originalPrice: 150000, images: [], category: 'fashion', entityType: 'store' as EntityType, entityName: 'Gobi Store', tier: 'discounted' as ItemTier, status: 'active', viewCount: 2341, district: 'СБД', createdAt: '2026-03-28' },
  { id: '6', refId: 'NRM-USR-001', title: 'Буцлуур зарна', description: 'Хэрэглэсэн, хэвийн ажилладаг', price: 35000, images: [], category: 'electronics', entityType: 'user' as EntityType, entityName: 'Сараа', tier: 'normal' as ItemTier, status: 'active', viewCount: 89, district: 'ЧД', createdAt: '2026-04-03' },
  { id: '7', refId: 'NRM-USR-002', title: '2 өрөө байр түрээслүүлнэ', description: 'Хотын төвд, шинэ засвартай', price: 1200000, images: [], category: 'apartment', entityType: 'user' as EntityType, entityName: 'Дорж', tier: 'normal' as ItemTier, status: 'active', viewCount: 234, district: 'СБД', metadata: { sqm: 55, rooms: 2 }, createdAt: '2026-04-02' },
  { id: '8', refId: 'NRM-AUTO-001', title: 'Hyundai Tucson 2019', description: '85,000км, цагаан, бензин', price: 42000000, images: [], category: 'auto', entityType: 'user' as EntityType, entityName: 'Ганаа', tier: 'normal' as ItemTier, status: 'active', viewCount: 156, district: 'БГД', metadata: { year: 2019, mileage: 85000, fuel: 'Бензин' }, createdAt: '2026-04-01' },
  { id: '9', refId: 'NRM-USR-003', title: 'Диван + ширээ комплект', description: 'Хэрэглэсэн, L хэлбэрийн диван, кофены ширээ', price: 850000, images: [], category: 'furniture', entityType: 'user' as EntityType, entityName: 'Оюука', tier: 'normal' as ItemTier, status: 'active', viewCount: 67, district: 'БНД', createdAt: '2026-04-03' },
  { id: '10', refId: 'NRM-USR-004', title: 'Гэрийн цэвэрлэгээ хийнэ', description: 'Мэргэжлийн цэвэрлэгээ, 1-4 өрөө', price: 80000, images: [], category: 'services', entityType: 'user' as EntityType, entityName: 'Цэвэр Гэр', tier: 'normal' as ItemTier, status: 'active', viewCount: 312, district: 'СХД', createdAt: '2026-04-03' },
  { id: '11', refId: 'VIP-CMP-001', title: 'Шинэ барилга, 19-р хороолол', description: '45-95мкв, 1-3 өрөө, 2027 он хүлээлгэж өгнө', price: 95000000, originalPrice: 110000000, images: [], category: 'apartment', entityType: 'company' as EntityType, entityName: 'МАК Констракшн', tier: 'vip' as ItemTier, status: 'active', viewCount: 3456, district: 'НД', metadata: { sqm: 65, rooms: 2 }, createdAt: '2026-03-30' },
  { id: '12', refId: 'NRM-USR-005', title: 'Samsung Galaxy S24 Ultra', description: '12/256GB, хэрэглэсэн 3 сар, бүрэн комплект', price: 2800000, images: [], category: 'electronics', entityType: 'user' as EntityType, entityName: 'Тэмүүжин', tier: 'normal' as ItemTier, status: 'active', viewCount: 198, district: 'ХУД', createdAt: '2026-04-03' },
];

function formatPrice(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + ' сая₮';
  return n.toLocaleString() + '₮';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Өнөөдөр';
  if (days === 1) return 'Өчигдөр';
  if (days < 7) return `${days} өдрийн өмнө`;
  return dateStr;
}

// ─── Tier Badge ───────────────────────────────────────────
function TierBadge({ tier }: { tier: ItemTier }) {
  if (tier === 'normal') return null;
  const config = TIER_CONFIG[tier];
  return (
    <View style={[s.tierBadge, { backgroundColor: config.bg, borderColor: config.color + '30' }]}>
      <Text style={{ fontSize: 10 }}>{config.badge}</Text>
      <Text style={[s.tierText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

// ─── Feed Card ────────────────────────────────────────────
function FeedCard({ item }: { item: typeof DEMO_FEED[0] }) {
  const entity = ENTITY_LABELS[item.entityType];
  const tierConfig = TIER_CONFIG[item.tier];
  const isVip = item.tier === 'vip';
  const disc = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;

  return (
    <TouchableOpacity
      style={[s.feedCard, isVip && s.feedCardVip]}
      activeOpacity={0.8}
    >
      {/* Image placeholder */}
      <View style={[s.feedImage, isVip && { backgroundColor: '#1F1A00' }]}>
        <Text style={{ fontSize: 40 }}>
          {item.category === 'apartment' ? '🏠' :
           item.category === 'auto' ? '🚗' :
           item.category === 'electronics' ? '📱' :
           item.category === 'fashion' ? '👗' :
           item.category === 'services' ? '🔧' :
           item.category === 'furniture' ? '🛋️' : '📦'}
        </Text>
        {/* Tier badge */}
        <TierBadge tier={item.tier} />
        {/* Discount */}
        {disc > 0 && (
          <View style={s.discBadge}>
            <Text style={s.discText}>-{disc}%</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={s.feedContent}>
        {/* Entity info */}
        <View style={s.entityRow}>
          <Text style={{ fontSize: 12 }}>{entity.emoji}</Text>
          <Text style={s.entityName}>{item.entityName}</Text>
          {item.district && (
            <>
              <Text style={s.dotSep}>·</Text>
              <Ionicons name="location-outline" size={10} color="#777" />
              <Text style={s.districtText}>{item.district}</Text>
            </>
          )}
        </View>

        {/* Title */}
        <Text style={[s.feedTitle, isVip && { color: '#FFD700' }]} numberOfLines={2}>{item.title}</Text>

        {/* Description */}
        <Text style={s.feedDesc} numberOfLines={1}>{item.description}</Text>

        {/* Metadata chips */}
        {item.metadata && (
          <View style={s.metaRow}>
            {item.metadata.sqm && (
              <View style={s.metaChip}>
                <Text style={s.metaText}>{item.metadata.sqm}м²</Text>
              </View>
            )}
            {item.metadata.rooms && (
              <View style={s.metaChip}>
                <Text style={s.metaText}>{item.metadata.rooms} өрөө</Text>
              </View>
            )}
            {item.metadata.year && (
              <View style={s.metaChip}>
                <Text style={s.metaText}>{item.metadata.year} он</Text>
              </View>
            )}
            {item.metadata.mileage && (
              <View style={s.metaChip}>
                <Text style={s.metaText}>{(item.metadata.mileage / 1000).toFixed(0)}мян км</Text>
              </View>
            )}
            {item.metadata.fuel && (
              <View style={s.metaChip}>
                <Text style={s.metaText}>{item.metadata.fuel}</Text>
              </View>
            )}
          </View>
        )}

        {/* Price + Stats */}
        <View style={s.feedBottom}>
          <View>
            <Text style={[s.feedPrice, isVip && { color: '#FFD700' }]}>{formatPrice(item.price)}</Text>
            {disc > 0 && <Text style={s.feedOldPrice}>{formatPrice(item.originalPrice!)}</Text>}
          </View>
          <View style={s.feedStats}>
            <Ionicons name="eye-outline" size={12} color="#555" />
            <Text style={s.feedStatText}>{item.viewCount}</Text>
            <Text style={s.feedStatText}>· {timeAgo(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function FeedScreen() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [activeDistrict, setActiveDistrict] = useState('Бүгд');
  const [refreshing, setRefreshing] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);

  const filtered = DEMO_FEED.filter((item) => {
    if (activeCat !== 'all' && item.category !== activeCat) return false;
    if (activeDistrict !== 'Бүгд' && item.district !== activeDistrict) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort: VIP first, then featured, then discounted, then normal
  const sorted = [...filtered].sort((a, b) => {
    const tierOrder: Record<ItemTier, number> = { vip: 0, featured: 1, discounted: 2, normal: 3 };
    return tierOrder[a.tier] - tierOrder[b.tier];
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const vipCount = sorted.filter(i => i.tier === 'vip').length;
  const featuredCount = sorted.filter(i => i.tier === 'featured').length;

  return (
    <View style={s.container}>
      {/* Search */}
      <View style={s.searchBar}>
        <View style={s.searchWrap}>
          <Ionicons name="search" size={16} color="#666" />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Зар хайх..."
            placeholderTextColor="#555"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#555" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[s.districtBtn, showDistricts && { borderColor: BRAND }]}
          onPress={() => setShowDistricts(!showDistricts)}
        >
          <Ionicons name="location" size={14} color={activeDistrict !== 'Бүгд' ? BRAND : '#A0A0A0'} />
          <Text style={[s.districtBtnText, activeDistrict !== 'Бүгд' && { color: BRAND }]}>
            {activeDistrict === 'Бүгд' ? 'Дүүрэг' : activeDistrict}
          </Text>
        </TouchableOpacity>
      </View>

      {/* District dropdown */}
      {showDistricts && (
        <View style={s.districtDropdown}>
          {DISTRICTS.map((d) => (
            <TouchableOpacity key={d}
              style={[s.districtOption, activeDistrict === d && s.districtOptionActive]}
              onPress={() => { setActiveDistrict(d); setShowDistricts(false); }}>
              <Text style={[s.districtOptionText, activeDistrict === d && { color: BRAND, fontWeight: '800' }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category pills */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
        renderItem={({ item: c }) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              height: 38,
              borderRadius: 19,
              backgroundColor: activeCat === c.key ? BRAND : '#1A1A1A',
              borderWidth: 1,
              borderColor: activeCat === c.key ? BRAND : '#3D3D3D',
              marginRight: 10,
            }}
            onPress={() => setActiveCat(c.key)}>
            <Ionicons name={c.icon} size={15} color={activeCat === c.key ? '#FFF' : '#999'} style={{ marginRight: 7 }} />
            <Text style={{
              fontSize: 14,
              fontWeight: '700',
              color: activeCat === c.key ? '#FFFFFF' : '#CCCCCC',
              includeFontPadding: false,
            }}>{c.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Result info */}
      <View style={s.resultBar}>
        <Text style={s.resultText}>
          <Text style={{ fontWeight: '800', color: '#FFF' }}>{sorted.length}</Text> зар олдлоо
          {vipCount > 0 && <Text style={{ color: '#D4AF37' }}> · 👑 {vipCount} ВИП</Text>}
        </Text>
      </View>

      {/* Feed list */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND} />}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={s.emptyTitle}>Зар олдсонгүй</Text>
            <Text style={s.emptyText}>Шүүлтүүрээ өөрчилнө үү</Text>
          </View>
        }
      />

      {/* FAB — Зар нэмэх */}
      <TouchableOpacity
        style={s.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/post-ad' as any)}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Search
  searchBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 14, height: 42, gap: 10, borderWidth: 0.5, borderColor: '#3D3D3D' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, padding: 0 },
  districtBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 42, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#3D3D3D' },
  districtBtnText: { fontSize: 13, fontWeight: '600', color: '#A0A0A0' },

  // District dropdown
  districtDropdown: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 8, gap: 6 },
  districtOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#2A2A2A' },
  districtOptionActive: { backgroundColor: 'rgba(232,36,44,0.1)', borderColor: BRAND },
  districtOptionText: { fontSize: 13, fontWeight: '600', color: '#A0A0A0' },

  // Categories
  catPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#3D3D3D' },
  catPillActive: { backgroundColor: BRAND, borderColor: BRAND },
  catPillText: { fontSize: 13, fontWeight: '600', color: '#A0A0A0' },
  catPillTextActive: { color: '#FFF' },

  // Result
  resultBar: { paddingHorizontal: 16, paddingBottom: 8 },
  resultText: { fontSize: 13, color: '#777' },

  // Feed Card
  feedCard: { backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 0.5, borderColor: '#2A2A2A', overflow: 'hidden' },
  feedCardVip: { borderColor: 'rgba(212,175,55,0.3)', borderWidth: 1 },
  feedImage: { height: 160, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  feedContent: { padding: 14 },

  // Tier
  tierBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 0.5 },
  tierText: { fontSize: 10, fontWeight: '800' },

  // Discount
  discBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: BRAND, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  discText: { fontSize: 11, fontWeight: '800', color: '#FFF' },

  // Entity
  entityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  entityName: { fontSize: 12, fontWeight: '600', color: '#A0A0A0' },
  dotSep: { color: '#555', fontSize: 10 },
  districtText: { fontSize: 11, color: '#777' },

  // Content
  feedTitle: { fontSize: 16, fontWeight: '800', color: '#FFF', marginBottom: 4, lineHeight: 22 },
  feedDesc: { fontSize: 13, color: '#888', marginBottom: 8 },

  // Metadata
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  metaChip: { backgroundColor: '#2A2A2A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  metaText: { fontSize: 11, fontWeight: '600', color: '#D0D0D0' },

  // Bottom
  feedBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  feedPrice: { fontSize: 18, fontWeight: '900', color: BRAND },
  feedOldPrice: { fontSize: 12, color: '#555', textDecorationLine: 'line-through', marginTop: 2 },
  feedStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  feedStatText: { fontSize: 11, color: '#555' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  emptyText: { fontSize: 13, color: '#777' },

  // FAB
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: BRAND, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
});
