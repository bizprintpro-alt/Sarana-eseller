import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity, TextInput,
  Image, ActivityIndicator, StyleSheet, Dimensions,
} from 'react-native';
import { Link, router } from 'expo-router';

const { width } = Dimensions.get('window');
const BRAND = '#E8242C';

// Demo products (will connect to API)
const DEMO_PRODUCTS = [
  { _id: '1', name: 'Premium цагаан цамц', price: 35000, salePrice: undefined, emoji: '👕', category: 'fashion', rating: 4.5 },
  { _id: '2', name: 'Sporty гутал Air', price: 89000, salePrice: 69000, emoji: '👟', category: 'fashion', rating: 4.8 },
  { _id: '3', name: 'Designer малгай', price: 22000, salePrice: undefined, emoji: '🧢', category: 'fashion', rating: 4.2 },
  { _id: '4', name: 'Leather цүнх', price: 95000, salePrice: 75000, emoji: '👜', category: 'fashion', rating: 4.7 },
  { _id: '5', name: 'Пицца Маргарита', price: 38000, salePrice: undefined, emoji: '🍕', category: 'food', rating: 4.9 },
  { _id: '6', name: 'Burger Double set', price: 42000, salePrice: 35000, emoji: '🍔', category: 'food', rating: 4.6 },
  { _id: '7', name: 'iPhone 15 Pro case', price: 18000, salePrice: undefined, emoji: '📱', category: 'electronics', rating: 4.3 },
  { _id: '8', name: 'Bluetooth чихэвч', price: 125000, salePrice: 99000, emoji: '🎧', category: 'electronics', rating: 4.5 },
  { _id: '9', name: 'Нүүрний крем SPF50', price: 28000, salePrice: undefined, emoji: '💄', category: 'beauty', rating: 4.8 },
  { _id: '10', name: 'Гоо сайхны багц', price: 65000, salePrice: 52000, emoji: '✨', category: 'beauty', rating: 4.6 },
];

const CATEGORIES = [
  { key: 'all', label: 'Бүгд', emoji: '🛍' },
  { key: 'food', label: 'Хоол', emoji: '🍔' },
  { key: 'fashion', label: 'Хувцас', emoji: '👗' },
  { key: 'electronics', label: 'Тех', emoji: '📱' },
  { key: 'beauty', label: 'Гоо сайхан', emoji: '💄' },
];

function formatPrice(n: number) { return n.toLocaleString() + '₮'; }

function ProductCard({ item, onPress }: { item: any; onPress: () => void }) {
  const disc = item.salePrice ? Math.round((1 - item.salePrice / item.price) * 100) : 0;
  return (
    <TouchableOpacity onPress={onPress} style={s.card} activeOpacity={0.8}>
      <View style={s.cardImage}>
        <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
        {disc > 0 && (
          <View style={s.discBadge}><Text style={s.discText}>-{disc}%</Text></View>
        )}
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
        {item.rating && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <Text style={{ color: '#F59E0B', fontSize: 11 }}>★ {item.rating}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={s.price}>{formatPrice(item.salePrice || item.price)}</Text>
          {disc > 0 && <Text style={s.oldPrice}>{formatPrice(item.price)}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = DEMO_PRODUCTS.filter((p) => {
    if (activeCat !== 'all' && p.category !== activeCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const saleItems = DEMO_PRODUCTS.filter((p) => p.salePrice);

  return (
    <View style={s.container}>
      {/* Search */}
      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Бараа хайх..."
          placeholderTextColor="#555"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Монголын хамгийн том{'\n'}онлайн дэлгүүр</Text>
          <Text style={s.heroSub}>5,000+ бараа · 500+ дэлгүүр · Хурдан хүргэлт</Text>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c.key} onPress={() => setActiveCat(c.key)}
              style={[s.catPill, activeCat === c.key && s.catPillActive]}>
              <Text style={[s.catText, activeCat === c.key && s.catTextActive]}>{c.emoji} {c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sale Section */}
        {saleItems.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>Хямдралтай бараа</Text>
              <View style={s.saleBadge}><Text style={s.saleText}>SALE</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {saleItems.map((item) => (
                <View key={item._id} style={{ width: width * 0.42 }}>
                  <ProductCard item={item} onPress={() => router.push(`/product/${item._id}`)} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Main Grid */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>Бүх бараа</Text>
            <Text style={s.sectionCount}>{filtered.length} бараа</Text>
          </View>
          <View style={s.grid}>
            {filtered.map((item) => (
              <View key={item._id} style={s.gridItem}>
                <ProductCard item={item} onPress={() => router.push(`/product/${item._id}`)} />
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#111111' },
  searchInput: { backgroundColor: '#2A2A2A', borderRadius: 10, paddingHorizontal: 16, height: 42, color: '#FFF', fontSize: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  hero: { backgroundColor: '#E8242C', paddingHorizontal: 20, paddingVertical: 32, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#FFF', lineHeight: 34, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  catRow: { marginTop: 16, marginBottom: 8 },
  catPill: { backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 0.5, borderColor: '#3D3D3D' },
  catPillActive: { backgroundColor: '#E8242C', borderColor: '#E8242C' },
  catText: { fontSize: 12, fontWeight: '600', color: '#A0A0A0' },
  catTextActive: { color: '#FFF' },
  section: { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  sectionDot: { width: 3, height: 16, borderRadius: 2, backgroundColor: '#E8242C' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#FFF', flex: 1 },
  sectionCount: { fontSize: 12, color: '#555' },
  saleBadge: { backgroundColor: '#E8242C', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  saleText: { fontSize: 9, fontWeight: '800', color: '#FFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  gridItem: { width: '50%', padding: 4 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 10, borderWidth: 0.5, borderColor: '#3D3D3D', overflow: 'hidden' },
  cardImage: { height: 140, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  discBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#E8242C', borderRadius: 12, paddingHorizontal: 7, paddingVertical: 2 },
  discText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 4, lineHeight: 18 },
  price: { fontSize: 15, fontWeight: '900', color: '#E8242C' },
  oldPrice: { fontSize: 11, color: '#555', textDecorationLine: 'line-through' },
});
