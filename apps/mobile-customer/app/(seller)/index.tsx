import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SellerAPI } from '../lib/api';

function fmt(n: number) { return n >= 1000 ? (n / 1000).toFixed(0) + 'K₮' : n + '₮'; }

export default function SellerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [s, o] = await Promise.all([
        SellerAPI.stats().catch(() => null),
        SellerAPI.orders('pending').catch(() => ({ orders: [] })),
      ]);
      if (s) setStats(s);
      setOrders((o as any)?.orders || []);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const statCards = [
    { label: 'Өнөөдрийн захиалга', value: stats?.todayOrders?.toString() || '0', icon: 'receipt-outline' as const, color: '#22C55E' },
    { label: 'Орлого', value: fmt(stats?.todayRevenue || 0), icon: 'cash-outline' as const, color: '#3B82F6' },
    { label: 'Нийт бараа', value: stats?.totalProducts?.toString() || '0', icon: 'cube-outline' as const, color: '#F59E0B' },
    { label: 'Үнэлгээ', value: stats?.rating?.toFixed(1) || '0', icon: 'star-outline' as const, color: '#EC4899' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    pending: '#22C55E', confirmed: '#3B82F6', preparing: '#F59E0B', delivering: '#3B82F6', delivered: '#666',
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#22C55E" />}>
      <View style={s.grid}>
        {statCards.map((st) => (
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

      {orders.length === 0 ? (
        <View style={{ alignItems: 'center', paddingTop: 20 }}>
          <Text style={{ color: '#555', fontSize: 13 }}>Шинэ захиалга байхгүй</Text>
        </View>
      ) : orders.slice(0, 10).map((o: any) => (
        <View key={o.id || o._id} style={s.orderCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.orderId}>#{o.orderNumber || (o.id || o._id)?.slice(-5)} - {o.user?.name || 'Хэрэглэгч'}</Text>
            <Text style={s.orderSub}>{o.items?.length || 0} бараа · {(o.total || 0).toLocaleString()}₮</Text>
          </View>
          <View style={[s.badge, { backgroundColor: (STATUS_COLORS[o.status] || '#666') + '22' }]}>
            <Text style={[s.badgeText, { color: STATUS_COLORS[o.status] || '#666' }]}>{o.status}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, width: '48%' as any, borderWidth: 1, borderColor: '#2A2A2A' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#999', fontSize: 12, marginTop: 2 },
  section: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  orderCard: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  orderId: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  orderSub: { color: '#999', fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
