import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OrdersAPI, SellerAPI } from '../../lib/api';

const STATUS_FLOW = [
  { key: 'confirmed', label: 'Баталгаажуулах', icon: 'checkmark-circle' as const, color: '#3B82F6' },
  { key: 'preparing', label: 'Бэлтгэж байна', icon: 'restaurant' as const, color: '#F59E0B' },
  { key: 'ready', label: 'Бэлэн болсон', icon: 'bag-check' as const, color: '#22C55E' },
  { key: 'delivering', label: 'Жолоочид өгсөн', icon: 'bicycle' as const, color: '#8B5CF6' },
];

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { loadOrder(); }, []);

  const loadOrder = async () => {
    try {
      const data = await OrdersAPI.getOrder(id!);
      setOrder(data);
    } catch {}
    setLoading(false);
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await SellerAPI.updateOrderStatus(id!, status);
      Alert.alert('Амжилттай', `Статус "${status}" болгосон`);
      loadOrder();
    } catch (err: any) {
      Alert.alert('Алдаа', err.message || 'Статус өөрчлөхөд алдаа');
    }
    setUpdating(false);
  };

  if (loading) {
    return <View style={s.container}><Text style={{ color: '#555', textAlign: 'center', marginTop: 40 }}>Ачааллаж байна...</Text></View>;
  }

  if (!order) {
    return <View style={s.container}><Text style={{ color: '#555', textAlign: 'center', marginTop: 40 }}>Захиалга олдсонгүй</Text></View>;
  }

  const currentIdx = STATUS_FLOW.findIndex((s) => s.key === order.status);
  const nextStatus = STATUS_FLOW[currentIdx + 1];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.orderId}>#{order.orderNumber || id?.slice(-5)}</Text>
        <View style={[s.badge, { backgroundColor: '#22C55E22' }]}>
          <Text style={[s.badgeText, { color: '#22C55E' }]}>{order.status}</Text>
        </View>
      </View>

      {/* Status timeline */}
      <View style={s.timeline}>
        {STATUS_FLOW.map((step, i) => {
          const done = i <= currentIdx;
          return (
            <View key={step.key} style={s.timelineStep}>
              <View style={[s.dot, done && { backgroundColor: step.color }]}>
                <Ionicons name={step.icon} size={14} color={done ? '#FFF' : '#555'} />
              </View>
              <Text style={[s.stepLabel, done && { color: '#FFF' }]}>{step.label}</Text>
              {i < STATUS_FLOW.length - 1 && <View style={[s.line, done && { backgroundColor: step.color }]} />}
            </View>
          );
        })}
      </View>

      {/* Next action button */}
      {nextStatus && (
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: nextStatus.color }, updating && { opacity: 0.5 }]}
          onPress={() => updateStatus(nextStatus.key)} disabled={updating}>
          <Ionicons name={nextStatus.icon} size={20} color="#FFF" />
          <Text style={s.actionText}>{nextStatus.label}</Text>
        </TouchableOpacity>
      )}

      {/* Items */}
      <Text style={s.section}>Бараанууд</Text>
      {(order.items || []).map((item: any, i: number) => (
        <View key={i} style={s.itemCard}>
          <Text style={{ fontSize: 24 }}>{item.emoji || '📦'}</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.itemName}>{item.name}</Text>
            <Text style={s.itemQty}>{item.quantity || 1} ширхэг × {fmt(item.price || 0)}</Text>
          </View>
          <Text style={s.itemTotal}>{fmt((item.price || 0) * (item.quantity || 1))}</Text>
        </View>
      ))}

      {/* Totals */}
      <View style={s.totalsCard}>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Дүн</Text>
          <Text style={s.totalValue}>{fmt(order.subtotal || order.total || 0)}</Text>
        </View>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Хүргэлт</Text>
          <Text style={s.totalValue}>{fmt(order.deliveryFee || 0)}</Text>
        </View>
        <View style={[s.totalRow, { borderTopWidth: 1, borderTopColor: '#2A2A2A', paddingTop: 8, marginTop: 4 }]}>
          <Text style={[s.totalLabel, { color: '#FFF', fontWeight: '800' }]}>Нийт</Text>
          <Text style={[s.totalValue, { color: '#22C55E', fontSize: 18 }]}>{fmt(order.total || 0)}</Text>
        </View>
      </View>

      {/* Customer info */}
      <Text style={s.section}>Хэрэглэгч</Text>
      <View style={s.infoCard}>
        <View style={s.infoRow}>
          <Ionicons name="person-outline" size={16} color="#999" />
          <Text style={s.infoText}>{order.user?.name || 'Хэрэглэгч'}</Text>
        </View>
        {order.delivery?.phone && (
          <View style={s.infoRow}>
            <Ionicons name="call-outline" size={16} color="#999" />
            <Text style={s.infoText}>{order.delivery.phone}</Text>
          </View>
        )}
        {(order.delivery?.address || order.delivery?.street) && (
          <View style={s.infoRow}>
            <Ionicons name="location-outline" size={16} color="#999" />
            <Text style={s.infoText}>{order.delivery?.address || `${order.delivery?.district || ''} ${order.delivery?.street || ''}`}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  orderId: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 8 },
  timelineStep: { alignItems: 'center', flex: 1 },
  dot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  stepLabel: { fontSize: 9, color: '#555', textAlign: 'center', fontWeight: '600' },
  line: { position: 'absolute', top: 15, left: '60%', right: '-40%', height: 2, backgroundColor: '#2A2A2A' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 16, marginBottom: 20 },
  actionText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  section: { color: '#FFF', fontSize: 15, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 0.5, borderColor: '#2A2A2A' },
  itemName: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  itemQty: { color: '#999', fontSize: 11, marginTop: 2 },
  itemTotal: { color: '#22C55E', fontSize: 14, fontWeight: '800' },
  totalsCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: '#2A2A2A' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalLabel: { color: '#999', fontSize: 13 },
  totalValue: { color: '#E0E0E0', fontSize: 13, fontWeight: '700' },
  infoCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, gap: 10, borderWidth: 0.5, borderColor: '#2A2A2A' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { color: '#E0E0E0', fontSize: 13 },
});
