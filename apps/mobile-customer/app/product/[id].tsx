import { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent,
  Share, Animated, Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BRAND = '#E8242C';
const GALLERY_HEIGHT = 400;

// ─── Demo Product (will be API-driven) ────────────────────
const DEMO_PRODUCTS: Record<string, any> = {
  '1': {
    _id: '1', name: 'Premium цагаан цамц', price: 35000, emoji: '👕',
    description: 'Өндөр чанартай хөвөн материалтай. Бүх улиралд тохиромжтой, тав тухтай.',
    rating: 4.5, reviewCount: 45, store: { name: 'Fashion Hub', verified: true },
    category: 'Хувцас',
    images: [
      { type: 'image', uri: '', emoji: '👕' },
      { type: 'image', uri: '', emoji: '👕' },
      { type: 'image', uri: '', emoji: '👕' },
    ],
    specs: [
      { label: 'Материал', value: '100% Хөвөн' },
      { label: 'Хэмжээ', value: 'S, M, L, XL' },
      { label: 'Өнгө', value: 'Цагаан, Хар, Саарал' },
      { label: 'Угаалга', value: 'Машинд угаана' },
    ],
    modifiers: [
      { group: 'Хэмжээ', options: ['S', 'M', 'L', 'XL'] },
      { group: 'Өнгө', options: ['Цагаан', 'Хар', 'Саарал'] },
    ],
  },
  '2': {
    _id: '2', name: 'Sporty гутал Air', price: 89000, salePrice: 69000, emoji: '👟',
    description: 'Спорт болон өдөр тутамд тохиромжтой. Чанартай, тохилог. Агаарын дэр технологи бүхий ул бүхий гутал.',
    rating: 4.8, reviewCount: 128, store: { name: 'SportsMN', verified: true },
    category: 'Гутал',
    images: [
      { type: 'image', uri: '', emoji: '👟' },
      { type: 'image', uri: '', emoji: '👟' },
      { type: 'video', uri: '', emoji: '🎬' },
      { type: 'image', uri: '', emoji: '👟' },
    ],
    specs: [
      { label: 'Брэнд', value: 'Air Sport' },
      { label: 'Хэмжээ', value: '39-45' },
      { label: 'Материал', value: 'Mesh + Арьс' },
      { label: 'Ул', value: 'Air Cushion' },
      { label: 'Жин', value: '350г' },
    ],
    modifiers: [
      { group: 'Хэмжээ', options: ['39', '40', '41', '42', '43', '44', '45'] },
      { group: 'Өнгө', options: ['Хар', 'Цагаан', 'Улаан'] },
    ],
  },
};

function getProduct(id: string) {
  return DEMO_PRODUCTS[id] || {
    _id: id, name: 'Бараа #' + id, price: 50000, emoji: '📦',
    description: 'Чанартай бараа.', rating: 4.5, reviewCount: 10,
    store: { name: 'eseller.mn', verified: false }, category: 'Бусад',
    images: [{ type: 'image', uri: '', emoji: '📦' }],
    specs: [], modifiers: [],
  };
}

function formatPrice(n: number) { return n.toLocaleString() + '₮'; }

// ─── Image Gallery ────────────────────────────────────────
function ImageGallery({ images, discount }: { images: any[]; discount: number }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  }, []);

  const scrollTo = (idx: number) => {
    flatListRef.current?.scrollToIndex({ index: idx, animated: true });
    setActiveIndex(idx);
  };

  return (
    <View>
      {/* Main Gallery */}
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <View style={s.gallerySlide}>
            <Text style={{ fontSize: 100 }}>{item.emoji}</Text>
            {item.type === 'video' && (
              <View style={s.videoOverlay}>
                <View style={s.playBtn}>
                  <Ionicons name="play" size={32} color="#FFF" />
                </View>
                <Text style={s.videoLabel}>Видео</Text>
              </View>
            )}
          </View>
        )}
      />

      {/* Discount badge */}
      {discount > 0 && (
        <View style={s.discBadge}>
          <Text style={s.discText}>-{discount}%</Text>
        </View>
      )}

      {/* Image counter */}
      <View style={s.counterBadge}>
        <Ionicons name={images[activeIndex]?.type === 'video' ? 'videocam' : 'image'} size={12} color="#FFF" />
        <Text style={s.counterText}>{activeIndex + 1}/{images.length}</Text>
      </View>

      {/* Pagination dots */}
      <View style={s.dotsRow}>
        {images.map((img, i) => (
          <TouchableOpacity key={i} onPress={() => scrollTo(i)}>
            <View style={[
              s.dot,
              i === activeIndex && s.dotActive,
              img.type === 'video' && i === activeIndex && s.dotVideo,
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.thumbStrip}>
          {images.map((img, i) => (
            <TouchableOpacity key={i} onPress={() => scrollTo(i)}
              style={[s.thumb, i === activeIndex && s.thumbActive]}>
              <Text style={{ fontSize: 20 }}>{img.emoji}</Text>
              {img.type === 'video' && (
                <View style={s.thumbVideoIcon}>
                  <Ionicons name="play" size={8} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Star Rating ──────────────────────────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = Math.round(rating);
  return (
    <View style={s.ratingRow}>
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons key={i} name={i < stars ? 'star' : 'star-outline'} size={14}
            color={i < stars ? '#F59E0B' : '#3D3D3D'} />
        ))}
      </View>
      <Text style={s.ratingText}>{rating}</Text>
      <Text style={s.ratingCount}>({count} үнэлгээ)</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const product = getProduct(id as string);
  const disc = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const images = product.images || [{ type: 'image', uri: '', emoji: product.emoji }];

  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [isWished, setIsWished] = useState(false);

  const handleShare = async () => {
    await Share.share({ message: `${product.name} — ${formatPrice(product.salePrice || product.price)}\nhttps://eseller.mn/product/${product._id}` });
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ─── Gallery ─── */}
        <ImageGallery images={images} discount={disc} />

        {/* ─── Quick Actions ─── */}
        <View style={s.quickActions}>
          <TouchableOpacity style={s.quickBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#A0A0A0" />
            <Text style={s.quickBtnText}>Хуваалцах</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn} onPress={() => setIsWished(!isWished)}>
            <Ionicons name={isWished ? 'heart' : 'heart-outline'} size={20}
              color={isWished ? BRAND : '#A0A0A0'} />
            <Text style={[s.quickBtnText, isWished && { color: BRAND }]}>Хадгалах</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn}>
            <Ionicons name="chatbubble-outline" size={20} color="#A0A0A0" />
            <Text style={s.quickBtnText}>Асуух</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Store Info ─── */}
        <TouchableOpacity style={s.storeBar}>
          <View style={s.storeAvatar}>
            <Ionicons name="storefront" size={18} color="#A0A0A0" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={s.storeName}>{product.store.name}</Text>
              {product.store.verified && <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />}
            </View>
            <Text style={s.storeCat}>{product.category}</Text>
          </View>
          <TouchableOpacity style={s.visitStoreBtn}>
            <Text style={s.visitStoreText}>Дэлгүүр</Text>
            <Ionicons name="chevron-forward" size={12} color={BRAND} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ─── Product Info ─── */}
        <View style={s.info}>
          <Text style={s.name}>{product.name}</Text>

          <StarRating rating={product.rating} count={product.reviewCount} />

          {/* Price */}
          <View style={s.priceRow}>
            <Text style={s.price}>{formatPrice(product.salePrice || product.price)}</Text>
            {disc > 0 && (
              <>
                <Text style={s.oldPrice}>{formatPrice(product.price)}</Text>
                <View style={s.saveBadge}>
                  <Text style={s.saveText}>{formatPrice(product.price - product.salePrice)} хэмнэлт</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ─── Modifiers ─── */}
        {product.modifiers?.length > 0 && (
          <View style={s.modSection}>
            {product.modifiers.map((mod: any) => (
              <View key={mod.group} style={s.modGroup}>
                <Text style={s.modGroupLabel}>
                  {mod.group}: <Text style={{ color: BRAND }}>{selectedModifiers[mod.group] || 'Сонгоно уу'}</Text>
                </Text>
                <View style={s.modOptions}>
                  {mod.options.map((opt: string) => {
                    const isSelected = selectedModifiers[mod.group] === opt;
                    return (
                      <TouchableOpacity key={opt}
                        style={[s.modPill, isSelected && s.modPillActive]}
                        onPress={() => setSelectedModifiers({ ...selectedModifiers, [mod.group]: opt })}>
                        <Text style={[s.modPillText, isSelected && s.modPillTextActive]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ─── Quantity ─── */}
        <View style={s.qtyRow}>
          <Text style={s.qtyLabel}>Тоо ширхэг:</Text>
          <View style={s.qtyControl}>
            <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
              <Ionicons name="remove" size={18} color="#FFF" />
            </TouchableOpacity>
            <Text style={s.qtyValue}>{qty}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(qty + 1)}>
              <Ionicons name="add" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Trust Badges ─── */}
        <View style={s.trustRow}>
          {[
            { icon: 'car-outline' as const, text: 'Хурдан хүргэлт', color: '#10B981' },
            { icon: 'shield-checkmark-outline' as const, text: 'Баталгаатай', color: '#3B82F6' },
            { icon: 'refresh-outline' as const, text: '7 хоног буцаалт', color: '#F59E0B' },
            { icon: 'card-outline' as const, text: 'Аюулгүй төлбөр', color: '#8B5CF6' },
          ].map((t) => (
            <View key={t.text} style={s.trustItem}>
              <Ionicons name={t.icon} size={18} color={t.color} />
              <Text style={s.trustText}>{t.text}</Text>
            </View>
          ))}
        </View>

        {/* ─── Tabs: Desc / Specs / Reviews ─── */}
        <View style={s.tabsRow}>
          {(['desc', 'specs', 'reviews'] as const).map((tab) => (
            <TouchableOpacity key={tab}
              style={[s.tab, activeTab === tab && s.tabActive]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                {tab === 'desc' ? 'Тайлбар' : tab === 'specs' ? 'Үзүүлэлт' : `Сэтгэгдэл (${product.reviewCount})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={s.tabContent}>
          {activeTab === 'desc' && (
            <Text style={s.descText}>{product.description}</Text>
          )}
          {activeTab === 'specs' && product.specs?.length > 0 && (
            <View>
              {product.specs.map((spec: any, i: number) => (
                <View key={spec.label} style={[s.specRow, i % 2 === 0 && s.specRowAlt]}>
                  <Text style={s.specLabel}>{spec.label}</Text>
                  <Text style={s.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          )}
          {activeTab === 'reviews' && (
            <View style={s.reviewsEmpty}>
              <Ionicons name="chatbubbles-outline" size={40} color="#3D3D3D" />
              <Text style={s.reviewsEmptyText}>Сэтгэгдэл байхгүй байна</Text>
              <TouchableOpacity style={s.writeReviewBtn}>
                <Text style={s.writeReviewText}>Сэтгэгдэл бичих</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── Bottom Bar ─── */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.wishBtn} onPress={() => setIsWished(!isWished)}>
          <Ionicons name={isWished ? 'heart' : 'heart-outline'} size={22}
            color={isWished ? BRAND : '#A0A0A0'} />
        </TouchableOpacity>
        <TouchableOpacity style={s.chatBtn}>
          <Ionicons name="chatbubble-outline" size={22} color="#A0A0A0" />
        </TouchableOpacity>
        <TouchableOpacity style={s.cartBtn} activeOpacity={0.8}>
          <Ionicons name="cart" size={18} color="#FFF" />
          <Text style={s.cartBtnText}>Сагсанд нэмэх — {formatPrice((product.salePrice || product.price) * qty)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Gallery
  gallerySlide: { width, height: GALLERY_HEIGHT, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(232,36,44,0.9)', alignItems: 'center', justifyContent: 'center' },
  videoLabel: { color: '#FFF', fontSize: 12, fontWeight: '700', marginTop: 8 },
  discBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: BRAND, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  discText: { fontSize: 14, fontWeight: '900', color: '#FFF' },
  counterBadge: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  counterText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3D3D3D' },
  dotActive: { width: 24, backgroundColor: BRAND },
  dotVideo: { backgroundColor: '#6366F1' },

  // Thumbnails
  thumbStrip: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: BRAND },
  thumbVideoIcon: { position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(99,102,241,0.9)', alignItems: 'center', justifyContent: 'center' },

  // Quick Actions
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A' },
  quickBtn: { alignItems: 'center', gap: 4 },
  quickBtnText: { fontSize: 11, color: '#777', fontWeight: '600' },

  // Store
  storeBar: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, backgroundColor: '#111111', marginTop: 1 },
  storeAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  storeName: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  storeCat: { fontSize: 11, color: '#777', marginTop: 2 },
  visitStoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(232,36,44,0.1)' },
  visitStoreText: { fontSize: 12, fontWeight: '700', color: BRAND },

  // Info
  info: { padding: 16 },
  name: { fontSize: 22, fontWeight: '900', color: '#FFF', letterSpacing: -0.3, lineHeight: 30 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  ratingText: { fontSize: 14, fontWeight: '800', color: '#F59E0B' },
  ratingCount: { fontSize: 12, color: '#777' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  price: { fontSize: 28, fontWeight: '900', color: BRAND },
  oldPrice: { fontSize: 16, color: '#555', textDecorationLine: 'line-through' },
  saveBadge: { backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  saveText: { fontSize: 12, fontWeight: '700', color: '#10B981' },

  // Modifiers
  modSection: { paddingHorizontal: 16, paddingBottom: 8 },
  modGroup: { marginBottom: 14 },
  modGroupLabel: { fontSize: 14, fontWeight: '700', color: '#E0E0E0', marginBottom: 10 },
  modOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#3D3D3D' },
  modPillActive: { backgroundColor: 'rgba(232,36,44,0.1)', borderColor: BRAND },
  modPillText: { fontSize: 14, fontWeight: '600', color: '#A0A0A0' },
  modPillTextActive: { color: BRAND, fontWeight: '800' },

  // Quantity
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 0.5, borderTopColor: '#1A1A1A' },
  qtyLabel: { fontSize: 14, fontWeight: '700', color: '#E0E0E0' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  qtyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  qtyValue: { width: 48, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#FFF' },

  // Trust
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 0.5, borderColor: '#2A2A2A' },
  trustText: { fontSize: 11, fontWeight: '600', color: '#D0D0D0' },

  // Tabs
  tabsRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A', marginTop: 8 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: BRAND },
  tabText: { fontSize: 13, fontWeight: '600', color: '#777' },
  tabTextActive: { color: '#FFF', fontWeight: '800' },
  tabContent: { padding: 16, minHeight: 120 },
  descText: { fontSize: 14, color: '#D0D0D0', lineHeight: 24 },

  // Specs
  specRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8 },
  specRowAlt: { backgroundColor: '#111111' },
  specLabel: { width: 120, fontSize: 13, fontWeight: '600', color: '#777' },
  specValue: { flex: 1, fontSize: 13, fontWeight: '600', color: '#E0E0E0' },

  // Reviews
  reviewsEmpty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  reviewsEmptyText: { fontSize: 14, color: '#555' },
  writeReviewBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'rgba(232,36,44,0.1)', borderRadius: 10 },
  writeReviewText: { fontSize: 13, fontWeight: '700', color: BRAND },

  // Bottom Bar
  bottomBar: { flexDirection: 'row', padding: 16, paddingBottom: 28, gap: 10, borderTopWidth: 0.5, borderTopColor: '#2A2A2A', backgroundColor: '#111111' },
  wishBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#2A2A2A' },
  chatBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#2A2A2A' },
  cartBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: BRAND, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  cartBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});
