import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SellerAPI } from '../lib/api';

const ACCENT = '#8B5CF6';
const BRAND = '#E8242C';

interface DashStats {
  todayOrders: number;
  todayRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  rating: number;
}

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<DashStats>({
    todayOrders: 0, todayRevenue: 0, totalProducts: 0, pendingOrders: 0, rating: 0,
  });
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [analytics, productsData] = await Promise.all([
        SellerAPI.stats(),
        SellerAPI.products(),
      ]);
      if (analytics) {
        setStats({
          todayOrders: analytics.todayOrders || analytics.totalOrders || 0,
          todayRevenue: analytics.todayRevenue || analytics.totalRevenue || 0,
          totalProducts: analytics.totalProducts || 0,
          pendingOrders: analytics.pendingOrders || 0,
          rating: analytics.averageRating || 0,
        });
      }
      // Filter low stock
      const prods = productsData?.products || [];
      const low = prods
        .filter((p: any) => (p.stock ?? p.inventory ?? 999) < 5)
        .map((p: any) => ({ id: p.id, name: p.name, stock: p.stock ?? p.inventory ?? 0 }));
      setLowStock(low);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  if (loading) {
    return <View style={st.center}><ActivityIndicator color={ACCENT} size="large" /></View>;
  }

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ACCENT} />}
    >
      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <TouchableOpacity style={st.alertBanner} onPress={() => router.push('/(owner)/products' as any)}>
          <View style={st.alertLeft}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={st.alertText}>
              ⚠️ {lowStock.length} бараа дуусах дөхөж байна
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
        </TouchableOpacity>
      )}

      {/* Stats grid */}
      <View style={st.statsGrid}>
        <View style={[st.statCard, { borderLeftColor: ACCENT }]}>
          <Text style={st.statValue}>{stats.todayOrders}</Text>
          <Text style={st.statLabel}>Өнөөдрийн захиалга</Text>
        </View>
        <View style={[st.statCard, { borderLeftColor: '#22C55E' }]}>
          <Text style={st.statValue}>{stats.todayRevenue.toLocaleString()}₮</Text>
          <Text style={st.statLabel}>Орлого</Text>
        </View>
        <View style={[st.statCard, { borderLeftColor: '#3B82F6' }]}>
          <Text style={st.statValue}>{stats.totalProducts}</Text>
          <Text style={st.statLabel}>Нийт бараа</Text>
        </View>
        <View style={[st.statCard, { borderLeftColor: '#F59E0B' }]}>
          <Text style={st.statValue}>{stats.pendingOrders}</Text>
          <Text style={st.statLabel}>Хүлээгдэж буй</Text>
        </View>
      </View>

      {/* Quick actions */}
      <Text style={st.section}>Түргэн үйлдэл</Text>
      <View style={st.actionsRow}>
        {[
          { icon: 'add-circle' as const, label: 'Бараа нэмэх', color: ACCENT, route: '/(seller)/product/new' },
          { icon: 'receipt' as const, label: 'Захиалга', color: '#3B82F6', route: '/(owner)/orders' },
          { icon: 'cash' as const, label: 'Орлого гаргах', color: '#22C55E', route: '/(owner)/analytics' },
        ].map(a => (
          <TouchableOpacity key={a.label} style={st.actionCard} onPress={() => router.push(a.route as any)}>
            <View style={[st.actionIcon, { backgroundColor: a.color + '22' }]}>
              <Ionicons name={a.icon} size={24} color={a.color} />
            </View>
            <Text style={st.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Low stock list */}
      {lowStock.length > 0 && (
        <>
          <Text style={st.section}>Дуусах дөхсөн бараа</Text>
          {lowStock.map(item => (
            <View key={item.id} style={st.lowStockCard}>
              <Ionicons name="cube" size={20} color="#F59E0B" />
              <Text style={st.lowName} numberOfLines={1}>{item.name}</Text>
              <View style={st.lowBadge}>
                <Text style={st.lowCount}>{item.stock} үлдсэн</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Rating card */}
      {stats.rating > 0 && (
        <View style={st.ratingCard}>
          <Ionicons name="star" size={28} color="#F59E0B" />
          <View>
            <Text style={st.ratingValue}>{stats.rating.toFixed(1)}</Text>
            <Text style={st.ratingLabel}>Дундаж үнэлгээ</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },

  alertBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F59E0B15', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 0.5, borderColor: '#F59E0B33',
  },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertText: { color: '#F59E0B', fontSize: 13, fontWeight: '700' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  statCard: {
    width: '47%' as any, backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16,
    borderWidth: 0.5, borderColor: '#2A2A2A', borderLeftWidth: 3,
  },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#999', fontSize: 11, marginTop: 4 },

  section: { color: '#FFF', fontSize: 16, fontWeight: '800', marginTop: 20, marginBottom: 12 },

  actionsRow: { flexDirection: 'row', gap: 10 },
  actionCard: {
    flex: 1, backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { color: '#CCC', fontSize: 11, fontWeight: '600', textAlign: 'center' },

  lowStockCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  lowName: { flex: 1, color: '#E0E0E0', fontSize: 13, fontWeight: '600' },
  lowBadge: { backgroundColor: '#F59E0B22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  lowCount: { color: '#F59E0B', fontSize: 11, fontWeight: '800' },

  ratingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, marginTop: 16,
    borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  ratingValue: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  ratingLabel: { color: '#999', fontSize: 11 },
});
