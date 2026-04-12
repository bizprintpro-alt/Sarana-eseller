import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SellerAPI } from '../lib/api';

const STATUSES = [
  { key: 'all', label: 'Бүгд', color: '#FFF' },
  { key: 'pending', label: 'Шинэ', color: '#22C55E' },
  { key: 'confirmed', label: 'Баталсан', color: '#3B82F6' },
  { key: 'preparing', label: 'Бэлтгэж буй', color: '#F59E0B' },
  { key: 'delivering', label: 'Хүргэж буй', color: '#8B5CF6' },
  { key: 'delivered', label: 'Хүргэгдсэн', color: '#666' },
];

export default function SellerOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await SellerAPI.orders(filter === 'all' ? undefined : filter);
      setOrders((data as any)?.orders || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useEffect(() => { setLoading(true); load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await SellerAPI.updateOrderStatus(id, status);
      load();
    } catch {}
  };

  return (
    <View style={s.container}>
      <FlatList
        horizontal data={STATUSES} keyExtractor={(i) => i.key}
        style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.filterChip, filter === item.key && { backgroundColor: item.color + '22', borderColor: item.color }]}
            onPress={() => setFilter(item.key)}>
            <Text style={[s.filterText, filter === item.key && { color: item.color }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={orders} keyExtractor={(i) => i.id || i._id}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#22C55E" />}
        renderItem={({ item }) => {
          const st = STATUSES.find((s) => s.key === item.status) || STATUSES[0];
          return (
            <View style={s.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.orderId}>#{item.orderNumber || (item.id || item._id)?.slice(-5)}</Text>
                <View style={[s.badge, { backgroundColor: st.color + '20' }]}>
                  <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <Text style={s.customer}>{item.user?.name || 'Хэрэглэгч'} · {item.items?.length || 0} бараа</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Text style={s.total}>{(item.total || 0).toLocaleString()}₮</Text>
                {item.status === 'pending' && (
                  <TouchableOpacity style={s.actionBtn} onPress={() => updateStatus(item.id || item._id, 'confirmed')}>
                    <Text style={s.actionText}>Батлах</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'confirmed' && (
                  <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#F59E0B' }]} onPress={() => updateStatus(item.id || item._id, 'preparing')}>
                    <Text style={s.actionText}>Бэлтгэх</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>📋</Text>
            <Text style={{ color: '#555', fontSize: 13 }}>{loading ? 'Ачааллаж байна...' : 'Захиалга байхгүй'}</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  filterRow: { maxHeight: 48, backgroundColor: '#111111', borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#3D3D3D' },
  filterText: { fontSize: 12, fontWeight: '700', color: '#A0A0A0' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  orderId: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  customer: { fontSize: 12, color: '#A0A0A0', marginTop: 4 },
  total: { fontSize: 16, fontWeight: '800', color: '#22C55E' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  actionBtn: { backgroundColor: '#22C55E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  actionText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});
