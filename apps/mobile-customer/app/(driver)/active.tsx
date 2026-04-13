import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DriverAPI } from '../lib/api';

const STEPS = [
  { key: 'picked_up', label: 'Авлаа', icon: '✅' },
  { key: 'on_the_way', label: 'Хүргэлтэнд', icon: '🔄' },
  { key: 'delivered', label: 'Хүргэгдсэн', icon: '📦' },
];

export default function ActiveDeliveryScreen() {
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActive();
  }, []);

  const loadActive = async () => {
    try {
      const data = await DriverAPI.deliveries('active');
      const active = (data.orders || [])[0] || null;
      setDelivery(active);
    } catch {}
    setLoading(false);
  };

  const updateStatus = async (status: string) => {
    if (!delivery) return;
    try {
      await DriverAPI.updateDeliveryStatus(delivery.id || delivery._id, status);
      if (status === 'delivered') {
        router.push(`/confirm/${delivery.id || delivery._id}` as any);
      } else {
        loadActive();
      }
    } catch (err: any) {
      Alert.alert('Алдаа', err.message || 'Статус шинэчлэхэд алдаа');
    }
  };

  const openMaps = () => {
    if (!delivery?.delivery?.address) return;
    const addr = encodeURIComponent(delivery.delivery.address);
    Linking.openURL(`https://maps.google.com/?daddr=${addr}`).catch(() => {});
  };

  const callCustomer = () => {
    if (!delivery?.delivery?.phone) return;
    Linking.openURL(`tel:${delivery.delivery.phone}`).catch(() => {});
  };

  if (loading) {
    return <View style={s.container}><Text style={s.emptyText}>Ачааллаж байна...</Text></View>;
  }

  if (!delivery) {
    return (
      <View style={s.container}>
        <View style={s.emptyCard}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🚚</Text>
          <Text style={s.emptyTitle}>Идэвхтэй хүргэлт байхгүй</Text>
          <Text style={s.emptyDesc}>Хүргэлт хүлээн авсны дараа энд харагдана</Text>
        </View>
      </View>
    );
  }

  const currentIdx = STEPS.findIndex(s => s.key === delivery.deliveryStatus) || 0;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Order info */}
      <View style={s.orderCard}>
        <Text style={s.orderId}>#{delivery.orderNumber || (delivery.id || delivery._id)?.slice(-5)}</Text>
        <Text style={s.shopName}>{delivery.shop?.name || 'Дэлгүүр'}</Text>
      </View>

      {/* Customer info + action buttons */}
      <View style={s.customerCard}>
        <Text style={s.sectionLabel}>Хүлээн авагч</Text>
        <Text style={s.customerName}>{delivery.user?.name || delivery.delivery?.name || 'Хэрэглэгч'}</Text>

        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn} onPress={callCustomer}>
            <Ionicons name="call" size={20} color="#22C55E" />
            <Text style={s.actionText}>Дуудлага</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={openMaps}>
            <Ionicons name="navigate" size={20} color="#3B82F6" />
            <Text style={s.actionText}>Зам харах</Text>
          </TouchableOpacity>
        </View>

        <View style={s.addressRow}>
          <Ionicons name="location" size={16} color="#F59E0B" />
          <Text style={s.addressText}>{delivery.delivery?.address || delivery.delivery?.street || 'Хаяг тодорхойгүй'}</Text>
        </View>

        {delivery.delivery?.phone && (
          <View style={s.addressRow}>
            <Ionicons name="call-outline" size={16} color="#999" />
            <Text style={s.addressText}>{delivery.delivery.phone}</Text>
          </View>
        )}
      </View>

      {/* Status timeline */}
      <Text style={s.sectionTitle}>Хүргэлтийн явц</Text>
      <View style={s.timeline}>
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          return (
            <View key={step.key} style={s.stepItem}>
              <View style={[s.dot, done && s.dotDone]}>
                <Text style={{ fontSize: 14 }}>{step.icon}</Text>
              </View>
              <Text style={[s.stepLabel, done && { color: '#FFF' }]}>{step.label}</Text>
              {i < STEPS.length - 1 && <View style={[s.stepLine, done && { backgroundColor: '#F59E0B' }]} />}
            </View>
          );
        })}
      </View>

      {/* Action buttons */}
      <View style={s.bottomActions}>
        {delivery.deliveryStatus !== 'on_the_way' && (
          <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#3B82F6' }]} onPress={() => updateStatus('on_the_way')}>
            <Ionicons name="navigate" size={20} color="#FFF" />
            <Text style={s.bigBtnText}>Хүргэлтэнд яваа</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#22C55E' }]}
          onPress={() => router.push(`/confirm/${delivery.id || delivery._id}` as any)}>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={s.bigBtnText}>Хүргэлт дууслаа</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  emptyCard: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 100 },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptyDesc: { color: '#666', fontSize: 13 },
  emptyText: { color: '#555', textAlign: 'center', marginTop: 40 },
  orderCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#F59E0B44', marginBottom: 12 },
  orderId: { color: '#F59E0B', fontSize: 18, fontWeight: '900' },
  shopName: { color: '#CCC', fontSize: 14, marginTop: 4 },
  customerCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 12 },
  sectionLabel: { color: '#999', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  customerName: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2A2A2A', borderRadius: 10, paddingVertical: 10 },
  actionText: { color: '#E0E0E0', fontSize: 13, fontWeight: '600' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  addressText: { color: '#CCC', fontSize: 13, flex: 1 },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 8 },
  stepItem: { alignItems: 'center', flex: 1 },
  dot: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  dotDone: { backgroundColor: '#F59E0B' },
  stepLabel: { fontSize: 10, color: '#555', fontWeight: '600' },
  stepLine: { position: 'absolute', top: 17, left: '60%', right: '-40%', height: 2, backgroundColor: '#2A2A2A' },
  bottomActions: { gap: 10 },
  bigBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16 },
  bigBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
