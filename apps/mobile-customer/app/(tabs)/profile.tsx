import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';

const MENU = [
  { icon: '📦', label: 'Захиалгууд', route: '/(tabs)/orders' },
  { icon: '❤️', label: 'Хүслийн жагсаалт', route: '/(tabs)/orders' },
  { icon: '💬', label: 'Мессеж', route: '/(tabs)/orders' },
  { icon: '🏪', label: 'Борлуулагч болох', route: '/(tabs)/orders' },
  { icon: '⚙️', label: 'Тохиргоо', route: '/(tabs)/orders' },
  { icon: '📞', label: 'Холбоо барих', route: '/(tabs)/orders' },
];

export default function ProfileScreen() {
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      {/* Avatar */}
      <View style={s.avatarSection}>
        <View style={s.avatar}><Text style={{ fontSize: 28 }}>👤</Text></View>
        <Text style={s.name}>Хэрэглэгч</Text>
        <Text style={s.email}>Нэвтрэх шаардлагатай</Text>
        <TouchableOpacity style={s.loginBtn} onPress={() => router.push('/(auth)/login' as any)}>
          <Text style={s.loginText}>Нэвтрэх</Text>
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <View style={s.menuCard}>
        {MENU.map((item, i) => (
          <TouchableOpacity key={item.label} style={[s.menuItem, i < MENU.length - 1 && s.menuBorder]} activeOpacity={0.7}>
            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Text style={{ color: '#3D3D3D', fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.version}>eseller.mn · v1.0.0</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  email: { fontSize: 13, color: '#A0A0A0', marginTop: 2 },
  loginBtn: { marginTop: 12, backgroundColor: '#E8242C', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  loginText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  menuCard: { backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 0.5, borderColor: '#3D3D3D', overflow: 'hidden', marginTop: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuBorder: { borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#E0E0E0' },
  version: { textAlign: 'center', fontSize: 11, color: '#555', marginTop: 24 },
});
