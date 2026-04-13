import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { OrdersAPI, SellerAPI } from '../lib/api';

const BRAND = '#E8242C';

const REASONS = [
  'Бараа эвдэрсэн',
  'Буруу бараа ирсэн',
  'Чанар муу',
  'Зурагнаас өөр',
  'Хэмжээ тохирохгүй',
  'Бусад',
];

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  pending:  { label: 'Хүлээгдэж байна', color: '#F59E0B', icon: 'time-outline' },
  approved: { label: 'Зөвшөөрсөн', color: '#22C55E', icon: 'checkmark-circle-outline' },
  rejected: { label: 'Татгалзсан', color: '#EF4444', icon: 'close-circle-outline' },
};

interface ReturnableOrder {
  id: string;
  orderNumber: string;
  items: { name: string; price: number; quantity: number; image?: string }[];
  total: number;
  deliveredAt: string;
}

interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  reason: string;
  status: string;
  images: string[];
  createdAt: string;
}

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function ReturnsScreen() {
  const [tab, setTab] = useState<'request' | 'history'>('request');
  const [orders, setOrders] = useState<ReturnableOrder[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Return form
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ordersData] = await Promise.all([
        OrdersAPI.myOrders(),
      ]);
      const delivered = (ordersData?.orders || []).filter(
        (o: any) => o.status === 'delivered'
      );
      setOrders(delivered.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber || o.id.slice(-5),
        items: o.items || [],
        total: o.total || 0,
        deliveredAt: o.updatedAt || o.createdAt,
      })));
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  const pickImage = async () => {
    if (photos.length >= 4) {
      Alert.alert('Хязгаар', 'Хамгийн ихдээ 4 зураг');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const submitReturn = async () => {
    if (!selectedOrder || !reason) {
      Alert.alert('Алдаа', 'Захиалга болон шалтгаан сонгоно уу');
      return;
    }
    setSubmitting(true);
    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const uri of photos) {
        try {
          const res = await SellerAPI.uploadImage(uri);
          if (res.url) imageUrls.push(res.url);
        } catch {}
      }
      await OrdersAPI.requestReturn(selectedOrder, { reason, images: imageUrls });
      Alert.alert('Амжилттай', 'Буцаалтын хүсэлт илгээгдлээ');
      setSelectedOrder(null);
      setReason('');
      setPhotos([]);
      load();
    } catch (err: any) {
      Alert.alert('Алдаа', err.message || 'Хүсэлт илгээхэд алдаа');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <View style={st.center}><ActivityIndicator color={BRAND} size="large" /></View>;
  }

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={BRAND} />}
    >
      {/* Tabs */}
      <View style={st.tabRow}>
        {(['request', 'history'] as const).map(t => (
          <TouchableOpacity key={t} style={[st.tab, tab === t && st.tabActive]} onPress={() => setTab(t)}>
            <Text style={[st.tabText, tab === t && st.tabTextActive]}>
              {t === 'request' ? 'Буцаалт хүсэх' : 'Түүх'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'request' ? (
        <>
          <Text style={st.hint}>48 цагийн дотор буцааж болно</Text>

          {/* Order selection */}
          {orders.length === 0 ? (
            <View style={st.empty}>
              <Ionicons name="bag-check-outline" size={48} color="#333" />
              <Text style={st.emptyText}>Буцааж болох захиалга байхгүй</Text>
            </View>
          ) : (
            orders.map(o => (
              <TouchableOpacity
                key={o.id}
                style={[st.orderCard, selectedOrder === o.id && st.orderCardSelected]}
                onPress={() => setSelectedOrder(selectedOrder === o.id ? null : o.id)}
              >
                <View style={st.orderHeader}>
                  <Text style={st.orderId}>#{o.orderNumber}</Text>
                  <Ionicons name={selectedOrder === o.id ? 'radio-button-on' : 'radio-button-off'}
                    size={20} color={selectedOrder === o.id ? BRAND : '#555'} />
                </View>
                <Text style={st.orderTotal}>{fmt(o.total)}</Text>
                <Text style={st.orderItems}>
                  {o.items.map(i => i.name).join(', ')}
                </Text>
              </TouchableOpacity>
            ))
          )}

          {selectedOrder && (
            <>
              {/* Reason picker */}
              <Text style={st.sectionTitle}>Шалтгаан сонгох</Text>
              <View style={st.reasonGrid}>
                {REASONS.map(r => (
                  <TouchableOpacity key={r} style={[st.reasonChip, reason === r && st.reasonActive]}
                    onPress={() => setReason(r)}>
                    <Text style={[st.reasonText, reason === r && st.reasonTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Photo upload */}
              <Text style={st.sectionTitle}>Зураг (заавал биш)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {photos.map((uri, i) => (
                  <TouchableOpacity key={i} onPress={() => setPhotos(photos.filter((_, j) => j !== i))}>
                    <Image source={{ uri }} style={st.photo} />
                    <View style={st.photoRemove}>
                      <Ionicons name="close-circle" size={20} color={BRAND} />
                    </View>
                  </TouchableOpacity>
                ))}
                {photos.length < 4 && (
                  <TouchableOpacity style={st.addPhoto} onPress={pickImage}>
                    <Ionicons name="camera-outline" size={24} color="#666" />
                    <Text style={{ color: '#666', fontSize: 10, marginTop: 4 }}>Зураг</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              {/* Submit */}
              <TouchableOpacity
                style={[st.submitBtn, submitting && { opacity: 0.5 }]}
                onPress={submitReturn}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={st.submitText}>Буцаалт хүсэх</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </>
      ) : (
        /* History tab */
        returns.length === 0 ? (
          <View style={st.empty}>
            <Ionicons name="refresh-outline" size={48} color="#333" />
            <Text style={st.emptyText}>Буцаалтын түүх байхгүй</Text>
          </View>
        ) : (
          returns.map(r => {
            const meta = STATUS_META[r.status] || STATUS_META.pending;
            return (
              <View key={r.id} style={st.returnCard}>
                <View style={st.returnHeader}>
                  <Text style={st.returnOrderId}>#{r.orderNumber}</Text>
                  <View style={[st.statusBadge, { backgroundColor: meta.color + '22' }]}>
                    <Ionicons name={meta.icon as any} size={14} color={meta.color} />
                    <Text style={[st.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>
                <Text style={st.returnReason}>{r.reason}</Text>
                <Text style={st.returnDate}>
                  {new Date(r.createdAt).toLocaleDateString('mn-MN')}
                </Text>
              </View>
            );
          })
        )
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },

  tabRow: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 3, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#2A2A2A' },
  tabText: { color: '#777', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },

  hint: { color: '#F59E0B', fontSize: 12, marginBottom: 14, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#666', fontSize: 14, marginTop: 12 },

  orderCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2A2A2A' },
  orderCardSelected: { borderColor: BRAND },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  orderTotal: { color: '#22C55E', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  orderItems: { color: '#999', fontSize: 12 },

  sectionTitle: { color: '#FFF', fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 10 },
  reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  reasonChip: { backgroundColor: '#2A2A2A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  reasonActive: { backgroundColor: BRAND },
  reasonText: { color: '#999', fontSize: 12, fontWeight: '600' },
  reasonTextActive: { color: '#FFF' },

  photo: { width: 70, height: 70, borderRadius: 10, marginRight: 8 },
  photoRemove: { position: 'absolute', top: -6, right: 2 },
  addPhoto: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },

  submitBtn: { backgroundColor: BRAND, borderRadius: 14, padding: 16, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  returnCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#2A2A2A' },
  returnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  returnOrderId: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  returnReason: { color: '#CCC', fontSize: 13, marginBottom: 4 },
  returnDate: { color: '#777', fontSize: 11 },
});
