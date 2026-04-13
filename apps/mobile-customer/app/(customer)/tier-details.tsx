import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = process.env.EXPO_PUBLIC_API_URL || 'https://eseller.mn';

const TIERS = [
  { name: 'Bronze', minPoints: 0, color: '#CD7F32', benefits: ['1x оноо', 'Стандарт хүргэлт'] },
  { name: 'Silver', minPoints: 5000, color: '#C0C0C0', benefits: ['1.5x оноо', '10% хүргэлт хөнгөлөлт'] },
  { name: 'Gold', minPoints: 15000, color: '#FFD700', benefits: ['2x оноо', 'Үнэгүй хүргэлт', 'Flash Sale нэвтрэлт'] },
  { name: 'Platinum', minPoints: 50000, color: '#E5E4E2', benefits: ['2.5x оноо', 'Тусгай хөнгөлөлт', 'Эрт захиалга'] },
  { name: 'Diamond', minPoints: 100000, color: '#B9F2FF', benefits: ['3x оноо', 'VIP хүргэлт', 'Хувийн менежер'] },
];

export default function TierDetailsScreen() {
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API}/api/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWallet(data.data || data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const totalPoints = wallet?.totalPoints || wallet?.balance || 0;
  const currentTierIdx = TIERS.reduce((acc, t, i) => (totalPoints >= t.minPoints ? i : acc), 0);
  const currentTier = TIERS[currentTierIdx];
  const nextTier = TIERS[currentTierIdx + 1];
  const progress = nextTier
    ? (totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)
    : 1;

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Ачааллаж байна...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Current tier */}
      <View style={[styles.currentTierCard, { borderColor: currentTier.color }]}>
        <Text style={[styles.tierBadge, { color: currentTier.color }]}>{currentTier.name}</Text>
        <Text style={styles.points}>{totalPoints.toLocaleString()} оноо</Text>
        {nextTier && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: currentTier.color }]} />
            </View>
            <Text style={styles.progressText}>
              {nextTier.name} хүрэхэд {(nextTier.minPoints - totalPoints).toLocaleString()} оноо
            </Text>
          </View>
        )}
      </View>

      {/* All tiers */}
      <Text style={styles.sectionTitle}>Бүх түвшин</Text>
      {TIERS.map((tier, i) => (
        <View
          key={tier.name}
          style={[
            styles.tierRow,
            i === currentTierIdx && { borderColor: tier.color, borderWidth: 2 },
          ]}
        >
          <View style={styles.tierHeader}>
            <View style={[styles.dot, { backgroundColor: tier.color }]} />
            <Text style={styles.tierName}>{tier.name}</Text>
            <Text style={styles.tierMin}>{tier.minPoints.toLocaleString()}+ оноо</Text>
          </View>
          {tier.benefits.map((b, j) => (
            <Text key={j} style={styles.benefit}>
              • {b}
            </Text>
          ))}
          {i === currentTierIdx && (
            <View style={[styles.currentBadge, { backgroundColor: tier.color }]}>
              <Text style={styles.currentBadgeText}>Одоогийн түвшин</Text>
            </View>
          )}
        </View>
      ))}

      {/* Earn points CTA */}
      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>Оноо олох арга</Text>
        <Text style={styles.ctaItem}>• Бараа худалдаж авах (1₮ = 1 оноо)</Text>
        <Text style={styles.ctaItem}>• Үнэлгээ бичих (+50 оноо)</Text>
        <Text style={styles.ctaItem}>• Найзаа урих (+500 оноо)</Text>
        <Text style={styles.ctaItem}>• Gold гишүүнчлэл (2x оноо)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
  loadingText: { color: '#888' },
  currentTierCard: {
    borderWidth: 2, borderRadius: 16, padding: 20, marginBottom: 24, backgroundColor: '#111',
  },
  tierBadge: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  points: { fontSize: 16, color: '#ccc', marginBottom: 12 },
  progressContainer: { marginTop: 8 },
  progressBg: { height: 8, borderRadius: 4, backgroundColor: '#333' },
  progressFill: { height: 8, borderRadius: 4 },
  progressText: { color: '#888', fontSize: 12, marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  tierRow: {
    backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#222',
  },
  tierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  tierName: { fontSize: 16, fontWeight: '700', color: '#fff', flex: 1 },
  tierMin: { fontSize: 12, color: '#888' },
  benefit: { color: '#aaa', fontSize: 13, marginLeft: 20, marginBottom: 2 },
  currentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
  currentBadgeText: { color: '#000', fontSize: 11, fontWeight: '700' },
  ctaCard: {
    backgroundColor: '#111', borderRadius: 12, padding: 16, marginTop: 12, marginBottom: 40,
    borderWidth: 1, borderColor: '#222',
  },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
  ctaItem: { color: '#aaa', fontSize: 13, marginBottom: 4 },
});
