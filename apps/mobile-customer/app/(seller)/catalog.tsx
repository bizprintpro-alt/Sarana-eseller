import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, ActivityIndicator, Share, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { SellerAPI } from '../lib/api';
import { CONFIG } from '../lib/config';

const ACCENT = '#22C55E';

interface SharedProduct {
  id: string;
  name: string;
  image?: string;
  commission: number;
  clicks: number;
  conversions: number;
  earnings: number;
  shareUrl: string;
}

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function CatalogScreen() {
  const [products, setProducts] = useState<SharedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'clicks' | 'earnings'>('clicks');

  const load = useCallback(async () => {
    try {
      const data = await SellerAPI.catalog();
      const prods = (data?.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0] || p.image,
        commission: p.commissionRate || p.commission || 10,
        clicks: p.clicks || 0,
        conversions: p.conversions || 0,
        earnings: p.earnings || 0,
        shareUrl: `${CONFIG.WEB_URL || 'https://eseller.mn'}/product/${p.id}?ref=${p.refCode || 'seller'}`,
      }));
      setProducts(prods);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  const handleShare = async (p: SharedProduct) => {
    try {
      await Share.share({
        message: `${p.name} - eseller.mn\n${p.shareUrl}`,
        url: p.shareUrl,
      });
    } catch {}
  };

  const handleCopy = async (url: string) => {
    await Clipboard.setStringAsync(url);
  };

  const filtered = products
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'clicks' ? b.clicks - a.clicks : b.earnings - a.earnings);

  if (loading) {
    return <View style={st.center}><ActivityIndicator color={ACCENT} size="large" /></View>;
  }

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ACCENT} />}
    >
      {/* Search */}
      <View style={st.searchRow}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={st.searchInput}
          placeholder="Бараа хайх..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Sort */}
      <View style={st.sortRow}>
        {(['clicks', 'earnings'] as const).map(s => (
          <TouchableOpacity key={s} style={[st.sortChip, sort === s && st.sortActive]}
            onPress={() => setSort(s)}>
            <Text style={[st.sortText, sort === s && { color: '#FFF' }]}>
              {s === 'clicks' ? 'Клик тоо' : 'Орлого'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={st.empty}>
          <Ionicons name="grid-outline" size={48} color="#333" />
          <Text style={st.emptyText}>Share хийсэн бараа байхгүй</Text>
        </View>
      ) : (
        filtered.map(p => (
          <View key={p.id} style={st.card}>
            <View style={st.cardTop}>
              <View style={st.cardImg}>
                {p.image ? (
                  <Image source={{ uri: p.image }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                ) : (
                  <Ionicons name="cube" size={24} color="#555" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.cardName} numberOfLines={2}>{p.name}</Text>
                <Text style={st.cardComm}>{p.commission}% комисс</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={st.statsRow}>
              <View style={st.stat}>
                <Text style={st.statValue}>{p.clicks}</Text>
                <Text style={st.statLabel}>Клик</Text>
              </View>
              <View style={st.stat}>
                <Text style={st.statValue}>{p.conversions}</Text>
                <Text style={st.statLabel}>Хөрвөлт</Text>
              </View>
              <View style={st.stat}>
                <Text style={[st.statValue, { color: ACCENT }]}>{fmt(p.earnings)}</Text>
                <Text style={st.statLabel}>Орлого</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={st.actionsRow}>
              <TouchableOpacity style={st.copyBtn} onPress={() => handleCopy(p.shareUrl)}>
                <Ionicons name="copy-outline" size={16} color="#3B82F6" />
                <Text style={st.copyText}>Линк хуулах</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.shareBtn} onPress={() => handleShare(p)}>
                <Ionicons name="share-social" size={16} color="#FFF" />
                <Text style={st.shareText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 14, marginBottom: 12,
    borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, paddingVertical: 12 },

  sortRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  sortChip: { backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 0.5, borderColor: '#2A2A2A' },
  sortActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  sortText: { color: '#999', fontSize: 12, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#666', fontSize: 14, marginTop: 12 },

  card: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#2A2A2A' },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  cardName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  cardComm: { color: ACCENT, fontSize: 12, fontWeight: '600', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#2A2A2A', borderRadius: 8, padding: 8, alignItems: 'center' },
  statValue: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  statLabel: { color: '#999', fontSize: 9, marginTop: 2 },

  actionsRow: { flexDirection: 'row', gap: 8 },
  copyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#3B82F615', borderRadius: 10, padding: 10,
  },
  copyText: { color: '#3B82F6', fontSize: 12, fontWeight: '700' },
  shareBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: ACCENT, borderRadius: 10, padding: 10,
  },
  shareText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});
