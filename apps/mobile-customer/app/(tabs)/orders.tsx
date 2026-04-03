import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const DEMO_ORDERS = [
  { _id: '1', orderNumber: 'ORD-1001', total: 70000, status: 'delivering', items: 2, date: '2026-04-03' },
  { _id: '2', orderNumber: 'ORD-1002', total: 99000, status: 'confirmed', items: 1, date: '2026-04-02' },
  { _id: '3', orderNumber: 'ORD-1003', total: 35000, status: 'delivered', items: 3, date: '2026-04-01' },
];

const STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Хүлээгдэж буй', color: '#F59E0B' },
  confirmed: { label: 'Баталгаажсан', color: '#3B82F6' },
  preparing: { label: 'Бэлтгэж байна', color: '#F59E0B' },
  delivering: { label: 'Хүргэж байна', color: '#3B82F6' },
  delivered: { label: 'Хүргэгдсэн', color: '#22C55E' },
  cancelled: { label: 'Цуцлагдсан', color: '#E8242C' },
};

export default function OrdersScreen() {
  return (
    <View style={s.container}>
      <FlatList
        data={DEMO_ORDERS}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => {
          const st = STATUS[item.status] || STATUS.pending;
          return (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/order/${item._id}`)} activeOpacity={0.8}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.orderNum}>{item.orderNumber}</Text>
                <View style={[s.badge, { backgroundColor: st.color + '20' }]}>
                  <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={s.meta}>{item.items} бараа · {item.date}</Text>
                <Text style={s.total}>{item.total.toLocaleString()}₮</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>📦</Text>
            <Text style={{ color: '#A0A0A0', fontSize: 14 }}>Захиалга байхгүй</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  orderNum: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  meta: { fontSize: 12, color: '#A0A0A0' },
  total: { fontSize: 15, fontWeight: '800', color: '#E8242C' },
  empty: { alignItems: 'center', paddingTop: 80 },
});
