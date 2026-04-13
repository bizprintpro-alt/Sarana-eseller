import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BRAND = '#E8242C';
const GOLD = '#F59E0B';

interface AchievementItem {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  earned: boolean;
  earnedAt: string | null;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  ShoppingBag: 'bag-outline',
  Flame: 'flame-outline',
  Trophy: 'trophy-outline',
  Star: 'star-outline',
  Wallet: 'wallet-outline',
  Users: 'people-outline',
  Radio: 'radio-outline',
  Mountain: 'earth-outline',
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://eseller.mn';

function getToken(): string | null {
  // In production, read from SecureStore or AsyncStorage
  return null;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [achRes, streakRes] = await Promise.all([
        fetch(`${API_BASE}/api/achievements`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/achievements/streak`, { method: 'POST', headers: authHeaders() }),
      ]);
      const achData = await achRes.json();
      if (achData.success) {
        setAchievements(achData.data.achievements);
        setTotalPoints(achData.data.totalPoints);
      }
      const streakData = await streakRes.json();
      if (streakData.success) {
        setCurrentStreak(streakData.data.currentStreak);
      }
    } catch { /* ignore */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const earnedCount = achievements.filter((a) => a.earned).length;

  const renderItem = ({ item }: { item: AchievementItem }) => {
    const ionIcon = ICON_MAP[item.icon] || 'trophy-outline';
    return (
      <View style={[s.card, item.earned ? s.cardEarned : s.cardLocked]}>
        <View style={[s.iconCircle, { backgroundColor: item.earned ? GOLD : '#E5E7EB' }]}>
          {item.earned ? (
            <Ionicons name={ionIcon as any} size={24} color="#fff" />
          ) : (
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
          )}
        </View>
        <Text style={[s.name, !item.earned && s.textMuted]} numberOfLines={1}>{item.name}</Text>
        <Text style={[s.desc, !item.earned && s.textMuted]} numberOfLines={2}>{item.description}</Text>
        <Text style={[s.points, item.earned ? { color: GOLD } : { color: '#9CA3AF' }]}>
          +{item.points.toLocaleString()} оноо
        </Text>
        {item.earned && (
          <View style={s.badge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header stats */}
      <View style={s.header}>
        <View style={s.statBox}>
          <Ionicons name="trophy" size={22} color={GOLD} />
          <Text style={s.statValue}>{totalPoints.toLocaleString()}</Text>
          <Text style={s.statLabel}>Нийт оноо</Text>
        </View>
        <View style={s.statBox}>
          <Ionicons name="flame" size={22} color="#F97316" />
          <Text style={s.statValue}>{currentStreak}</Text>
          <Text style={s.statLabel}>Дараалал</Text>
        </View>
        <View style={s.statBox}>
          <Ionicons name="flash" size={22} color="#10B981" />
          <Text style={s.statValue}>{earnedCount}/{achievements.length}</Text>
          <Text style={s.statLabel}>Нээгдсэн</Text>
        </View>
      </View>

      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />}
        ListEmptyComponent={
          <View style={s.center}>
            <Ionicons name="trophy-outline" size={48} color="#D1D5DB" />
            <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Амжилтууд олдсонгүй</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16,
    paddingHorizontal: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginTop: 2 },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  list: { padding: 8 },
  row: { justifyContent: 'space-between' },
  card: {
    flex: 1, margin: 6, borderRadius: 12, padding: 14,
    borderWidth: 2, position: 'relative',
  },
  cardEarned: {
    backgroundColor: '#FFFBEB', borderColor: GOLD,
  },
  cardLocked: {
    backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', opacity: 0.7,
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  name: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  desc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  textMuted: { color: '#9CA3AF' },
  points: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  badge: { position: 'absolute', top: 6, right: 6 },
});
