import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FlashSaleAPI } from '../lib/api';

const BRAND = '#E8242C';

interface FlashProduct {
  id: string;
  name: string;
  image?: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  stock: number;
  sold: number;
}

interface FlashSaleData {
  id: string;
  title: string;
  endsAt: string;
  products: FlashProduct[];
}

const DEMO: FlashSaleData = {
  id: 'fs-1',
  title: 'Flash Sale 🔥',
  endsAt: new Date(Date.now() + 4 * 3600_000).toISOString(),
  products: [
    { id: 'p1', name: 'Wireless чихэвч', originalPrice: 89000, salePrice: 35600, discount: 60, stock: 50, sold: 38 },
    { id: 'p2', name: 'Smart цаг', originalPrice: 120000, salePrice: 48000, discount: 60, stock: 30, sold: 27 },
    { id: 'p3', name: 'Powerbank 20000mAh', originalPrice: 65000, salePrice: 29250, discount: 55, stock: 100, sold: 71 },
    { id: 'p4', name: 'LED гэрэл', originalPrice: 45000, salePrice: 18000, discount: 60, stock: 40, sold: 35 },
    { id: 'p5', name: 'Phone case MagSafe', originalPrice: 35000, salePrice: 15750, discount: 55, stock: 200, sold: 145 },
    { id: 'p6', name: 'USB-C хаб 7in1', originalPrice: 78000, salePrice: 35100, discount: 55, stock: 60, sold: 48 },
  ],
};

function fmt(n: number) { return n.toLocaleString() + '₮'; }

function useCountdown(endsAt: string) {
  const calc = () => Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
  const [secs, setSecs] = useState(calc);
  const prevRef = useRef(secs);

  useEffect(() => {
    const t = setInterval(() => {
      const v = calc();
      setSecs(v);
      if (v === 0 && prevRef.current > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      prevRef.current = v;
    }, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return { h, m, s, ended: secs === 0 };
}

export default function FlashSaleScreen() {
  const [sale, setSale] = useState<FlashSaleData>(DEMO);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { h, m, s, ended } = useCountdown(sale.endsAt);

  const load = useCallback(async () => {
    try {
      const data = await FlashSaleAPI.active();
      if (data?.id) setSale(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  if (loading) {
    return <View style={st.center}><ActivityIndicator color={BRAND} size="large" /></View>;
  }

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={BRAND} />}
    >
      {/* Countdown */}
      <View style={st.countdownCard}>
        <View>
          <Text style={st.countdownTitle}>{sale.title}</Text>
          <Text style={st.countdownSub}>{ended ? 'Дууссан!' : 'Дуусахад'}</Text>
        </View>
        <View style={st.timerRow}>
          {[h, m, s].map((v, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Text style={st.timerColon}>:</Text>}
              <View style={st.timerBox}>
                <Text style={st.timerText}>{v}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Gold banner */}
      <TouchableOpacity style={st.goldBanner} activeOpacity={0.8}>
        <Ionicons name="diamond" size={18} color="#C0953C" />
        <Text style={st.goldText}>Gold гишүүд 1 цагийн өмнө нэвтэрнэ</Text>
        <Ionicons name="chevron-forward" size={16} color="#C0953C" />
      </TouchableOpacity>

      {/* Products grid */}
      <View style={st.grid}>
        {sale.products.map((p) => {
          const pct = Math.round((p.sold / p.stock) * 100);
          return (
            <TouchableOpacity
              key={p.id}
              style={st.productCard}
              activeOpacity={0.8}
              onPress={() => router.push(`/product/${p.id}` as any)}
            >
              {/* Discount badge */}
              <View style={st.discBadge}>
                <Text style={st.discText}>-{p.discount}%</Text>
              </View>

              {/* Image */}
              <View style={st.imgWrap}>
                {p.image ? (
                  <Image source={{ uri: p.image }} style={st.img} />
                ) : (
                  <Ionicons name="flash" size={36} color={BRAND} />
                )}
              </View>

              <Text style={st.pName} numberOfLines={2}>{p.name}</Text>

              <View style={st.priceRow}>
                <Text style={st.salePrice}>{fmt(p.salePrice)}</Text>
                <Text style={st.origPrice}>{fmt(p.originalPrice)}</Text>
              </View>

              {/* Stock progress */}
              <View style={st.stockBar}>
                <View style={[st.stockFill, { width: `${pct}%` }]} />
              </View>
              <Text style={st.stockText}>{p.sold}/{p.stock} зарагдсан</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },

  countdownCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: BRAND, borderRadius: 16, padding: 16, marginBottom: 12,
  },
  countdownTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  countdownSub: { color: '#FFF9', fontSize: 12, marginTop: 2 },
  timerRow: { flexDirection: 'row', alignItems: 'center' },
  timerBox: { backgroundColor: '#00000044', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  timerText: { color: '#FFF', fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerColon: { color: '#FFF', fontSize: 20, fontWeight: '900', marginHorizontal: 4 },

  goldBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#C0953C15', borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 0.5, borderColor: '#C0953C33',
  },
  goldText: { flex: 1, color: '#C0953C', fontSize: 12, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  productCard: {
    width: '48%' as any, backgroundColor: '#1A1A1A', borderRadius: 14, padding: 10,
    borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  discBadge: {
    position: 'absolute', top: 8, left: 8, zIndex: 1,
    backgroundColor: BRAND, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  discText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  imgWrap: {
    height: 100, borderRadius: 10, backgroundColor: '#2A2A2A',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  img: { width: '100%', height: '100%', borderRadius: 10 },
  pName: { color: '#E0E0E0', fontSize: 12, fontWeight: '600', marginBottom: 6, height: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  salePrice: { color: BRAND, fontSize: 14, fontWeight: '900' },
  origPrice: { color: '#666', fontSize: 11, textDecorationLine: 'line-through' },
  stockBar: { height: 4, backgroundColor: '#2A2A2A', borderRadius: 2, overflow: 'hidden' },
  stockFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 2 },
  stockText: { color: '#777', fontSize: 9, marginTop: 3, textAlign: 'center' },
});
