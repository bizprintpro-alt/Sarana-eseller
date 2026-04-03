import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const SHIPMENTS = [
  { id: '1', orderNum: 'ORD-1001', from: 'SportsMN · СБД', to: 'Бат-Эрдэнэ · БЗД 3-р хороо', status: 'pickup', total: '3,500₮', distance: '4.2 км' },
  { id: '2', orderNum: 'ORD-1003', from: 'TechUB · ЧД', to: 'Ганбаатар · ХУД 7-р хороо', status: 'transit', total: '5,000₮', distance: '8.1 км' },
  { id: '3', orderNum: 'ORD-1005', from: 'BeautyMN · СХД', to: 'Нараа · НД 2-р хороо', status: 'delivery', total: '4,000₮', distance: '6.5 км' },
];

const ST: Record<string, { label: string; color: string; action: string }> = {
  pickup: { label: '📍 Авахаар очих', color: '#F59E0B', action: 'Навигаци' },
  transit: { label: '🚚 Зөөж байна', color: '#3B82F6', action: 'Хүргэх газар' },
  delivery: { label: '📦 Хүргэх', color: '#22C55E', action: 'Баталгаажуулах' },
};

export default function DriverHome() {
  return (
    <View style={s.container}>
      {/* Online toggle */}
      <View style={s.onlineBar}>
        <View style={s.onlineDot} />
        <Text style={s.onlineText}>Онлайн · 3 хүргэлт</Text>
        <Text style={s.earningToday}>Өнөөдөр: 42,500₮</Text>
      </View>

      <FlatList data={SHIPMENTS} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => {
          const st = ST[item.status];
          return (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/shipment/${item.id}`)} activeOpacity={0.8}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={s.orderNum}>{item.orderNum}</Text>
                <View style={[s.badge, { backgroundColor: st.color + '15' }]}>
                  <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <View style={s.route}>
                <View style={s.routePoint}><View style={[s.dot, { backgroundColor: '#E8242C' }]} /><Text style={s.routeText}>{item.from}</Text></View>
                <View style={s.routeLine} />
                <View style={s.routePoint}><View style={[s.dot, { backgroundColor: '#22C55E' }]} /><Text style={s.routeText}>{item.to}</Text></View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text style={s.distance}>{item.distance} · {item.total}</Text>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: st.color }]} onPress={() => item.status === 'delivery' ? router.push(`/confirm/${item.id}`) : null}>
                  <Text style={s.actionText}>{st.action}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  onlineBar: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8, backgroundColor: '#111111', borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  onlineText: { fontSize: 13, fontWeight: '700', color: '#FFF', flex: 1 },
  earningToday: { fontSize: 13, fontWeight: '800', color: '#E8242C' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: '#3D3D3D' },
  orderNum: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  route: { gap: 4 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeText: { fontSize: 12, color: '#E0E0E0' },
  routeLine: { marginLeft: 3, width: 2, height: 12, backgroundColor: '#3D3D3D' },
  distance: { fontSize: 12, color: '#555' },
  actionBtn: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  actionText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
});
