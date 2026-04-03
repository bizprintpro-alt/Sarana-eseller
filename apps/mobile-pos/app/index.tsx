import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PRODUCTS = [
  { id: '1', name: 'Premium цагаан цамц', price: 35000, emoji: '👕' },
  { id: '2', name: 'Sporty гутал Air', price: 69000, emoji: '👟' },
  { id: '3', name: 'Designer малгай', price: 22000, emoji: '🧢' },
  { id: '4', name: 'Leather цүнх', price: 75000, emoji: '👜' },
  { id: '5', name: 'Пицца Маргарита', price: 38000, emoji: '🍕' },
  { id: '6', name: 'Burger Double set', price: 35000, emoji: '🍔' },
  { id: '7', name: 'iPhone 15 Pro case', price: 18000, emoji: '📱' },
  { id: '8', name: 'Bluetooth чихэвч', price: 99000, emoji: '🎧' },
  { id: '9', name: 'Нүүрний крем SPF50', price: 28000, emoji: '💄' },
  { id: '10', name: 'Yoga mat pro', price: 44000, emoji: '🧘' },
  { id: '11', name: 'Гэрийн ургамал', price: 15000, emoji: '🌿' },
  { id: '12', name: 'Гоо сайхны багц', price: 52000, emoji: '✨' },
];

interface CartItem { id: string; name: string; price: number; emoji: string; qty: number }

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function POSTerminal() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');

  const filtered = search ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())) : PRODUCTS;

  const addToCart = (p: typeof PRODUCTS[0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === p.id);
      if (existing) return prev.map((c) => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter((c) => c.qty > 0));
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const vat = Math.round(subtotal * 10 / 110);
  const cityTax = Math.round(subtotal * 2 / 102);
  const total = subtotal;

  return (
    <View style={s.container}>
      {/* ═══ LEFT: Products ═══ */}
      <View style={s.left}>
        <View style={s.searchBar}>
          <TextInput style={s.searchInput} value={search} onChangeText={setSearch}
            placeholder="🔍 Бараа хайх эсвэл баркод скан..." placeholderTextColor="#555" />
        </View>
        <FlatList data={filtered} keyExtractor={(i) => i.id} numColumns={4}
          contentContainerStyle={{ padding: 8, gap: 8 }}
          columnWrapperStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.productCard} onPress={() => addToCart(item)} activeOpacity={0.7}>
              <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
              <Text style={s.prodName} numberOfLines={2}>{item.name}</Text>
              <Text style={s.prodPrice}>{fmt(item.price)}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ═══ RIGHT: Cart ═══ */}
      <View style={s.right}>
        <Text style={s.cartTitle}>🛒 Сагс ({cart.length})</Text>

        <ScrollView style={{ flex: 1 }}>
          {cart.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🛒</Text>
              <Text style={{ color: '#555', fontSize: 13 }}>Бараа сонгоно уу</Text>
            </View>
          ) : (
            cart.map((item) => (
              <View key={item.id} style={s.cartItem}>
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={s.cartName} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.cartPrice}>{fmt(item.price)}</Text>
                </View>
                <View style={s.qtyControl}>
                  <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={s.qtyBtn}><Text style={s.qtyBtnText}>−</Text></TouchableOpacity>
                  <Text style={s.qtyNum}>{item.qty}</Text>
                  <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={s.qtyBtn}><Text style={s.qtyBtnText}>+</Text></TouchableOpacity>
                </View>
                <Text style={s.lineTotal}>{fmt(item.price * item.qty)}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Totals */}
        <View style={s.totals}>
          <View style={s.totalRow}><Text style={s.totalLabel}>НӨАТ 10%</Text><Text style={s.totalVal}>{fmt(vat)}</Text></View>
          <View style={s.totalRow}><Text style={s.totalLabel}>Хотын татвар 2%</Text><Text style={s.totalVal}>{fmt(cityTax)}</Text></View>
          <View style={[s.totalRow, { borderTopWidth: 1, borderTopColor: '#2A2A2A', paddingTop: 10, marginTop: 6 }]}>
            <Text style={s.grandLabel}>НИЙТ</Text>
            <Text style={s.grandVal}>{fmt(total)}</Text>
          </View>
        </View>

        {/* Payment buttons */}
        <View style={s.payBtns}>
          <TouchableOpacity style={[s.payBtn, { backgroundColor: '#22C55E' }]}><Text style={s.payText}>💵 Бэлнээр</Text></TouchableOpacity>
          <TouchableOpacity style={[s.payBtn, { backgroundColor: '#3B82F6' }]}><Text style={s.payText}>📱 QPay</Text></TouchableOpacity>
          <TouchableOpacity style={[s.payBtn, { backgroundColor: '#8B5CF6' }]}><Text style={s.payText}>💳 Карт</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#0A0A0A' },
  left: { flex: 1, borderRightWidth: 0.5, borderRightColor: '#2A2A2A' },
  right: { width: 360, backgroundColor: '#111111', padding: 12 },
  searchBar: { padding: 8, backgroundColor: '#111111' },
  searchInput: { backgroundColor: '#2A2A2A', borderRadius: 10, paddingHorizontal: 14, height: 40, color: '#FFF', fontSize: 13, borderWidth: 0.5, borderColor: '#3D3D3D' },
  productCard: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#3D3D3D', minHeight: 110 },
  prodName: { fontSize: 11, fontWeight: '600', color: '#E0E0E0', textAlign: 'center', marginTop: 6, lineHeight: 14 },
  prodPrice: { fontSize: 12, fontWeight: '800', color: '#E8242C', marginTop: 4 },
  cartTitle: { fontSize: 15, fontWeight: '800', color: '#FFF', marginBottom: 10 },
  cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  cartName: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  cartPrice: { fontSize: 10, color: '#555', marginTop: 1 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  qtyNum: { fontSize: 13, fontWeight: '700', color: '#FFF', minWidth: 20, textAlign: 'center' },
  lineTotal: { fontSize: 13, fontWeight: '800', color: '#E8242C', marginLeft: 8, minWidth: 60, textAlign: 'right' },
  totals: { paddingVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalLabel: { fontSize: 11, color: '#A0A0A0' },
  totalVal: { fontSize: 11, color: '#E0E0E0' },
  grandLabel: { fontSize: 16, fontWeight: '900', color: '#FFF' },
  grandVal: { fontSize: 20, fontWeight: '900', color: '#E8242C' },
  payBtns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  payBtn: { flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  payText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
});
