import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DriverAPI } from '../lib/api';

const DEMO_DELIVERIES = [
  { id: 'D-101', shop: 'Миний дэлгүүр', customer: 'Б.Болд', address: 'БЗД 3-р хороо', distance: '2.4 км', reward: '₮4,500' },
  { id: 'D-102', shop: 'Fashion Store', customer: 'Д.Сараа', address: 'СБД 8-р хороо', distance: '5.1 км', reward: '₮7,200' },
  { id: 'D-103', shop: 'TechShop', customer: 'Г.Тэмүүлэн', address: 'ХУД 11-р хороо', distance: '3.8 км', reward: '₮5,800' },
];

export default function DriverDashboard() {
  const [online, setOnline] = useState(false);
  const [deliveries, setDeliveries] = useState(DEMO_DELIVERIES);
  const [refreshing, setRefreshing] = useState(false);

  const loadDeliveries = useCallback(async () => {
    try {
      const data = await DriverAPI.deliveries('pending');
      if (data.orders?.length > 0) {
        setDeliveries(data.orders.map((o: any) => ({
          id: o.orderNumber || o.id?.slice(-5),
          shop: o.shop?.name || 'Дэлгүүр',
          customer: o.user?.name || 'Хэрэглэгч',
          address: o.delivery?.address || 'Хаяг',
          distance: '',
          reward: `₮${(o.deliveryFee || 4500).toLocaleString()}`,
          _id: o.id || o._id,
        })));
      }
    } catch {}
    setRefreshing(false);
  }, []);

  useEffect(() => { if (online) loadDeliveries(); }, [online]);

  const handleToggle = async () => {
    const next = !online;
    setOnline(next);
    // TODO: add driver status endpoint
    // DriverAPI.toggleOnline(next).catch(() => {});
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Online toggle */}
      <TouchableOpacity
        style={[s.toggleBtn, online && s.toggleOnline]}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <Ionicons
          name={online ? 'radio-button-on' : 'radio-button-off'}
          size={32}
          color={online ? '#FFF' : '#F59E0B'}
        />
        <Text style={[s.toggleText, online && { color: '#FFF' }]}>
          {online ? 'Идэвхтэй' : 'Идэвхгүй'}
        </Text>
        <Text style={[s.toggleSub, online && { color: '#FFF99' }]}>
          {online ? 'Хүргэлт хүлээж байна...' : 'Хүргэлт эхлүүлэхийн тулд дарна уу'}
        </Text>
      </TouchableOpacity>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>3</Text>
          <Text style={s.statLabel}>Хүлээгдэж буй</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statValue}>8</Text>
          <Text style={s.statLabel}>Өнөөдөр хүргэсэн</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statValue, { color: '#F59E0B' }]}>₮52K</Text>
          <Text style={s.statLabel}>Өнөөдрийн орлого</Text>
        </View>
      </View>

      {/* Delivery queue */}
      <Text style={s.section}>Хүргэлтийн дараалал</Text>

      {!online ? (
        <View style={s.emptyCard}>
          <Ionicons name="bicycle" size={48} color="#333" />
          <Text style={s.emptyText}>Идэвхжүүлсний дараа хүргэлт харагдана</Text>
        </View>
      ) : (
        deliveries.map((d) => (
          <View key={d.id} style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardId}>{d.id}</Text>
              <Text style={s.cardReward}>{d.reward}</Text>
            </View>
            <Text style={s.cardShop}>{d.shop}</Text>
            <View style={s.cardRow}>
              <Ionicons name="person-outline" size={14} color="#999" />
              <Text style={s.cardDetail}>{d.customer}</Text>
            </View>
            <View style={s.cardRow}>
              <Ionicons name="location-outline" size={14} color="#999" />
              <Text style={s.cardDetail}>{d.address} · {d.distance}</Text>
            </View>
            <View style={s.cardActions}>
              <TouchableOpacity style={s.acceptBtn} activeOpacity={0.8}>
                <Ionicons name="checkmark" size={18} color="#FFF" />
                <Text style={s.acceptText}>Хүлээн авах</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmNavBtn} activeOpacity={0.8} onPress={() => router.push(`/confirm/${d.id}` as any)}>
                <Ionicons name="camera" size={18} color="#8B5CF6" />
              </TouchableOpacity>
              <TouchableOpacity style={s.rejectBtn} activeOpacity={0.8}>
                <Ionicons name="close" size={18} color="#E8242C" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  toggleBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 16,
  },
  toggleOnline: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  toggleText: { color: '#F59E0B', fontSize: 22, fontWeight: '800', marginTop: 8 },
  toggleSub: { color: '#999', fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statBox: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#999', fontSize: 10, marginTop: 2, textAlign: 'center' },
  section: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12 },
  emptyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  emptyText: { color: '#666', fontSize: 13, marginTop: 12, textAlign: 'center' },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardId: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  cardReward: { color: '#F59E0B', fontSize: 15, fontWeight: '800' },
  cardShop: { color: '#CCC', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardDetail: { color: '#999', fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  acceptText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  confirmNavBtn: {
    backgroundColor: '#8B5CF622',
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: '#E8242C22',
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
