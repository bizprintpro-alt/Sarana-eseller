import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SellerAPI, DriverAPI } from '../lib/api';

const ACCENT = '#8B5CF6';

const STATUSES = [
  { key: 'all', label: 'Бүгд' },
  { key: 'pending', label: 'Шинэ' },
  { key: 'confirmed', label: 'Баталсан' },
  { key: 'preparing', label: 'Бэлтгэж буй' },
  { key: 'ready', label: 'Бэлэн' },
  { key: 'delivering', label: 'Хүргэлтэнд' },
];

const STATUS_COLOR: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#22C55E',
  delivering: '#EC4899',
  delivered: '#10B981',
};

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function OwnerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const data = await SellerAPI.orders(filter === 'all' ? undefined : filter);
      setOrders(data?.orders || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useEffect(() => { load(); }, [filter]);

  const assignDriver = async (orderId: string) => {
    try {
      const drivers = await DriverAPI.availableDrivers();
      const list = drivers?.drivers || [];
      if (list.length === 0) {
        Alert.alert('Жолооч олдсонгүй', 'Одоогоор идэвхтэй жолооч байхгүй');
        return;
      }
      const driverNames = list.map((d: any) => `${d.name} (${d.rating}⭐, ${d.distance || '?'}км)`);
      Alert.alert('Жолооч сонгох', 'Ойролцоох жолоочид:', [
        ...list.slice(0, 3).map((d: any, i: number) => ({
          text: driverNames[i],
          onPress: async () => {
            try {
              await DriverAPI.assignOrder(orderId, d.id);
              Alert.alert('Амжилттай', 'Жолооч хуваарилагдлаа');
              load();
            } catch (err: any) {
              Alert.alert('Алдаа', err.message || 'Хуваарилахад алдаа');
            }
          },
        })),
        { text: 'Болих', style: 'cancel' },
      ]);
    } catch {
      Alert.alert('Алдаа', 'Жолоочийн мэдээлэл авахад алдаа');
    }
  };

  if (loading) {
    return <View style={st.center}><ActivityIndicator color={ACCENT} size="large" /></View>;
  }

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ACCENT} />}
    >
      {/* Status filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {STATUSES.map(s => (
          <TouchableOpacity key={s.key} style={[st.filterChip, filter === s.key && st.filterActive]}
            onPress={() => setFilter(s.key)}>
            <Text style={[st.filterText, filter === s.key && { color: '#FFF' }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {orders.length === 0 ? (
        <View style={st.empty}>
          <Ionicons name="receipt-outline" size={48} color="#333" />
          <Text style={st.emptyText}>Захиалга байхгүй</Text>
        </View>
      ) : (
        orders.map(o => {
          const color = STATUS_COLOR[o.status] || '#999';
          const isReady = o.status === 'ready';
          return (
            <TouchableOpacity
              key={o.id}
              style={st.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/(seller)/order/${o.id}` as any)}
            >
              <View style={st.cardHeader}>
                <Text style={st.cardId}>#{o.orderNumber || o.id?.slice(-5)}</Text>
                <View style={[st.statusBadge, { backgroundColor: color + '22' }]}>
                  <Text style={[st.statusText, { color }]}>{o.status}</Text>
                </View>
              </View>
              <Text style={st.cardCustomer}>{o.user?.name || 'Хэрэглэгч'}</Text>
              <Text style={st.cardTotal}>{fmt(o.total || 0)}</Text>
              <Text style={st.cardDate}>
                {new Date(o.createdAt).toLocaleDateString('mn-MN')}
              </Text>

              {/* Assign driver button for ready orders */}
              {isReady && (
                <TouchableOpacity
                  style={st.assignBtn}
                  onPress={() => assignDriver(o.id)}
                >
                  <Ionicons name="bicycle" size={16} color="#FFF" />
                  <Text style={st.assignText}>Жолооч хуваарилах</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },

  filterChip: { backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 0.5, borderColor: '#2A2A2A' },
  filterActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  filterText: { color: '#999', fontSize: 12, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#666', fontSize: 14, marginTop: 12 },

  card: {
    backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardId: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardCustomer: { color: '#CCC', fontSize: 13, marginBottom: 2 },
  cardTotal: { color: '#22C55E', fontSize: 14, fontWeight: '800', marginBottom: 2 },
  cardDate: { color: '#777', fontSize: 11 },

  assignBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#F59E0B', borderRadius: 10, padding: 10, marginTop: 10,
  },
  assignText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});
