import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StoresAPI, StoreListItem } from '../lib/api';

const BRAND = '#E8242C';

const ENTITY_META: Record<string, { emoji: string; label: string; color: string }> = {
  store: { emoji: '🛍️', label: 'Дэлгүүр', color: '#6366F1' },
  service: { emoji: '⚙️', label: 'Үйлчилгээ', color: '#8B5CF6' },
  agent: { emoji: '🏠', label: 'Агент', color: '#3B82F6' },
  company: { emoji: '🏗️', label: 'Компани', color: '#10B981' },
  auto_dealer: { emoji: '🚗', label: 'Авто худалдаа', color: '#F59E0B' },
};

export default function StoreDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [store, setStore] = useState<StoreListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    StoresAPI.getBySlug(slug)
      .then((data) => setStore(data))
      .catch(() => setError('Дэлгүүр олдсонгүй'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  if (error || !store) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 48 }}>🏪</Text>
        <Text style={s.errorTitle}>{error || 'Дэлгүүр олдсонгүй'}</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backBtnText}>Буцах</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const meta = ENTITY_META[store.entityType] || ENTITY_META.store;

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover / Header */}
        <View style={s.header}>
          <View style={s.logoWrap}>
            {store.logo ? (
              <Image source={{ uri: store.logo }} style={s.logo} />
            ) : (
              <Text style={{ fontSize: 48 }}>{meta.emoji}</Text>
            )}
          </View>
          <Text style={s.storeName}>{store.name}</Text>

          {/* Entity type badge */}
          <View style={[s.typeBadge, { backgroundColor: meta.color + '20' }]}>
            <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
            <Text style={[s.typeBadgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>

          {/* Verified */}
          {store.isVerified && (
            <View style={s.verifiedRow}>
              <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
              <Text style={s.verifiedText}>Баталгаажсан</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {store.rating != null && (
            <View style={s.statBox}>
              <Text style={s.statNum}>{store.rating.toFixed(1)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={s.statLabel}>Үнэлгээ</Text>
              </View>
            </View>
          )}
          {store.reviewCount != null && (
            <View style={s.statBox}>
              <Text style={s.statNum}>{store.reviewCount}</Text>
              <Text style={s.statLabel}>Сэтгэгдэл</Text>
            </View>
          )}
          {store.productCount != null && (
            <View style={s.statBox}>
              <Text style={s.statNum}>{store.productCount}</Text>
              <Text style={s.statLabel}>Бараа</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Мэдээлэл</Text>
          {store.address && (
            <View style={s.infoRow}>
              <Ionicons name="location-outline" size={18} color="#A0A0A0" />
              <Text style={s.infoText}>{store.address}</Text>
            </View>
          )}
          {store.district && (
            <View style={s.infoRow}>
              <Ionicons name="map-outline" size={18} color="#A0A0A0" />
              <Text style={s.infoText}>{store.district} дүүрэг</Text>
            </View>
          )}
          {store.phone && (
            <TouchableOpacity style={s.infoRow}
              onPress={() => Linking.openURL(`tel:${store.phone}`)}>
              <Ionicons name="call-outline" size={18} color="#A0A0A0" />
              <Text style={[s.infoText, { color: BRAND }]}>{store.phone}</Text>
            </TouchableOpacity>
          )}
          {store.industry && (
            <View style={s.infoRow}>
              <Ionicons name="briefcase-outline" size={18} color="#A0A0A0" />
              <Text style={s.infoText}>{store.industry}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={s.actions}>
          <TouchableOpacity style={s.actionPrimary}>
            <Ionicons name="bag-outline" size={18} color="#FFF" />
            <Text style={s.actionPrimaryText}>Бараа үзэх</Text>
          </TouchableOpacity>
          {store.phone && (
            <TouchableOpacity style={s.actionSecondary}
              onPress={() => Linking.openURL(`tel:${store.phone}`)}>
              <Ionicons name="call-outline" size={18} color={BRAND} />
              <Text style={s.actionSecondaryText}>Залгах</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Header
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  logoWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#3D3D3D', marginBottom: 12 },
  logo: { width: 84, height: 84, borderRadius: 42 },
  storeName: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
  typeBadgeText: { fontSize: 13, fontWeight: '700' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, marginHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  statBox: { alignItems: 'center', gap: 4 },
  statNum: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  statLabel: { fontSize: 11, color: '#777' },

  // Card
  card: { margin: 16, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#3D3D3D', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: '#E0E0E0' },

  // Actions
  actions: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  actionPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, backgroundColor: BRAND, borderRadius: 12 },
  actionPrimaryText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  actionSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, paddingHorizontal: 24, backgroundColor: 'rgba(232,36,44,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(232,36,44,0.3)' },
  actionSecondaryText: { fontSize: 14, fontWeight: '700', color: BRAND },

  // Error
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginTop: 16, marginBottom: 16 },
  backBtn: { backgroundColor: '#1A1A1A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
