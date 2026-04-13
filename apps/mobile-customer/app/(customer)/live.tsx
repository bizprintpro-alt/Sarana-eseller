import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LiveAPI } from '../lib/api';

const BRAND = '#E8242C';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status: string;
  viewerCount: number;
  scheduledAt?: string;
  shop: { id: string; name: string };
  host: { id: string; name: string };
  productCount: number;
}

export default function LiveListScreen() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch_ = useCallback(async () => {
    try {
      const res = await LiveAPI.list();
      const list = res?.data || res || [];
      setStreams(Array.isArray(list) ? list : []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const onRefresh = () => { setRefreshing(true); fetch_(); };

  const liveStreams = streams.filter((s) => s.status === 'LIVE');
  const scheduledStreams = streams.filter((s) => s.status === 'SCHEDULED');

  const renderCard = ({ item }: { item: LiveStream }) => {
    const isLive = item.status === 'LIVE';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/(customer)/live/${item.id}`)}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnail}>
          <Ionicons name="videocam-outline" size={32} color="#666" />
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          <View style={styles.viewerBadge}>
            <Ionicons name="people-outline" size={12} color="#fff" />
            <Text style={styles.viewerText}>{item.viewerCount}</Text>
          </View>
        </View>
        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardShop}>{item.shop.name}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>{item.productCount} бүтээгдэхүүн</Text>
            {!isLive && item.scheduledAt && (
              <Text style={styles.scheduleText}>
                {new Date(item.scheduledAt).toLocaleDateString('mn-MN')}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  const allStreams = [...liveStreams, ...scheduledStreams];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="videocam" size={24} color="#fff" />
        <Text style={styles.headerTitle}>Live худалдаа</Text>
      </View>

      {allStreams.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="videocam-off-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Одоогоор live байхгүй</Text>
          <Text style={styles.emptySubText}>Удахгүй эхлэнэ!</Text>
        </View>
      ) : (
        <FlatList
          data={allStreams}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND} />
          }
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: BRAND,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  list: { padding: 12 },
  row: { gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  thumbnail: {
    height: 120,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BRAND,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  viewerBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewerText: { color: '#fff', fontSize: 10 },
  cardInfo: { padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  cardShop: { fontSize: 12, color: '#666', marginTop: 2 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  metaText: { fontSize: 11, color: '#999' },
  scheduleText: { fontSize: 11, color: '#3b82f6' },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
  emptySubText: { fontSize: 13, color: '#bbb', marginTop: 4 },
});
