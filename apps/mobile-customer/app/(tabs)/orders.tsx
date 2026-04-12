import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { OrdersAPI } from '../lib/api';

const STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Хүлээгдэж буй', color: '#F59E0B' },
  confirmed: { label: 'Баталгаажсан', color: '#3B82F6' },
  preparing: { label: 'Бэлтгэж байна', color: '#F59E0B' },
  delivering: { label: 'Хүргэж байна', color: '#3B82F6' },
  delivered: { label: 'Хүргэгдсэн', color: '#22C55E' },
  completed: { label: 'Дууссан', color: '#22C55E' },
  cancelled: { label: 'Цуцлагдсан', color: '#E8242C' },
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await OrdersAPI.myOrders();
      setOrders(data.orders || []);
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  return (
    <View style={s.container}>
      <FlatList
        data={orders}
        keyExtractor={(i) => i.id || i._id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8242C" />}
        renderItem={({ item }) => {
          const st = STATUS[item.status] || STATUS.pending;
          return (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/order/${item.id || item._id}`)} activeOpacity={0.8}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.orderNum}>#{item.orderNumber || (item.id || item._id)?.slice(-5)}</Text>
                <View style={[s.badge, { backgroundColor: st.color + '20' }]}>
                  <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={s.meta}>{item.items?.length || 0} бараа · {item.createdAt ? new Date(item.createdAt).toLocaleDateString('mn-MN') : ''}</Text>
                <Text style={s.total}>{(item.total || 0).toLocaleString()}₮</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>📦</Text>
            <Text style={{ color: '#A0A0A0', fontSize: 14 }}>{loading ? 'Ачааллаж байна...' : 'Захиалга байхгүй'}</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  orderNum: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  meta: { fontSize: 12, color: '#A0A0A0' },
  total: { fontSize: 15, fontWeight: '800', color: '#E8242C' },
  empty: { alignItems: 'center', paddingTop: 80 },
});
