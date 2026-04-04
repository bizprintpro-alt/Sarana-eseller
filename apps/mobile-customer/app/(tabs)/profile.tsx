import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BRAND = '#E8242C';

// ─── Quick Stats ──────────────────────────────────────────
const STATS = [
  { icon: 'bag-check' as const, label: 'Захиалга', value: '0', color: '#6366F1' },
  { icon: 'heart' as const, label: 'Хүслийн', value: '0', color: '#EC4899' },
  { icon: 'star' as const, label: 'Оноо', value: '0', color: '#F59E0B' },
  { icon: 'gift' as const, label: 'Купон', value: '0', color: '#10B981' },
];

// ─── Quick Actions ────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: 'wallet' as const, label: 'Төлбөр', color: '#6366F1' },
  { icon: 'location' as const, label: 'Хаяг', color: '#10B981' },
  { icon: 'notifications' as const, label: 'Мэдэгдэл', color: '#F59E0B' },
  { icon: 'help-circle' as const, label: 'Тусламж', color: '#3B82F6' },
];

// ─── Menu Sections ────────────────────────────────────────
const MENU_SHOPPING = [
  { icon: 'receipt-outline' as const, label: 'Миний захиалгууд', desc: 'Бүх захиалга, төлөв', action: 'orders' },
  { icon: 'heart-outline' as const, label: 'Хүслийн жагсаалт', desc: 'Хадгалсан барааны жагсаалт', action: 'wishlist' },
  { icon: 'time-outline' as const, label: 'Сүүлд үзсэн', desc: 'Үзсэн бараануудын түүх', action: 'recent' },
  { icon: 'pricetag-outline' as const, label: 'Купон & Урамшуулал', desc: 'Хөнгөлөлтийн купонууд', action: 'coupons' },
];

const MENU_ACCOUNT = [
  { icon: 'chatbubble-outline' as const, label: 'Мессеж', desc: 'Дэлгүүртэй чатлах', action: 'chat' },
  { icon: 'star-outline' as const, label: 'Миний сэтгэгдэл', desc: 'Бичсэн сэтгэгдлүүд', action: 'reviews' },
  { icon: 'storefront-outline' as const, label: 'Борлуулагч болох', desc: 'Дэлгүүрээ нээх', action: 'become-seller', badge: 'HOT' },
];

const MENU_SETTINGS = [
  { icon: 'person-outline' as const, label: 'Хувийн мэдээлэл', desc: 'Нэр, утас, имэйл', action: 'edit-profile' },
  { icon: 'lock-closed-outline' as const, label: 'Нууц үг солих', desc: 'Аюулгүй байдал', action: 'password' },
  { icon: 'language-outline' as const, label: 'Хэл', desc: 'Монгол', action: 'language' },
  { icon: 'moon-outline' as const, label: 'Харанхуй горим', desc: 'Идэвхтэй', action: 'theme' },
  { icon: 'call-outline' as const, label: 'Холбоо барих', desc: 'Тусламж, санал хүсэлт', action: 'contact' },
  { icon: 'document-text-outline' as const, label: 'Үйлчилгээний нөхцөл', desc: 'Нууцлалын бодлого', action: 'terms' },
];

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Хэрэглэгч');

  const handleAction = (action: string) => {
    switch (action) {
      case 'orders':
        router.push('/(tabs)/orders');
        break;
      case 'wishlist':
      case 'chat':
      case 'reviews':
      case 'recent':
      case 'coupons':
        if (!isLoggedIn) {
          Alert.alert('Нэвтрэх шаардлагатай', 'Энэ хэсгийг ашиглахын тулд нэвтэрнэ үү', [
            { text: 'Нэвтрэх', onPress: () => router.push('/(auth)/login' as any) },
            { text: 'Болих' },
          ]);
          return;
        }
        Alert.alert('Удахгүй', 'Энэ хэсэг удахгүй нээгдэнэ.');
        break;
      case 'become-seller':
        Linking.openURL('https://nextjs-biz6.vercel.app/become-seller');
        break;
      case 'contact':
        Alert.alert('Холбоо барих', 'Имэйл: info@eseller.mn\nУтас: 7000-1234', [
          { text: 'Залгах', onPress: () => Linking.openURL('tel:70001234') },
          { text: 'Хаах' },
        ]);
        break;
      case 'edit-profile':
      case 'password':
      case 'language':
      case 'theme':
      case 'terms':
        Alert.alert('Тохиргоо', 'Удахгүй нэмэгдэнэ.');
        break;
    }
  };

  const renderMenuItem = (item: typeof MENU_SHOPPING[0] & { badge?: string }) => (
    <TouchableOpacity
      key={item.label}
      style={s.menuItem}
      activeOpacity={0.7}
      onPress={() => handleAction(item.action)}
    >
      <View style={s.menuIconWrap}>
        <Ionicons name={item.icon} size={20} color="#A0A0A0" />
      </View>
      <View style={s.menuContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={s.menuLabel}>{item.label}</Text>
          {item.badge && (
            <View style={s.hotBadge}>
              <Text style={s.hotBadgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Text style={s.menuDesc}>{item.desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#3D3D3D" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* ─── Profile Header ─── */}
      <View style={s.profileHeader}>
        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Ionicons name={isLoggedIn ? 'person' : 'person-outline'} size={36} color="#888" />
          </View>
          {isLoggedIn && (
            <View style={s.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
            </View>
          )}
        </View>

        <Text style={s.userName}>{userName}</Text>
        <Text style={s.userEmail}>{isLoggedIn ? 'user@eseller.mn' : 'Нэвтрэх шаардлагатай'}</Text>

        {!isLoggedIn ? (
          <View style={s.authBtns}>
            <TouchableOpacity style={s.loginBtn} onPress={() => router.push('/(auth)/login' as any)}>
              <Ionicons name="log-in-outline" size={18} color="#FFF" />
              <Text style={s.loginText}>Нэвтрэх</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.registerBtn} onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={s.registerText}>Бүртгүүлэх</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.editProfileBtn}>
            <Ionicons name="create-outline" size={14} color={BRAND} />
            <Text style={s.editProfileText}>Профайл засах</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Stats Row ─── */}
      <View style={s.statsRow}>
        {STATS.map((stat) => (
          <TouchableOpacity key={stat.label} style={s.statItem}>
            <View style={[s.statIcon, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={s.statValue}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Quick Actions ─── */}
      <View style={s.quickRow}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity key={action.label} style={s.quickItem}>
            <View style={[s.quickIcon, { backgroundColor: action.color + '15' }]}>
              <Ionicons name={action.icon} size={20} color={action.color} />
            </View>
            <Text style={s.quickLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Membership Card ─── */}
      <TouchableOpacity style={s.memberCard} activeOpacity={0.8}>
        <View style={s.memberLeft}>
          <Ionicons name="diamond" size={24} color="#FFC107" />
          <View>
            <Text style={s.memberTitle}>eSeller Гишүүнчлэл</Text>
            <Text style={s.memberDesc}>Онооно оноо цуглуулж урамшуулал авах</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#FFC107" />
      </TouchableOpacity>

      {/* ─── Shopping Menu ─── */}
      <View style={s.sectionHeader}>
        <Ionicons name="bag-handle" size={16} color={BRAND} />
        <Text style={s.sectionTitle}>Худалдан авалт</Text>
      </View>
      <View style={s.menuCard}>
        {MENU_SHOPPING.map(renderMenuItem)}
      </View>

      {/* ─── Account Menu ─── */}
      <View style={s.sectionHeader}>
        <Ionicons name="person-circle" size={16} color={BRAND} />
        <Text style={s.sectionTitle}>Миний бүртгэл</Text>
      </View>
      <View style={s.menuCard}>
        {MENU_ACCOUNT.map(renderMenuItem)}
      </View>

      {/* ─── Settings Menu ─── */}
      <View style={s.sectionHeader}>
        <Ionicons name="settings" size={16} color={BRAND} />
        <Text style={s.sectionTitle}>Тохиргоо</Text>
      </View>
      <View style={s.menuCard}>
        {MENU_SETTINGS.map(renderMenuItem)}
      </View>

      {/* ─── Logout ─── */}
      {isLoggedIn && (
        <TouchableOpacity style={s.logoutBtn}
          onPress={() => { setIsLoggedIn(false); setUserName('Хэрэглэгч'); }}>
          <Ionicons name="log-out-outline" size={18} color={BRAND} />
          <Text style={s.logoutText}>Гарах</Text>
        </TouchableOpacity>
      )}

      {/* ─── Footer ─── */}
      <View style={s.footer}>
        <Text style={s.footerLogo}>eseller.mn</Text>
        <Text style={s.footerText}>Монголын #1 AI Marketplace</Text>
        <Text style={s.footerVersion}>v1.0.0 · © 2025</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Profile Header
  profileHeader: { alignItems: 'center', paddingTop: 24, paddingBottom: 20, backgroundColor: '#111111', borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#3D3D3D' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: -2, backgroundColor: '#111111', borderRadius: 12, padding: 2 },
  userName: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  userEmail: { fontSize: 13, color: '#777', marginTop: 4 },

  // Auth buttons
  authBtns: { flexDirection: 'row', gap: 12, marginTop: 16 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: BRAND, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  loginText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  registerBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#3D3D3D' },
  registerText: { color: '#E0E0E0', fontWeight: '700', fontSize: 15 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(232,36,44,0.1)' },
  editProfileText: { fontSize: 13, fontWeight: '700', color: BRAND },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, paddingHorizontal: 16, backgroundColor: '#111111', marginTop: 1 },
  statItem: { alignItems: 'center', gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  statLabel: { fontSize: 11, color: '#777', fontWeight: '600' },

  // Quick Actions
  quickRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, paddingHorizontal: 16, marginTop: 8 },
  quickItem: { alignItems: 'center', gap: 8 },
  quickIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '600', color: '#D0D0D0' },

  // Membership
  memberCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 8, padding: 16, backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,193,7,0.2)' },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  memberTitle: { fontSize: 14, fontWeight: '800', color: '#FFC107' },
  memberDesc: { fontSize: 11, color: '#999', marginTop: 2 },

  // Section Header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#FFF' },

  // Menu Card
  menuCard: { marginHorizontal: 16, backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 0.5, borderColor: '#2A2A2A', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#222222', gap: 12 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '700', color: '#E0E0E0' },
  menuDesc: { fontSize: 11, color: '#666', marginTop: 2 },
  hotBadge: { backgroundColor: BRAND, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  hotBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF' },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 24, padding: 14, backgroundColor: 'rgba(232,36,44,0.08)', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(232,36,44,0.15)' },
  logoutText: { color: BRAND, fontWeight: '800', fontSize: 15 },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 32, marginTop: 16 },
  footerLogo: { fontSize: 18, fontWeight: '900', color: '#333' },
  footerText: { fontSize: 11, color: '#333', marginTop: 4 },
  footerVersion: { fontSize: 10, color: '#2A2A2A', marginTop: 8, marginBottom: 40 },
});
