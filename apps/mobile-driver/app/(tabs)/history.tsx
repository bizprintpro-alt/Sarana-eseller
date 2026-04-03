import { View, Text, FlatList, StyleSheet } from 'react-native';

const HISTORY = [
  { id: '1', date: 'Өнөөдөр', orders: 8, earned: '42,500₮' },
  { id: '2', date: 'Өчигдөр', orders: 12, earned: '61,000₮' },
  { id: '3', date: '2026-04-01', orders: 6, earned: '28,500₮' },
];

export default function HistoryScreen() {
  return (
    <FlatList data={HISTORY} keyExtractor={(i) => i.id} style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      renderItem={({ item }) => (
        <View style={s.card}>
          <Text style={s.date}>{item.date}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={s.meta}>{item.orders} хүргэлт</Text>
            <Text style={s.earned}>{item.earned}</Text>
          </View>
        </View>
      )}
    />
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  date: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  meta: { fontSize: 12, color: '#A0A0A0' },
  earned: { fontSize: 15, fontWeight: '800', color: '#22C55E' },
});
