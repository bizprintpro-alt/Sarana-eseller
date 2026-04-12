import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OrdersAPI } from '../lib/api';

const STEPS = [
  { key: 'pending', label: 'Захиалга өгсөн', icon: '🛒' },
  { key: 'confirmed', label: 'Баталгаажсан', icon: '✅' },
  { key: 'preparing', label: 'Бэлтгэж байна', icon: '👨‍🍳' },
  { key: 'delivering', label: 'Хүргэж байна', icon: '🚚' },
  { key: 'delivered', label: 'Хүргэгдсэн', icon: '📦' },
];

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadOrder();
    // Poll for status updates every 10 seconds
    pollRef.current = setInterval(loadOrder, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const loadOrder = async () => {
    try {
      const data = await OrdersAPI.getOrder(id!);
      setOrder(data);
    } catch {}
    setLoading(false);
  };

  const confirmReceived = () => {
    Alert.alert('Баталгаажуулах', 'Захиалгаа хүлээн авсан уу?', [
      { text: 'Болих', style: 'cancel' },
      { text: 'Тийм', onPress: async () => {
        try {
          // POST /api/orders/{id}/confirm
          Alert.alert('Амжилттай', 'Захиалга баталгаажлаа!');
          loadOrder();
        } catch {}
      }},
    ]);
  };

  if (loading) {
    return <View style={s.container}><Text style={s.loadingText}>Ачааллаж байна...</Text></View>;
  }

  if (!order) {
    return <View style={s.container}><Text style={s.loadingText}>Захиалга олдсонгүй</Text></View>;
  }

  const currentStep = STEPS.findIndex(s => s.key === order.status);
  const isDelivering = order.status === 'delivering';
  const isDelivered = order.status === 'delivered' || order.status === 'completed';

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.orderId}>#{order.orderNumber || id?.slice(-5)}</Text>
        <Text style={s.date}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('mn-MN') : ''}</Text>
      </View>

      {/* Status timeline */}
      <View style={s.timeline}>
        {STEPS.map((step, i) => {
          const done = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <View key={step.key} style={s.stepRow}>
              <View style={s.stepLeft}>
                <View style={[s.dot, done && s.dotDone, isCurrent && s.dotCurrent]}>
                  <Text style={{ fontSize: 14 }}>{step.icon}</Text>
                </View>
                {i < STEPS.length - 1 && <View style={[s.line, done && s.lineDone]} />}
              </View>
              <View style={s.stepRight}>
                <Text style={[s.stepLabel, done && s.stepLabelDone]}>{step.label}</Text>
                {isCurrent && <Text style={s.stepActive}>Одоо</Text>}
              </View>
            </View>
          );
        })}
      </View>

      {/* Delivery info */}
      {isDelivering && (
        <View style={s.deliveryCard}>
          <View style={s.deliveryDot} />
          <Text style={s.deliveryText}>Хүргэлтэнд яваа</Text>
        </View>
      )}

      {/* Items */}
      <Text style={s.section}>Бараанууд</Text>
      {(order.items || []).map((item: any, i: number) => (
        <View key={i} style={s.itemCard}>
          <Text style={{ fontSize: 24 }}>{item.emoji || '📦'}</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.itemName}>{item.name}</Text>
            <Text style={s.itemQty}>{item.quantity || 1} × {fmt(item.price || 0)}</Text>
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
        {order.deliveryFee > 0 && (
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Хүргэлт</Text>
            <Text style={s.totalValue}>{fmt(order.deliveryFee)}</Text>
          </View>
        )}
        <View style={[s.totalRow, { borderTopWidth: 1, borderTopColor: '#2A2A2A', paddingTop: 8, marginTop: 4 }]}>
          <Text style={[s.totalLabel, { color: '#FFF', fontWeight: '800' }]}>Нийт</Text>
          <Text style={[s.totalValue, { color: '#E8242C', fontSize: 18 }]}>{fmt(order.total || 0)}</Text>
        </View>
      </View>

      {/* Delivery address */}
      {order.delivery && (
        <>
          <Text style={s.section}>Хүргэлт</Text>
          <View style={s.addressCard}>
            {order.delivery.phone && (
              <View style={s.addressRow}>
                <Ionicons name="call-outline" size={16} color="#999" />
                <Text style={s.addressText}>{order.delivery.phone}</Text>
              </View>
            )}
            <View style={s.addressRow}>
              <Ionicons name="location-outline" size={16} color="#999" />
              <Text style={s.addressText}>{order.delivery.address || `${order.delivery.district || ''} ${order.delivery.street || ''}`}</Text>
            </View>
          </View>
        </>
      )}

      {/* Action buttons */}
      {isDelivering && (
        <TouchableOpacity style={s.confirmBtn} onPress={confirmReceived}>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={s.confirmText}>Хүлээн авсан</Text>
        </TouchableOpacity>
      )}

      {isDelivered && (
        <View style={s.doneCard}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>✅</Text>
          <Text style={{ color: '#22C55E', fontSize: 16, fontWeight: '700' }}>Захиалга амжилттай хүргэгдсэн</Text>
        </View>
      )}

      {/* Chat + Return */}
      <View style={s.bottomActions}>
        <TouchableOpacity style={s.secondaryBtn}>
          <Ionicons name="chatbubble-outline" size={18} color="#CCC" />
          <Text style={s.secondaryText}>Дэлгүүртэй чат</Text>
        </TouchableOpacity>
        {!isDelivered && order.status !== 'cancelled' && (
          <TouchableOpacity style={[s.secondaryBtn, { borderColor: '#E8242C44' }]}>
            <Ionicons name="return-down-back-outline" size={18} color="#E8242C" />
            <Text style={[s.secondaryText, { color: '#E8242C' }]}>Буцаалт</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  loadingText: { color: '#555', textAlign: 'center', marginTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  orderId: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  date: { color: '#666', fontSize: 12 },
  timeline: { marginBottom: 20, paddingLeft: 8 },
  stepRow: { flexDirection: 'row', minHeight: 56 },
  stepLeft: { width: 36, alignItems: 'center' },
  dot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3D3D3D' },
  dotDone: { backgroundColor: '#E8242C', borderColor: '#E8242C' },
  dotCurrent: { shadowColor: '#E8242C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8 },
  line: { width: 2, flex: 1, backgroundColor: '#3D3D3D', marginVertical: 4 },
  lineDone: { backgroundColor: '#E8242C' },
  stepRight: { flex: 1, paddingLeft: 12, paddingTop: 5 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
  stepLabelDone: { color: '#FFF' },
  stepActive: { fontSize: 10, color: '#E8242C', fontWeight: '700', marginTop: 2 },
  deliveryCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#3B82F611', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#3B82F633' },
  deliveryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
  deliveryText: { color: '#3B82F6', fontSize: 14, fontWeight: '700' },
  section: { color: '#FFF', fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 10 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 0.5, borderColor: '#2A2A2A' },
  itemName: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  itemQty: { color: '#999', fontSize: 11, marginTop: 2 },
  itemTotal: { color: '#E8242C', fontSize: 14, fontWeight: '800' },
  totalsCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: '#2A2A2A', marginTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalLabel: { color: '#999', fontSize: 13 },
  totalValue: { color: '#E0E0E0', fontSize: 13, fontWeight: '700' },
  addressCard: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, gap: 8, borderWidth: 0.5, borderColor: '#2A2A2A' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressText: { color: '#CCC', fontSize: 13, flex: 1 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 16, marginTop: 20 },
  confirmText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  doneCard: { alignItems: 'center', paddingVertical: 20, marginTop: 16 },
  bottomActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 12, paddingVertical: 12 },
  secondaryText: { color: '#CCC', fontSize: 13, fontWeight: '600' },
});
