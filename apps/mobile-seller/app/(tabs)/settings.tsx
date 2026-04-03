import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const MENU = [
  { icon: '🏪', label: 'Дэлгүүрийн мэдээлэл' },
  { icon: '🎨', label: 'AI Дэлгүүр засварлагч' },
  { icon: '📊', label: 'Аналитик' },
  { icon: '💰', label: 'Хэтэвч' },
  { icon: '🔗', label: 'Интеграц' },
  { icon: '📢', label: 'Мэдэгдэл' },
  { icon: '🔒', label: 'Аюулгүй байдал' },
  { icon: '📞', label: 'Холбоо барих' },
];

export default function SellerSettings() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A0A0A' }} contentContainerStyle={{ padding: 16 }}>
      <View style={s.profile}>
        <View style={s.avatar}><Text style={{ fontSize: 28 }}>🏪</Text></View>
        <Text style={s.name}>Миний дэлгүүр</Text>
        <Text style={s.plan}>Үнэгүй туршилт</Text>
      </View>
      <View style={s.menuCard}>
        {MENU.map((m, i) => (
          <TouchableOpacity key={m.label} style={[s.menuItem, i < MENU.length - 1 && s.menuBorder]} activeOpacity={0.7}>
            <Text style={{ fontSize: 18 }}>{m.icon}</Text>
            <Text style={s.menuLabel}>{m.label}</Text>
            <Text style={{ color: '#3D3D3D', fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.logoutBtn}><Text style={s.logoutText}>Гарах</Text></TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  profile: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  name: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  plan: { fontSize: 11, color: '#E8242C', fontWeight: '600', marginTop: 4 },
  menuCard: { backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 0.5, borderColor: '#3D3D3D', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuBorder: { borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#E0E0E0' },
  logoutBtn: { marginTop: 20, padding: 14, alignItems: 'center', backgroundColor: 'rgba(232,36,44,0.1)', borderRadius: 12 },
  logoutText: { color: '#E8242C', fontWeight: '700', fontSize: 14 },
});
