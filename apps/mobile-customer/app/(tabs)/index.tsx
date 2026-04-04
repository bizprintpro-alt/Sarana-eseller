import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity, TextInput,
  Image, StyleSheet, Dimensions, Animated, NativeSyntheticEvent,
  NativeScrollEvent, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BRAND = '#E8242C';

// ─── Demo Data ────────────────────────────────────────────
const BANNERS = [
  { id: '1', title: 'Зуны Мега Хямдрал', subtitle: '70% хүртэл хөнгөлөлт', color: '#E8242C', icon: 'flame' as const },
  { id: '2', title: 'Шинэ дэлгүүрүүд', subtitle: 'Өдөр бүр шинэ брэнд нэмэгдэж байна', color: '#6366F1', icon: 'storefront' as const },
  { id: '3', title: 'Үнэгүй хүргэлт', subtitle: '50,000₮-с дээш захиалгад', color: '#059669', icon: 'car' as const },
  { id: '4', title: 'Үйлчилгээ захиалах', subtitle: 'Үсчин, засвар, хэвлэх — бүгд нэг дор', color: '#D97706', icon: 'construct' as const },
];

const CATEGORIES = [
  { key: 'fashion', label: 'Хувцас', icon: 'shirt' as const, color: '#EC4899' },
  { key: 'electronics', label: 'Электроник', icon: 'laptop' as const, color: '#6366F1' },
  { key: 'food', label: 'Хоол', icon: 'restaurant' as const, color: '#F59E0B' },
  { key: 'beauty', label: 'Гоо сайхан', icon: 'sparkles' as const, color: '#EC4899' },
  { key: 'home', label: 'Гэр ахуй', icon: 'home' as const, color: '#10B981' },
  { key: 'sports', label: 'Спорт', icon: 'football' as const, color: '#3B82F6' },
  { key: 'kids', label: 'Хүүхэд', icon: 'happy' as const, color: '#F97316' },
  { key: 'services', label: 'Үйлчилгээ', icon: 'construct' as const, color: '#8B5CF6' },
];

const FLASH_DEALS = [
  { _id: 'f1', name: 'Nike Air Max 270', price: 289000, salePrice: 159000, emoji: '👟', rating: 4.9, sold: 234 },
  { _id: 'f2', name: 'Samsung Galaxy Buds', price: 185000, salePrice: 99000, emoji: '🎧', rating: 4.7, sold: 567 },
  { _id: 'f3', name: 'Adidas цамц', price: 95000, salePrice: 45000, emoji: '👕', rating: 4.5, sold: 189 },
  { _id: 'f4', name: 'Dyson шүүрдэгч', price: 890000, salePrice: 590000, emoji: '🧹', rating: 4.8, sold: 78 },
];

const TRENDING = [
  { _id: 't1', name: 'iPhone 15 Pro Max', price: 4200000, emoji: '📱', rating: 4.9, reviews: 1243 },
  { _id: 't2', name: 'MacBook Air M3', price: 3800000, emoji: '💻', rating: 4.8, reviews: 856 },
  { _id: 't3', name: 'AirPods Pro 2', price: 650000, emoji: '🎵', rating: 4.7, reviews: 2341 },
  { _id: 't4', name: 'Apple Watch S9', price: 1200000, emoji: '⌚', rating: 4.6, reviews: 432 },
  { _id: 't5', name: 'iPad Air M2', price: 2400000, emoji: '📲', rating: 4.8, reviews: 678 },
];

const FEATURED_STORES = [
  { id: 's1', name: 'TechZone', emoji: '🖥️', followers: '12.5K', rating: 4.9 },
  { id: 's2', name: 'Fashion Hub', emoji: '👗', followers: '8.2K', rating: 4.7 },
  { id: 's3', name: 'Beauty Lab', emoji: '💄', followers: '15.1K', rating: 4.8 },
  { id: 's4', name: 'Home & Living', emoji: '🏠', followers: '6.8K', rating: 4.6 },
  { id: 's5', name: 'Sport Central', emoji: '⚽', followers: '9.3K', rating: 4.7 },
];

const PRODUCTS = [
  { _id: '1', name: 'Premium цагаан цамц', price: 35000, salePrice: undefined, emoji: '👕', category: 'fashion', rating: 4.5, reviews: 45 },
  { _id: '2', name: 'Sporty гутал Air', price: 89000, salePrice: 69000, emoji: '👟', category: 'fashion', rating: 4.8, reviews: 128 },
  { _id: '3', name: 'Designer малгай', price: 22000, salePrice: undefined, emoji: '🧢', category: 'fashion', rating: 4.2, reviews: 23 },
  { _id: '4', name: 'Leather цүнх', price: 95000, salePrice: 75000, emoji: '👜', category: 'fashion', rating: 4.7, reviews: 67 },
  { _id: '5', name: 'Пицца Маргарита', price: 38000, salePrice: undefined, emoji: '🍕', category: 'food', rating: 4.9, reviews: 312 },
  { _id: '6', name: 'Burger Double set', price: 42000, salePrice: 35000, emoji: '🍔', category: 'food', rating: 4.6, reviews: 89 },
  { _id: '7', name: 'iPhone 15 Pro case', price: 18000, salePrice: undefined, emoji: '📱', category: 'electronics', rating: 4.3, reviews: 56 },
  { _id: '8', name: 'Bluetooth чихэвч', price: 125000, salePrice: 99000, emoji: '🎧', category: 'electronics', rating: 4.5, reviews: 234 },
  { _id: '9', name: 'Нүүрний крем SPF50', price: 28000, salePrice: undefined, emoji: '💄', category: 'beauty', rating: 4.8, reviews: 167 },
  { _id: '10', name: 'Гоо сайхны багц', price: 65000, salePrice: 52000, emoji: '✨', category: 'beauty', rating: 4.6, reviews: 98 },
];

const LIVE_ACTIVITY = [
  { user: 'Б***а', item: 'Nike Air Max', time: '2 мин', city: 'УБ' },
  { user: 'Д***л', item: 'Samsung Galaxy', time: '5 мин', city: 'Дархан' },
  { user: 'М***а', item: 'Гоо сайхны багц', time: '8 мин', city: 'Эрдэнэт' },
];

const SERVICES = [
  { id: 'sv1', name: 'Үсчин', icon: 'cut' as const, color: '#EC4899', price: '15,000₮~' },
  { id: 'sv2', name: 'Гэрийн засвар', icon: 'construct' as const, color: '#F59E0B', price: '30,000₮~' },
  { id: 'sv3', name: 'Хэвлэх', icon: 'print' as const, color: '#6366F1', price: '500₮~' },
  { id: 'sv4', name: 'Машин угаалга', icon: 'car-sport' as const, color: '#10B981', price: '25,000₮~' },
];

function formatPrice(n: number) { return n.toLocaleString() + '₮'; }

// ─── Banner Carousel ──────────────────────────────────────
function BannerCarousel() {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeIndex + 1) % BANNERS.length;
      scrollRef.current?.scrollTo({ x: next * (width - 32), animated: true });
      setActiveIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
    setActiveIndex(idx);
  };

  return (
    <View style={s.bannerWrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        decelerationRate="fast"
        snapToInterval={width - 32}
        contentContainerStyle={{ gap: 0 }}
      >
        {BANNERS.map((b) => (
          <TouchableOpacity key={b.id} activeOpacity={0.9} style={[s.bannerSlide, { backgroundColor: b.color }]}>
            <View style={s.bannerContent}>
              <View style={{ flex: 1 }}>
                <Text style={s.bannerTitle}>{b.title}</Text>
                <Text style={s.bannerSub}>{b.subtitle}</Text>
                <View style={s.bannerBtn}>
                  <Text style={s.bannerBtnText}>Дэлгэрэнгүй</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" />
                </View>
              </View>
              <View style={s.bannerIconWrap}>
                <Ionicons name={b.icon} size={48} color="rgba(255,255,255,0.3)" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Dots */}
      <View style={s.dotsRow}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[s.dot, i === activeIndex && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ─── Trust Bar ────────────────────────────────────────────
function TrustBar() {
  const items = [
    { icon: 'shield-checkmark' as const, text: 'Баталгаат' },
    { icon: 'car' as const, text: 'Хурдан хүргэлт' },
    { icon: 'refresh' as const, text: '7 хоног буцаалт' },
    { icon: 'headset' as const, text: '24/7 Тусламж' },
  ];
  return (
    <View style={s.trustBar}>
      {items.map((t, i) => (
        <View key={i} style={s.trustItem}>
          <View style={s.trustIconWrap}>
            <Ionicons name={t.icon} size={16} color={BRAND} />
          </View>
          <Text style={s.trustText}>{t.text}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Flash Deal Card ──────────────────────────────────────
function FlashDealCard({ item }: { item: typeof FLASH_DEALS[0] }) {
  const disc = Math.round((1 - item.salePrice / item.price) * 100);
  const progress = Math.min(item.sold / 300, 1);
  return (
    <TouchableOpacity style={s.flashCard} activeOpacity={0.8}
      onPress={() => router.push(`/product/${item._id}`)}>
      <View style={s.flashImage}>
        <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
        <View style={s.flashDisc}>
          <Text style={s.flashDiscText}>-{disc}%</Text>
        </View>
      </View>
      <View style={s.flashBody}>
        <Text style={s.flashName} numberOfLines={1}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={s.flashPrice}>{formatPrice(item.salePrice)}</Text>
          <Text style={s.flashOld}>{formatPrice(item.price)}</Text>
        </View>
        {/* Progress bar */}
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={s.soldText}>{item.sold} ширхэг зарагдсан</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Product Card ─────────────────────────────────────────
function ProductCard({ item }: { item: typeof PRODUCTS[0] }) {
  const disc = item.salePrice ? Math.round((1 - item.salePrice / item.price) * 100) : 0;
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.8}
      onPress={() => router.push(`/product/${item._id}`)}>
      <View style={s.cardImage}>
        <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
        {disc > 0 && (
          <View style={s.discBadge}><Text style={s.discText}>-{disc}%</Text></View>
        )}
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '600' }}>{item.rating}</Text>
          <Text style={{ color: '#555', fontSize: 10 }}>({item.reviews})</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={s.price}>{formatPrice(item.salePrice || item.price)}</Text>
          {disc > 0 && <Text style={s.oldPrice}>{formatPrice(item.price)}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Live Activity Ticker ─────────────────────────────────
function LiveTicker() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setTimeout(() => setIndex((prev) => (prev + 1) % LIVE_ACTIVITY.length), 300);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const activity = LIVE_ACTIVITY[index];
  return (
    <Animated.View style={[s.liveTicker, { opacity: fadeAnim }]}>
      <View style={s.liveDot} />
      <Text style={s.liveText}>
        <Text style={{ fontWeight: '700', color: '#FFF' }}>{activity.user}</Text>
        {' '}{activity.city}-с{' '}
        <Text style={{ fontWeight: '700', color: BRAND }}>{activity.item}</Text>
        {' '}худалдаж авлаа · {activity.time} өмнө
      </Text>
    </Animated.View>
  );
}

// ─── Section Header ───────────────────────────────────────
function SectionHeader({ title, icon, onSeeAll }: { title: string; icon: keyof typeof Ionicons.glyphMap; onSeeAll?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <View style={[s.sectionIconWrap, { backgroundColor: BRAND + '15' }]}>
        <Ionicons name={icon} size={16} color={BRAND} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={s.seeAllBtn}>
          <Text style={s.seeAllText}>Бүгд</Text>
          <Ionicons name="chevron-forward" size={14} color={BRAND} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [flashEndTime] = useState(() => {
    const end = new Date();
    end.setHours(end.getHours() + 5);
    return end.getTime();
  });
  const [countdown, setCountdown] = useState('');

  // Flash deal countdown
  useEffect(() => {
    const tick = () => {
      const diff = flashEndTime - Date.now();
      if (diff <= 0) { setCountdown('00:00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [flashEndTime]);

  return (
    <View style={s.container}>
      {/* Header Search */}
      <View style={s.headerBar}>
        <View style={s.searchWrap}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Бараа, дэлгүүр хайх..."
            placeholderTextColor="#555"
            onFocus={() => router.push('/(tabs)/search')}
          />
          <TouchableOpacity style={s.searchFilter}>
            <Ionicons name="options" size={18} color="#A0A0A0" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color="#FFF" />
          <View style={s.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Live Activity Ticker */}
        <LiveTicker />

        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Trust Bar */}
        <TrustBar />

        {/* Categories Grid */}
        <SectionHeader title="Ангилал" icon="grid" />
        <View style={s.catGrid}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c.key} style={s.catCard} activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/search')}>
              <View style={[s.catIconWrap, { backgroundColor: c.color + '20' }]}>
                <Ionicons name={c.icon} size={22} color={c.color} />
              </View>
              <Text style={s.catLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Flash Deals */}
        <View style={s.flashSection}>
          <View style={s.flashHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="flash" size={20} color="#FFC107" />
              <Text style={s.flashTitle}>Flash Deal</Text>
            </View>
            <View style={s.timerWrap}>
              <Ionicons name="time" size={14} color={BRAND} />
              <Text style={s.timerText}>{countdown}</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {FLASH_DEALS.map((item) => (
              <FlashDealCard key={item._id} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* Featured Stores */}
        <SectionHeader title="Онцлох дэлгүүрүүд" icon="storefront" onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, marginBottom: 8 }}>
          {FEATURED_STORES.map((store) => (
            <TouchableOpacity key={store.id} style={s.storeCard} activeOpacity={0.8}>
              <Text style={{ fontSize: 32 }}>{store.emoji}</Text>
              <Text style={s.storeName}>{store.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text style={s.storeRating}>{store.rating}</Text>
                <Text style={s.storeFollowers}>· {store.followers}</Text>
              </View>
              <TouchableOpacity style={s.followBtn}>
                <Text style={s.followText}>Дагах</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Services */}
        <SectionHeader title="Үйлчилгээ" icon="construct" onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginBottom: 8 }}>
          {SERVICES.map((sv) => (
            <TouchableOpacity key={sv.id} style={s.serviceCard} activeOpacity={0.8}>
              <View style={[s.serviceIcon, { backgroundColor: sv.color + '20' }]}>
                <Ionicons name={sv.icon} size={24} color={sv.color} />
              </View>
              <Text style={s.serviceName}>{sv.name}</Text>
              <Text style={s.servicePrice}>{sv.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending */}
        <SectionHeader title="Trending" icon="trending-up" onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, marginBottom: 8 }}>
          {TRENDING.map((item, i) => (
            <TouchableOpacity key={item._id} style={s.trendCard} activeOpacity={0.8}
              onPress={() => router.push(`/product/${item._id}`)}>
              <View style={s.trendRank}>
                <Text style={s.trendRankText}>{i + 1}</Text>
              </View>
              <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
              <Text style={s.trendName} numberOfLines={1}>{item.name}</Text>
              <Text style={s.trendPrice}>{formatPrice(item.price)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text style={{ fontSize: 10, color: '#A0A0A0' }}>{item.rating} ({item.reviews})</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommended Products Grid */}
        <SectionHeader title="Танд санал болгох" icon="sparkles" onSeeAll={() => {}} />
        <View style={s.grid}>
          {PRODUCTS.map((item) => (
            <View key={item._id} style={s.gridItem}>
              <ProductCard item={item} />
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerLogo}>eseller.mn</Text>
          <Text style={s.footerText}>Монголын #1 AI Marketplace</Text>
          <Text style={s.footerVersion}>v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Header
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#111111', gap: 12 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2A', borderRadius: 12, paddingHorizontal: 14, height: 44, gap: 10, borderWidth: 0.5, borderColor: '#3D3D3D' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, padding: 0 },
  searchFilter: { padding: 4 },
  notifBtn: { position: 'relative', padding: 4 },
  notifDot: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND },

  // Live Ticker
  liveTicker: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#111111', gap: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  liveText: { fontSize: 12, color: '#A0A0A0', flex: 1 },

  // Banner
  bannerWrap: { paddingTop: 8 },
  bannerSlide: { width: width - 32, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  bannerContent: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', lineHeight: 28 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  bannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(0,0,0,0.2)', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  bannerBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  bannerIconWrap: { marginLeft: 12 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3D3D3D' },
  dotActive: { width: 20, backgroundColor: BRAND },

  // Trust
  trustBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, paddingHorizontal: 8, marginTop: 8, marginHorizontal: 16, backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 0.5, borderColor: '#2A2A2A' },
  trustItem: { alignItems: 'center', gap: 6 },
  trustIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(232,36,44,0.1)', alignItems: 'center', justifyContent: 'center' },
  trustText: { fontSize: 9, color: '#A0A0A0', fontWeight: '600', textAlign: 'center' },

  // Categories
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 8 },
  catCard: { width: '25%', alignItems: 'center', paddingVertical: 12 },
  catIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catLabel: { fontSize: 11, fontWeight: '600', color: '#E0E0E0', textAlign: 'center' },

  // Flash Deals
  flashSection: { marginTop: 8 },
  flashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  flashTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  timerWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(232,36,44,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  timerText: { fontSize: 14, fontWeight: '800', color: BRAND, fontVariant: ['tabular-nums'] },
  flashCard: { width: 150, backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 0.5, borderColor: '#3D3D3D', overflow: 'hidden' },
  flashImage: { height: 120, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  flashDisc: { position: 'absolute', top: 8, left: 8, backgroundColor: BRAND, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  flashDiscText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  flashBody: { padding: 10 },
  flashName: { fontSize: 12, fontWeight: '600', color: '#FFF', marginBottom: 4 },
  flashPrice: { fontSize: 15, fontWeight: '900', color: BRAND },
  flashOld: { fontSize: 10, color: '#555', textDecorationLine: 'line-through' },
  progressBg: { height: 4, backgroundColor: '#2A2A2A', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: BRAND, borderRadius: 2 },
  soldText: { fontSize: 9, color: '#777', marginTop: 4 },

  // Featured Stores
  storeCard: { width: 120, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#2A2A2A' },
  storeName: { fontSize: 13, fontWeight: '700', color: '#FFF', marginTop: 8, marginBottom: 4 },
  storeRating: { fontSize: 10, color: '#F59E0B', fontWeight: '600' },
  storeFollowers: { fontSize: 10, color: '#777' },
  followBtn: { marginTop: 10, backgroundColor: BRAND + '15', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14 },
  followText: { fontSize: 11, fontWeight: '700', color: BRAND },

  // Services
  serviceCard: { width: 100, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#2A2A2A' },
  serviceIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  serviceName: { fontSize: 12, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  servicePrice: { fontSize: 10, color: '#A0A0A0' },

  // Trending
  trendCard: { width: 130, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#2A2A2A', position: 'relative' },
  trendRank: { position: 'absolute', top: 8, left: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' },
  trendRankText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  trendName: { fontSize: 12, fontWeight: '700', color: '#FFF', marginTop: 8, marginBottom: 4 },
  trendPrice: { fontSize: 14, fontWeight: '900', color: BRAND, marginBottom: 4 },

  // Section Header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 20, marginBottom: 12, gap: 8 },
  sectionIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#FFF', flex: 1 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: '600', color: BRAND },

  // Product Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  gridItem: { width: '50%', padding: 4 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 0.5, borderColor: '#3D3D3D', overflow: 'hidden' },
  cardImage: { height: 140, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  discBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: BRAND, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  discText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 4, lineHeight: 18 },
  price: { fontSize: 15, fontWeight: '900', color: BRAND },
  oldPrice: { fontSize: 11, color: '#555', textDecorationLine: 'line-through' },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 32, marginTop: 16, borderTopWidth: 0.5, borderTopColor: '#2A2A2A' },
  footerLogo: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  footerText: { fontSize: 12, color: '#555', marginTop: 4 },
  footerVersion: { fontSize: 10, color: '#3D3D3D', marginTop: 8 },
});
