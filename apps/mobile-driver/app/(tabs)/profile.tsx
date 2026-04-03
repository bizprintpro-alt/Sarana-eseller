import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function DriverProfile() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A0A0A' }} contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
      <View style={s.avatar}><Text style={{ fontSize: 36 }}>🚚</Text></View>
      <Text style={s.name}>Жолооч</Text>
      <Text style={s.sub}>Онлайн · 4.9 ★</Text>
      <View style={s.statsRow}>
        <View style={s.stat}><Text style={s.statVal}>312</Text><Text style={s.statLabel}>Хүргэлт</Text></View>
        <View style={[s.stat, { borderLeftWidth: 0.5, borderLeftColor: '#2A2A2A' }]}><Text style={s.statVal}>4.9</Text><Text style={s.statLabel}>Үнэлгээ</Text></View>
        <View style={[s.stat, { borderLeftWidth: 0.5, borderLeftColor: '#2A2A2A' }]}><Text style={s.statVal}>98%</Text><Text style={s.statLabel}>Ирц</Text></View>
      </View>
      {['⚙️ Тохиргоо', '🚗 Машины мэдээлэл', '📞 Холбоо барих', '❓ Тусламж'].map((m) => (
        <TouchableOpacity key={m} style={s.menuItem}><Text style={s.menuText}>{m}</Text><Text style={{ color: '#3D3D3D' }}>›</Text></TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  sub: { fontSize: 13, color: '#22C55E', marginTop: 2, fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 12, marginTop: 20, width: '100%', borderWidth: 0.5, borderColor: '#3D3D3D' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statVal: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  statLabel: { fontSize: 10, color: '#A0A0A0', marginTop: 2 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 0.5, borderColor: '#3D3D3D' },
  menuText: { fontSize: 14, fontWeight: '600', color: '#E0E0E0' },
});
