import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function EarningsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A0A0A' }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={s.bigCard}>
        <Text style={s.bigLabel}>Нийт орлого</Text>
        <Text style={s.bigValue}>1,284,500₮</Text>
        <Text style={s.bigSub}>Энэ сард</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={[s.card, { flex: 1 }]}><Text style={s.val}>312</Text><Text style={s.label}>Хүргэлт</Text></View>
        <View style={[s.card, { flex: 1 }]}><Text style={[s.val, { color: '#F59E0B' }]}>42,500₮</Text><Text style={s.label}>Өнөөдөр</Text></View>
      </View>
      <View style={s.card}>
        <Text style={[s.label, { marginBottom: 8 }]}>Долоо хоногийн орлого</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80 }}>
          {[28, 45, 32, 61, 38, 52, 42].map((v, i) => (
            <View key={i} style={{ alignItems: 'center' }}>
              <View style={{ width: 24, height: v, backgroundColor: i === 3 ? '#E8242C' : 'rgba(232,36,44,0.3)', borderRadius: 4 }} />
              <Text style={{ fontSize: 9, color: '#555', marginTop: 3 }}>{['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'][i]}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  bigCard: { backgroundColor: '#E8242C', borderRadius: 16, padding: 20, alignItems: 'center' },
  bigLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  bigValue: { fontSize: 32, fontWeight: '900', color: '#FFF', marginTop: 4 },
  bigSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  val: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  label: { fontSize: 11, color: '#A0A0A0', marginTop: 2 },
});
