import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StoresAPI, StoreListItem } from '../lib/api';
const BRAND = '#E8242C';

// ─── Entity Type Config (7 types) ────────────────────────
const ENTITY_TYPES = [
  { key: 'all', label: 'Бүгд', emoji: '🏪', color: BRAND },
  { key: 'store', label: 'Дэлгүүр', emoji: '🛍️', color: '#6366F1' },
  { key: 'service', label: 'Үйлчилгээ', emoji: '⚙️', color: '#8B5CF6' },
  { key: 'agent', label: 'Агент', emoji: '🏠', color: '#3B82F6' },
  { key: 'company', label: 'Компани', emoji: '🏗️', color: '#10B981' },
  { key: 'auto_dealer', label: 'Авто', emoji: '🚗', color: '#F59E0B' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Шинэ' },
  { key: 'rating', label: 'Үнэлгээ' },
  { key: 'popular', label: 'Эрэлттэй' },
];

// ─── Fallback demo data (shown if API unavailable) ───────
const FALLBACK_STORES: StoreListItem[] = [
  { id: 's1', name: 'TechZone Mongolia', slug: 'techzone', industry: 'Электроник', district: 'СБД', entityType: 'store', isVerified: true, rating: 4.9, reviewCount: 45 },
  { id: 's2', name: 'Fashion Hub', slug: 'fashionhub', industry: 'Хувцас', district: 'ЧД', entityType: 'store', isVerified: true, rating: 4.7, reviewCount: 120 },
  { id: 's3', name: 'Beauty Lab', slug: 'beautylab', industry: 'Гоо сайхан', district: 'БЗД', entityType: 'service', isVerified: false, rating: 4.8, reviewCount: 78 },
  { id: 's4', name: 'Home & Living', slug: 'homeliving', industry: 'Гэр ахуй', district: 'ХУД', entityType: 'store', isVerified: true, rating: 4.6, reviewCount: 34 },
  { id: 's5', name: 'Номин Агент', slug: 'nominagent', industry: 'Үл хөдлөх', district: 'СБД', entityType: 'agent', isVerified: true, rating: 4.9, reviewCount: 89 },
  { id: 's6', name: 'Монгол Барилга', slug: 'mongolbuild', industry: 'Барилга', district: 'ХУД', entityType: 'company', isVerified: true, rating: 4.5, reviewCount: 23 },
  { id: 's7', name: 'Auto Mall', slug: 'automall', industry: 'Авто худалдаа', district: 'СХД', entityType: 'auto_dealer', isVerified: false, rating: 4.3, reviewCount: 56 },
];

const ENTITY_EMOJI: Record<string, string> = {
  store: '🛍️', agent: '🏠', company: '🏗️', auto_dealer: '🚗', service: '��️',
};

function getEntityColor(type: string): string {
  return ENTITY_TYPES.find((t) => t.key === type)?.color || '#777';
}

// ─── Store Card ──────────────────────────────────────────
function StoreCard({ store }: { store: StoreListItem }) {
  const emoji = ENTITY_EMOJI[store.entityType] || '🏪';
  const color = getEntityColor(store.entityType);
  const typeName = ENTITY_TYPES.find((t) => t.key === store.entityType)?.label || store.entityType;

  return (
    <TouchableOpacity style={s.storeCard} activeOpacity={0.8}
      onPress={() => router.push(`/store/${store.slug}` as any)}>
      {/* Header */}
      <View style={s.storeHeader}>
        <View style={s.storeLogo}>
          {store.logo ? (
            <Image source={{ uri: store.logo }} style={{ width: 48, height: 48, borderRadius: 24 }} />
          ) : (
            <Text style={{ fontSize: 28 }}>{emoji}</Text>
          )}
        </View>
        <View style={s.storeInfo}>
          <View style={s.storeNameRow}>
            <Text style={s.storeName} numberOfLines={1}>{store.name}</Text>
            {store.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            {store.district && (
              <>
                <Ionicons name="location-outline" size={12} color="#777" />
                <Text style={s.storeDate}>{store.district}</Text>
              </>
            )}
            {store.industry && <Text style={s.storeCat}>· {store.industry}</Text>}
          </View>
          {/* Entity type badge */}
          <View style={s.badgeRow}>
            <View style={[s.badge, { backgroundColor: color + '20' }]}>
              <Text style={[s.badgeText, { color }]}>{typeName}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {store.rating != null && (
          <View style={s.stat}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={s.statText}>{store.rating.toFixed(1)}</Text>
          </View>
        )}
        {store.reviewCount != null && (
          <View style={s.stat}>
            <Ionicons name="chatbubble-outline" size={14} color="#A0A0A0" />
            <Text style={s.statText}>{store.reviewCount} сэтгэгдэл</Text>
          </View>
        )}
        {store.phone && (
          <View style={s.stat}>
            <Ionicons name="call-outline" size={14} color="#A0A0A0" />
            <Text style={s.statText}>{store.phone}</Text>
          </View>
        )}
      </View>

      {/* View Store */}
      <TouchableOpacity style={s.viewStoreBtn} activeOpacity={0.7}
        onPress={() => router.push(`/store/${store.slug}` as any)}>
        <Text style={s.viewStoreText}>Дэлгүүр үзэх</Text>
        <Ionicons name="arrow-forward" size={14} color={BRAND} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────
export default function ShopsScreen() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const [showSort, setShowSort] = useState(false);

  // API state
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // Fetch stores from API
  const fetchStores = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sort: activeSort };
      if (activeType !== 'all') params.type = activeType;
      if (search.trim()) params.search = search.trim();

      const res = await StoresAPI.list(params);
      if (res.stores && res.stores.length > 0) {
        setStores(res.stores);
        setUsingFallback(false);
      } else {
        // API returned empty — use fallback filtered
        setStores(FALLBACK_STORES);
        setUsingFallback(true);
      }
    } catch {
      // API unavailable — use fallback
      setStores(FALLBACK_STORES);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [activeType, activeSort]);

  // Local filtering for fallback data
  const filtered = usingFallback
    ? stores.filter((store) => {
        if (search && !store.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (activeType !== 'all' && store.entityType !== activeType) return false;
        return true;
      })
    : stores;

  return (
    <View style={s.container}>
      {/* Search + Sort */}
      <View style={s.headerBar}>
        <View style={s.searchWrap}>
          <Ionicons name="search" size={16} color="#666" />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Дэлгүүр хайх..."
            placeholderTextColor="#555"
            onSubmitEditing={fetchStores}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={s.sortBtn} onPress={() => setShowSort(!showSort)}>
          <Ionicons name="funnel-outline" size={18} color="#A0A0A0" />
        </TouchableOpacity>
      </View>

      {/* Sort dropdown */}
      {showSort && (
        <View style={s.sortDropdown}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.key} style={[s.sortOption, activeSort === opt.key && s.sortOptionActive]}
              onPress={() => { setActiveSort(opt.key); setShowSort(false); }}>
              <Text style={[s.sortOptionText, activeSort === opt.key && { color: BRAND }]}>{opt.label}</Text>
              {activeSort === opt.key && <Ionicons name="checkmark" size={16} color={BRAND} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Entity Type Filter — 7 types */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        {ENTITY_TYPES.map((t) => (
          <TouchableOpacity key={t.key}
            style={[s.filterPill, activeType === t.key && { backgroundColor: t.color, borderColor: t.color }]}
            onPress={() => setActiveType(t.key)}>
            <Text style={{ fontSize: 14 }}>{t.emoji}</Text>
            <Text style={[s.filterText, activeType === t.key && s.filterTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Bar */}
      <View style={s.resultBar}>
        <Text style={s.resultText}>
          <Text style={{ fontWeight: '800', color: '#FFF' }}>{filtered.length}</Text> дэлгүүр олдлоо
        </Text>
        {usingFallback && (
          <Text style={{ fontSize: 10, color: '#555' }}>(demo data)</Text>
        )}
      </View>

      {/* Store List */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={{ color: '#777', marginTop: 12, fontSize: 13 }}>Дэлгүүрүүд ачааллаж байна...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StoreCard store={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Text style={{ fontSize: 48 }}>🏪</Text>
              <Text style={s.emptyTitle}>Дэлгүүр олдсонгүй</Text>
              <Text style={s.emptyText}>Хайлтын утгаа өөрчилнө үү</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Styles ────────���─────────────────────────��───────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Header
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 14, height: 42, gap: 10, borderWidth: 0.5, borderColor: '#3D3D3D' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, padding: 0 },
  sortBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#3D3D3D' },

  // Sort Dropdown
  sortDropdown: { marginHorizontal: 16, marginTop: 8, backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 0.5, borderColor: '#3D3D3D', overflow: 'hidden' },
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  sortOptionActive: { backgroundColor: 'rgba(232,36,44,0.05)' },
  sortOptionText: { fontSize: 14, fontWeight: '600', color: '#A0A0A0' },

  // Filters
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 16, borderRadius: 19, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#3D3D3D' },
  filterText: { fontSize: 13, fontWeight: '700', color: '#CCCCCC' },
  filterTextActive: { color: '#FFFFFF' },

  // Result bar
  resultBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  resultText: { fontSize: 13, color: '#777' },

  // Store Card
  storeCard: { backgroundColor: '#1A1A1A', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden', paddingTop: 16 },
  storeHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, gap: 12 },
  storeLogo: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#3D3D3D' },
  storeInfo: { flex: 1 },
  storeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storeName: { fontSize: 16, fontWeight: '800', color: '#FFF', flex: 1 },
  storeDate: { fontSize: 11, color: '#777' },
  storeCat: { fontSize: 11, color: '#555' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 12, color: '#A0A0A0', fontWeight: '500' },

  // View Store
  viewStoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderTopWidth: 0.5, borderTopColor: '#2A2A2A', marginTop: 4 },
  viewStoreText: { fontSize: 13, fontWeight: '700', color: BRAND },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#777', marginTop: 4 },
});
