import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SellerAPI } from '../lib/api';

const ACCENT = '#8B5CF6';

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function OwnerProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'low'>('all');

  const load = useCallback(async () => {
    try {
      const data = await SellerAPI.products();
      setProducts(data?.products || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  const filtered = filter === 'low'
    ? products.filter(p => (p.stock ?? p.inventory ?? 999) < 5)
    : products;

  if (loading) {
    return <View style={st.center}><ActivityIndicator color={ACCENT} size="large" /></View>;
  }

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ACCENT} />}
    >
      {/* Filters */}
      <View style={st.filterRow}>
        {(['all', 'low'] as const).map(f => (
          <TouchableOpacity key={f} style={[st.filterChip, filter === f && st.filterActive]}
            onPress={() => setFilter(f)}>
            <Text style={[st.filterText, filter === f && { color: '#FFF' }]}>
              {f === 'all' ? `Бүгд (${products.length})` : `Дуусах дөхсөн`}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={st.addBtn} onPress={() => router.push('/(seller)/product/new' as any)}>
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={st.empty}>
          <Ionicons name="cube-outline" size={48} color="#333" />
          <Text style={st.emptyText}>Бараа байхгүй</Text>
        </View>
      ) : (
        filtered.map(p => {
          const stock = p.stock ?? p.inventory ?? 0;
          const isLow = stock < 5;
          return (
            <TouchableOpacity key={p.id} style={st.card} activeOpacity={0.8}>
              <View style={st.cardImg}>
                {p.images?.[0] ? (
                  <Image source={{ uri: p.images[0] }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                ) : (
                  <Ionicons name="cube" size={24} color="#555" />
                )}
              </View>
              <View style={st.cardContent}>
                <Text style={st.cardName} numberOfLines={1}>{p.name}</Text>
                <Text style={st.cardPrice}>{fmt(p.salePrice || p.price || 0)}</Text>
                <View style={st.cardMeta}>
                  <Text style={[st.cardStock, isLow && { color: '#F59E0B' }]}>
                    {isLow ? '⚠️ ' : ''}{stock} ширхэг
                  </Text>
                  <Text style={st.cardStatus}>{p.isActive ? '🟢 Идэвхтэй' : '⚪ Идэвхгүй'}</Text>
                </View>
              </View>
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

  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  filterChip: { backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 0.5, borderColor: '#2A2A2A' },
  filterActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  filterText: { color: '#999', fontSize: 12, fontWeight: '600' },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#666', fontSize: 14, marginTop: 12 },

  card: {
    flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 14, padding: 12,
    marginBottom: 8, borderWidth: 0.5, borderColor: '#2A2A2A', gap: 12,
  },
  cardImg: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1, justifyContent: 'center' },
  cardName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  cardPrice: { color: '#22C55E', fontSize: 13, fontWeight: '800', marginTop: 2 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cardStock: { color: '#999', fontSize: 11 },
  cardStatus: { color: '#999', fontSize: 11 },
});
