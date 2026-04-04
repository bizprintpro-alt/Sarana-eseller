import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STATS = [
  { label: 'Өнөөдрийн захиалга', value: '12', icon: 'receipt-outline' as const, color: '#22C55E' },
  { label: 'Орлого', value: '₮840K', icon: 'cash-outline' as const, color: '#3B82F6' },
  { label: 'Нийт бараа', value: '86', icon: 'cube-outline' as const, color: '#F59E0B' },
  { label: 'Үнэлгээ', value: '4.8', icon: 'star-outline' as const, color: '#EC4899' },
];

const RECENT_ORDERS = [
  { id: '#2401', customer: 'Б.Болд', items: 3, total: '₮72,000', status: 'Шинэ', statusColor: '#22C55E' },
  { id: '#2400', customer: 'Д.Сараа', items: 1, total: '₮25,000', status: 'Бэлтгэж буй', statusColor: '#F59E0B' },
  { id: '#2399', customer: 'Г.Тэмүүлэн', items: 5, total: '₮148,000', status: 'Хүргэж буй', statusColor: '#3B82F6' },
  { id: '#2398', customer: 'О.Оюука', items: 2, total: '₮56,000', status: 'Хүргэгдсэн', statusColor: '#666' },
];

export default function SellerDashboard() {
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={s.grid}>
        {STATS.map((st) => (
          <View key={st.label} style={s.statCard}>
            <View style={[s.iconCircle, { backgroundColor: st.color + '22' }]}>
              <Ionicons name={st.icon} size={20} color={st.color} />
            </View>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      <Text style={s.section}>Сүүлийн захиалгууд</Text>

      {RECENT_ORDERS.map((o) => (
        <View key={o.id} style={s.orderCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.orderId}>{o.id} - {o.customer}</Text>
            <Text style={s.orderSub}>{o.items} бараа · {o.total}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: o.statusColor + '22' }]}>
            <Text style={[s.badgeText, { color: o.statusColor }]}>{o.status}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    width: '48%' as any,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#999', fontSize: 12, marginTop: 2 },
  section: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  orderCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  orderId: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  orderSub: { color: '#999', fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
