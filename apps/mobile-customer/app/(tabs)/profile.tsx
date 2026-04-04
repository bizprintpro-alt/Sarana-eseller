import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MENU = [
  { icon: 'receipt-outline' as const, label: 'Захиалгууд', action: 'orders' },
  { icon: 'heart-outline' as const, label: 'Хүслийн жагсаалт', action: 'wishlist' },
  { icon: 'chatbubble-outline' as const, label: 'Мессеж', action: 'chat' },
  { icon: 'storefront-outline' as const, label: 'Борлуулагч болох', action: 'become-seller' },
  { icon: 'settings-outline' as const, label: 'Тохиргоо', action: 'settings' },
  { icon: 'call-outline' as const, label: 'Холбоо барих', action: 'contact' },
];

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Хэрэглэгч');

  const handleMenu = (action: string) => {
    switch (action) {
      case 'orders':
        router.push('/(tabs)/orders');
        break;
      case 'wishlist':
        if (!isLoggedIn) { Alert.alert('Нэвтрэх шаардлагатай', 'Хүслийн жагсаалт харахын тулд нэвтэрнэ үү', [{ text: 'Нэвтрэх', onPress: () => router.push('/(auth)/login' as any) }, { text: 'Болих' }]); return; }
        Alert.alert('Хүслийн жагсаалт', 'Удахгүй...');
        break;
      case 'chat':
        if (!isLoggedIn) { Alert.alert('Нэвтрэх шаардлагатай', '', [{ text: 'Нэвтрэх', onPress: () => router.push('/(auth)/login' as any) }, { text: 'Болих' }]); return; }
        Alert.alert('Мессеж', 'Удахгүй...');
        break;
      case 'become-seller':
        Linking.openURL('https://nextjs-biz6.vercel.app/become-seller');
        break;
      case 'settings':
        Alert.alert('Тохиргоо', 'Мэдэгдэл, хэл, нууцлал тохируулах боломжтой болно.');
        break;
      case 'contact':
        Alert.alert('Холбоо барих', 'Имэйл: info@eseller.mn\nУтас: 7000-1234', [
          { text: 'Залгах', onPress: () => Linking.openURL('tel:70001234') },
          { text: 'Хаах' },
        ]);
        break;
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      {/* Avatar */}
      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Ionicons name={isLoggedIn ? 'person' : 'person-outline'} size={32} color="#666" />
        </View>
        <Text style={s.name}>{userName}</Text>
        <Text style={s.email}>{isLoggedIn ? 'user@eseller.mn' : 'Нэвтрэх шаардлагатай'}</Text>
        {!isLoggedIn && (
          <TouchableOpacity style={s.loginBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={s.loginText}>Нэвтрэх</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu */}
      <View style={s.menuCard}>
        {MENU.map((item, i) => (
          <TouchableOpacity key={item.label} style={[s.menuItem, i < MENU.length - 1 && s.menuBorder]}
            activeOpacity={0.7} onPress={() => handleMenu(item.action)}>
            <Ionicons name={item.icon} size={20} color="#A0A0A0" />
            <Text style={s.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#3D3D3D" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      {isLoggedIn && (
        <TouchableOpacity style={s.logoutBtn} onPress={() => { setIsLoggedIn(false); setUserName('Хэрэглэгч'); }}>
          <Text style={s.logoutText}>Гарах</Text>
        </TouchableOpacity>
      )}

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
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuBorder: { borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#E0E0E0' },
  logoutBtn: { marginTop: 16, padding: 14, alignItems: 'center', backgroundColor: 'rgba(232,36,44,0.1)', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(232,36,44,0.2)' },
  logoutText: { color: '#E8242C', fontWeight: '700', fontSize: 14 },
  version: { textAlign: 'center', fontSize: 11, color: '#555', marginTop: 24, marginBottom: 40 },
});
