import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const ORDERS = [
  { id: '1', num: 'ORD-1001', buyer: 'Бат-Эрдэнэ', total: 70000, status: 'pending', items: 2 },
  { id: '2', num: 'ORD-1002', buyer: 'Сарангэрэл', total: 99000, status: 'confirmed', items: 1 },
  { id: '3', num: 'ORD-1003', buyer: 'Ганбаатар', total: 91000, status: 'preparing', items: 3 },
  { id: '4', num: 'ORD-1004', buyer: 'Нараа', total: 45000, status: 'delivering', items: 1 },
  { id: '5', num: 'ORD-1005', buyer: 'Болд', total: 35000, status: 'delivered', items: 2 },
];

const ST: Record<string, { label: string; color: string; action?: string }> = {
  pending: { label: '⏳ Шинэ', color: '#E8242C', action: 'Баталгаажуулах' },
  confirmed: { label: '✅ Баталсан', color: '#3B82F6', action: 'Бэлтгэж эхлэх' },
  preparing: { label: '👨‍🍳 Бэлтгэж буй', color: '#F59E0B', action: 'Бэлэн болсон' },
  delivering: { label: '🚚 Хүргэж буй', color: '#3B82F6' },
  delivered: { label: '✓ Дууссан', color: '#22C55E' },
};

export default function SellerOrders() {
  return (
    <FlatList data={ORDERS} keyExtractor={(i) => i.id} style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      renderItem={({ item }) => {
        const st = ST[item.status] || ST.pending;
        return (
          <TouchableOpacity style={s.card} onPress={() => router.push(`/orders/${item.id}`)} activeOpacity={0.8}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={s.num}>{item.num}</Text>
                <Text style={s.buyer}>{item.buyer} · {item.items} бараа</Text>
              </View>
              <Text style={s.total}>{item.total.toLocaleString()}₮</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <View style={[s.badge, { backgroundColor: st.color + '15' }]}>
                <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
              </View>
              {st.action && (
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: st.color }]}>
                  <Text style={s.actionText}>{st.action}</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  num: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  buyer: { fontSize: 12, color: '#A0A0A0', marginTop: 2 },
  total: { fontSize: 17, fontWeight: '900', color: '#E8242C' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  actionBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  actionText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
});
