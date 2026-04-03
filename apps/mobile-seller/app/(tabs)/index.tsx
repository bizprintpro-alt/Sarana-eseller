import { View, Text, ScrollView, StyleSheet } from 'react-native';

const STATS = [
  { label: 'Өнөөдрийн орлого', value: '285,000₮', color: '#E8242C', bg: '#E8242C' },
  { label: 'Захиалга', value: '12', color: '#3B82F6', bg: '#3B82F6' },
  { label: 'Идэвхтэй бараа', value: '48', color: '#22C55E', bg: '#22C55E' },
  { label: 'Хөрвүүлэлт', value: '3.2%', color: '#F59E0B', bg: '#F59E0B' },
];

const RECENT_ORDERS = [
  { id: '1', buyer: 'Б. Мөнхбат', total: '45,000₮', status: 'Шинэ', time: '2 мин', color: '#E8242C' },
  { id: '2', buyer: 'О. Сараа', total: '89,000₮', status: 'Бэлтгэж байна', time: '15 мин', color: '#F59E0B' },
  { id: '3', buyer: 'Д. Ганбат', total: '35,000₮', status: 'Хүргэж байна', time: '32 мин', color: '#3B82F6' },
];

export default function SellerDashboard() {
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={s.greeting}>Сайн байна уу! 👋</Text>
      <Text style={s.sub}>Өнөөдрийн борлуулалтын тойм</Text>

      {/* Stats */}
      <View style={s.statsGrid}>
        {STATS.map((st) => (
          <View key={st.label} style={[s.statCard, { borderLeftColor: st.bg, borderLeftWidth: 3 }]}>
            <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent orders */}
      <View>
        <Text style={s.sectionTitle}>Сүүлийн захиалгууд</Text>
        {RECENT_ORDERS.map((o) => (
          <View key={o.id} style={s.orderCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.orderBuyer}>{o.buyer}</Text>
              <Text style={s.orderTime}>{o.time} өмнө</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.orderTotal}>{o.total}</Text>
              <View style={[s.orderBadge, { backgroundColor: o.color + '20' }]}>
                <Text style={[s.orderBadgeText, { color: o.color }]}>{o.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Weekly chart placeholder */}
      <View style={s.chartCard}>
        <Text style={s.sectionTitle}>Долоо хоногийн орлого</Text>
        <View style={s.chartBars}>
          {[48, 72, 35, 91, 64, 110, 85].map((v, i) => (
            <View key={i} style={s.barCol}>
              <View style={[s.bar, { height: v * 0.8, backgroundColor: i === 5 ? '#E8242C' : 'rgba(232,36,44,0.3)' }]} />
              <Text style={s.barLabel}>{['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'][i]}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  greeting: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  sub: { fontSize: 13, color: '#A0A0A0', marginTop: -8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#A0A0A0', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FFF', marginBottom: 10 },
  orderCard: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 0.5, borderColor: '#3D3D3D' },
  orderBuyer: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  orderTime: { fontSize: 11, color: '#555', marginTop: 2 },
  orderTotal: { fontSize: 15, fontWeight: '800', color: '#E8242C' },
  orderBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  orderBadgeText: { fontSize: 10, fontWeight: '700' },
  chartCard: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#3D3D3D' },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, marginTop: 12 },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 20, borderRadius: 4 },
  barLabel: { fontSize: 9, color: '#555', marginTop: 4 },
});
