import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useCart } from '../lib/cartStore';

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function CartScreen() {
  const { items, updateQuantity, removeItem, total, itemCount, clearCart } = useCart();

  return (
    <View style={s.container}>
      {items.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
          <Text style={s.emptyTitle}>Сагс хоосон байна</Text>
          <Text style={s.emptyDesc}>Дэлгүүрээс бараа нэмээрэй</Text>
          <TouchableOpacity style={s.shopBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={s.shopBtnText}>Дэлгүүр үзэх</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 120 }}>
            {items.map((item) => (
              <View key={item.productId} style={s.card}>
                <Text style={{ fontSize: 28 }}>{item.emoji || '📦'}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.price}>{fmt(item.price)}</Text>
                </View>
                <View style={s.qtyRow}>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantity(item.productId, -1)}>
                    <Text style={s.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.qty}>{item.quantity}</Text>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantity(item.productId, 1)}>
                    <Text style={s.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.lineTotal}>{fmt(item.price * item.quantity)}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Bottom bar */}
          <View style={s.bottomBar}>
            <View>
              <Text style={s.totalLabel}>{itemCount} бараа</Text>
              <Text style={s.totalValue}>{fmt(total)}</Text>
            </View>
            <TouchableOpacity style={s.checkoutBtn} onPress={() => router.push('/checkout')} activeOpacity={0.8}>
              <Text style={s.checkoutText}>Захиалах</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#A0A0A0', marginBottom: 20 },
  shopBtn: { backgroundColor: '#E8242C', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  shopBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: '#3D3D3D' },
  name: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  price: { fontSize: 11, color: '#A0A0A0', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  qty: { fontSize: 14, fontWeight: '700', color: '#FFF', minWidth: 20, textAlign: 'center' },
  lineTotal: { fontSize: 14, fontWeight: '800', color: '#E8242C', minWidth: 60, textAlign: 'right' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111111', padding: 16, paddingBottom: 32, borderTopWidth: 0.5, borderTopColor: '#2A2A2A' },
  totalLabel: { fontSize: 11, color: '#A0A0A0' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  checkoutBtn: { backgroundColor: '#E8242C', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  checkoutText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
