import { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Dimensions, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BRAND = '#E8242C';

// ─── Filters ──────────────────────────────────────────────
const FILTERS = [
  { key: 'all', label: 'Бүгд' },
  { key: 'featured', label: 'Онцлох' },
  { key: 'new', label: 'Шинэ' },
  { key: 'afterpay', label: 'Afterpay' },
  { key: 'top', label: 'Шилдэг' },
];

const SORT_OPTIONS = [
  { key: 'popular', label: 'Эрэлттэй' },
  { key: 'newest', label: 'Шинэ' },
  { key: 'rating', label: 'Үнэлгээ' },
  { key: 'products', label: 'Бараа олонтой' },
];

// ─── Demo Stores ──────────────────────────────────────────
const STORES = [
  {
    id: 's1',
    name: 'TechZone Mongolia',
    emoji: '🖥️',
    date: '2024.06.15',
    badges: ['Онцлох', 'Afterpay'],
    products: 45,
    followers: 1250,
    rating: 4.9,
    category: 'Электроник',
    verified: true,
    items: [
      { name: 'iPhone 15 Pro', price: 4200000, emoji: '📱' },
      { name: 'MacBook Air M3', price: 3800000, emoji: '💻' },
      { name: 'AirPods Pro', price: 650000, emoji: '🎧' },
      { name: 'iPad Air', price: 2400000, emoji: '📲' },
      { name: 'Apple Watch', price: 1200000, emoji: '⌚' },
    ],
  },
  {
    id: 's2',
    name: 'Fashion Hub',
    emoji: '👗',
    date: '2024.09.20',
    badges: ['Онцлох'],
    products: 120,
    followers: 3400,
    rating: 4.7,
    category: 'Хувцас',
    verified: true,
    items: [
      { name: 'Designer цамц', price: 85000, emoji: '👕' },
      { name: 'Leather цүнх', price: 195000, emoji: '👜' },
      { name: 'Nike гутал', price: 289000, emoji: '👟' },
      { name: 'Cashmere sweater', price: 350000, emoji: '🧥' },
      { name: 'Малгай', price: 45000, emoji: '🧢' },
    ],
  },
  {
    id: 's3',
    name: 'Beauty Lab',
    emoji: '💄',
    date: '2025.01.10',
    badges: ['Afterpay'],
    products: 78,
    followers: 5600,
    rating: 4.8,
    category: 'Гоо сайхан',
    verified: false,
    items: [
      { name: 'Нүүрний крем', price: 68000, emoji: '🧴' },
      { name: 'Сэрүүн тос', price: 45000, emoji: '✨' },
      { name: 'Хумс будаг set', price: 35000, emoji: '💅' },
      { name: 'Нүд будаг', price: 52000, emoji: '👁️' },
      { name: 'Уруулын будаг', price: 28000, emoji: '💋' },
    ],
  },
  {
    id: 's4',
    name: 'Home & Living',
    emoji: '🏠',
    date: '2025.03.05',
    badges: ['Шинэ', 'Онцлох'],
    products: 34,
    followers: 890,
    rating: 4.6,
    category: 'Гэр ахуй',
    verified: true,
    items: [
      { name: 'LED гэрэл', price: 45000, emoji: '💡' },
      { name: 'Торгон дэр', price: 65000, emoji: '🛋️' },
      { name: 'Хөнжил', price: 120000, emoji: '🛏️' },
      { name: 'Аяга таваг set', price: 85000, emoji: '🍽️' },
      { name: 'Цэцэг тавиур', price: 38000, emoji: '🌿' },
    ],
  },
  {
    id: 's5',
    name: 'Sport Central',
    emoji: '⚽',
    date: '2024.11.28',
    badges: ['Онцлох', 'Afterpay'],
    products: 92,
    followers: 2100,
    rating: 4.7,
    category: 'Спорт',
    verified: true,
    items: [
      { name: 'Yoga mat', price: 45000, emoji: '🧘' },
      { name: 'Дасгалын хувцас', price: 75000, emoji: '🏃' },
      { name: 'Protein powder', price: 95000, emoji: '💪' },
      { name: 'Бокс бээлий', price: 68000, emoji: '🥊' },
      { name: 'Сагсан бөмбөг', price: 55000, emoji: '🏀' },
    ],
  },
  {
    id: 's6',
    name: 'Kids World',
    emoji: '🧸',
    date: '2025.02.14',
    badges: ['Шинэ'],
    products: 56,
    followers: 1800,
    rating: 4.5,
    category: 'Хүүхэд',
    verified: false,
    items: [
      { name: 'LEGO set', price: 185000, emoji: '🧱' },
      { name: 'Хүүхэлдэй', price: 35000, emoji: '🧸' },
      { name: 'Зургийн ном', price: 15000, emoji: '📚' },
      { name: 'Усан будаг', price: 22000, emoji: '🎨' },
      { name: 'Puzzle 1000', price: 28000, emoji: '🧩' },
    ],
  },
];

function formatPrice(n: number) { return n.toLocaleString() + '₮'; }

// ─── Store Card ───────────────────────────────────────────
function StoreCard({ store }: { store: typeof STORES[0] }) {
  return (
    <View style={s.storeCard}>
      {/* Header */}
      <View style={s.storeHeader}>
        <View style={s.storeLogo}>
          <Text style={{ fontSize: 28 }}>{store.emoji}</Text>
        </View>
        <View style={s.storeInfo}>
          <View style={s.storeNameRow}>
            <Text style={s.storeName} numberOfLines={1}>{store.name}</Text>
            {store.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Ionicons name="calendar-outline" size={12} color="#777" />
            <Text style={s.storeDate}>{store.date}</Text>
            <Text style={s.storeCat}>· {store.category}</Text>
          </View>
          <View style={s.badgeRow}>
            {store.badges.map((badge) => (
              <View key={badge} style={[s.badge,
                badge === 'Онцлох' && s.badgeFeatured,
                badge === 'Afterpay' && s.badgeAfterpay,
                badge === 'Шинэ' && s.badgeNew,
              ]}>
                {badge === 'Afterpay' && <Ionicons name="checkmark-circle" size={10} color="#22C55E" />}
                <Text style={[s.badgeText,
                  badge === 'Онцлох' && { color: '#6366F1' },
                  badge === 'Afterpay' && { color: '#22C55E' },
                  badge === 'Шинэ' && { color: '#F59E0B' },
                ]}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity style={s.followBtn}>
          <Ionicons name="heart-outline" size={14} color={BRAND} />
          <Text style={s.followText}>Дагах</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.stat}>
          <Ionicons name="bag-outline" size={14} color="#A0A0A0" />
          <Text style={s.statText}>{store.products} бараа</Text>
        </View>
        <View style={s.stat}>
          <Ionicons name="people-outline" size={14} color="#A0A0A0" />
          <Text style={s.statText}>{store.followers.toLocaleString()} дагагч</Text>
        </View>
        <View style={s.stat}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={s.statText}>{store.rating}</Text>
        </View>
      </View>

      {/* Product Preview */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingVertical: 4 }}>
        {store.items.map((item, i) => (
          <TouchableOpacity key={i} style={s.previewItem} activeOpacity={0.8}>
            <View style={s.previewImage}>
              <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
            </View>
            <View style={s.previewPrice}>
              <Text style={s.previewPriceText}>{formatPrice(item.price)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Store */}
      <TouchableOpacity style={s.viewStoreBtn} activeOpacity={0.7}>
        <Text style={s.viewStoreText}>Дэлгүүр үзэх</Text>
        <Ionicons name="arrow-forward" size={14} color={BRAND} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function ShopsScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSort, setShowSort] = useState(false);
  const [activeSort, setActiveSort] = useState('popular');

  const filtered = STORES.filter((store) => {
    if (search && !store.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 'featured') return store.badges.includes('Онцлох');
    if (activeFilter === 'new') return store.badges.includes('Шинэ');
    if (activeFilter === 'afterpay') return store.badges.includes('Afterpay');
    if (activeFilter === 'top') return store.rating >= 4.7;
    return true;
  });

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

      {/* Filter Pills */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.key}
            style={[s.filterPill, activeFilter === f.key && s.filterPillActive, { marginRight: 10 }]}
            onPress={() => setActiveFilter(f.key)}>
            <Text style={[s.filterText, activeFilter === f.key && s.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Bar */}
      <View style={s.resultBar}>
        <Text style={s.resultText}>
          <Text style={{ fontWeight: '800', color: '#FFF' }}>{filtered.length}</Text> дэлгүүр олдлоо
        </Text>
      </View>

      {/* Store List */}
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
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────
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
  filterPill: { height: 38, paddingHorizontal: 20, borderRadius: 19, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#3D3D3D', justifyContent: 'center' as const, alignItems: 'center' as const },
  filterPillActive: { backgroundColor: BRAND, borderColor: BRAND },
  filterText: { fontSize: 14, fontWeight: '700', color: '#CCCCCC', includeFontPadding: false },
  filterTextActive: { color: '#FFFFFF' },

  // Result bar
  resultBar: { paddingHorizontal: 16, paddingBottom: 12 },
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
  badgeFeatured: { backgroundColor: 'rgba(99,102,241,0.15)' },
  badgeAfterpay: { backgroundColor: 'rgba(34,197,94,0.15)' },
  badgeNew: { backgroundColor: 'rgba(245,158,11,0.15)' },
  badgeText: { fontSize: 10, fontWeight: '700' },

  // Follow
  followBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(232,36,44,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 0.5, borderColor: 'rgba(232,36,44,0.2)' },
  followText: { fontSize: 12, fontWeight: '700', color: BRAND },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 12, color: '#A0A0A0', fontWeight: '500' },

  // Preview Items
  previewItem: { width: 80, position: 'relative' },
  previewImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#3D3D3D' },
  previewPrice: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, paddingVertical: 3 },
  previewPriceText: { fontSize: 9, fontWeight: '700', color: '#FFF', textAlign: 'center' },

  // View Store
  viewStoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderTopWidth: 0.5, borderTopColor: '#2A2A2A', marginTop: 12 },
  viewStoreText: { fontSize: 13, fontWeight: '700', color: BRAND },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#777', marginTop: 4 },
});
