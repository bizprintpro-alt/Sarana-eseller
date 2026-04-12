import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SellerAPI } from '../lib/api';

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function SellerProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await SellerAPI.products();
      setProducts((data as any)?.products || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  const filtered = search
    ? products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
    : products;

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Устгах', `"${name}" барааг устгах уу?`, [
      { text: 'Болих', style: 'cancel' },
      { text: 'Устгах', style: 'destructive', onPress: async () => {
        try {
          await SellerAPI.updateProduct(id, { isActive: false });
          load();
        } catch {}
      }},
    ]);
  };

  return (
    <View style={s.container}>
      {/* Search */}
      <View style={s.searchBar}>
        <Ionicons name="search" size={16} color="#555" />
        <TextInput style={s.searchInput} value={search} onChangeText={setSearch}
          placeholder="Бараа хайх..." placeholderTextColor="#555" />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id || i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#22C55E" />}
        renderItem={({ item }) => {
          const outOfStock = (item.stock ?? 0) === 0;
          const lowStock = (item.stock ?? 0) > 0 && (item.stock ?? 0) <= 5;
          return (
            <TouchableOpacity style={[s.card, outOfStock && { borderColor: '#E8242C44' }]}
              onPress={() => router.push(`/(seller)/product/${item.id || item._id}/edit` as any)} activeOpacity={0.7}
              onLongPress={() => handleDelete(item.id || item._id, item.name)}>
              <View style={[s.thumb, { backgroundColor: item.isActive !== false ? '#22C55E22' : '#66666622' }]}>
                {item.images?.[0] ? (
                  <Text style={{ fontSize: 24 }}>{item.emoji || '📦'}</Text>
                ) : (
                  <Ionicons name="cube" size={24} color={item.isActive !== false ? '#22C55E' : '#666'} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Text style={s.price}>{fmt(item.price || 0)}</Text>
                  {item.salePrice ? <Text style={s.salePrice}>{fmt(item.salePrice)}</Text> : null}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.stock, outOfStock && { color: '#E8242C' }, lowStock && { color: '#F59E0B' }]}>
                  {outOfStock ? '⚠️ Дууссан' : lowStock ? `⚠️ ${item.stock} ш` : `${item.stock ?? 0} ш`}
                </Text>
                <View style={[s.statusDot, { backgroundColor: item.isActive !== false ? '#22C55E' : '#666' }]} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>📦</Text>
            <Text style={{ color: '#555', fontSize: 14 }}>{loading ? 'Ачааллаж байна...' : 'Бараа байхгүй'}</Text>
            {!loading && (
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/(seller)/product/new' as any)}>
                <Text style={s.emptyBtnText}>+ Бараа нэмэх</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <TouchableOpacity style={s.fab} activeOpacity={0.8}
        onPress={() => router.push('/(seller)/product/new' as any)}>
        <Ionicons name="add" size={28} color="#FFF" />
        <Text style={s.fabText}>Бараа нэмэх</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, marginBottom: 0, backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 12, height: 42, borderWidth: 0.5, borderColor: '#2A2A2A' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A', gap: 12 },
  thumb: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  price: { color: '#22C55E', fontSize: 13, fontWeight: '600' },
  salePrice: { color: '#E8242C', fontSize: 11, textDecorationLine: 'line-through' },
  stock: { color: '#999', fontSize: 12, fontWeight: '600' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  fab: { position: 'absolute', bottom: 100, right: 20, backgroundColor: '#22C55E', borderRadius: 28, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 6, elevation: 6, shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  fabText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  emptyBtn: { marginTop: 16, backgroundColor: '#22C55E', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
