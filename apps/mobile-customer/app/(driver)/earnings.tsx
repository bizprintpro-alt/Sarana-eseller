import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Period = 'today' | 'week' | 'month';

const EARNINGS: Record<Period, { amount: string; deliveries: number; hours: string }> = {
  today: { amount: '₮52,400', deliveries: 8, hours: '5ц 20м' },
  week: { amount: '₮312,000', deliveries: 47, hours: '32ц' },
  month: { amount: '₮1,240,000', deliveries: 186, hours: '128ц' },
};

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Өнөөдөр',
  week: '7 хоног',
  month: 'Энэ сар',
};

const RECENT = [
  { id: 'D-098', amount: '₮5,200', time: '14:30' },
  { id: 'D-097', amount: '₮4,800', time: '13:10' },
  { id: 'D-096', amount: '₮6,500', time: '11:45' },
  { id: 'D-095', amount: '₮3,800', time: '10:20' },
  { id: 'D-094', amount: '₮4,200', time: '09:15' },
];

export default function DriverEarnings() {
  const [period, setPeriod] = useState<Period>('today');
  const data = EARNINGS[period];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Period tabs */}
      <View style={s.tabRow}>
        {(Object.keys(EARNINGS) as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[s.tab, period === p && s.tabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[s.tabText, period === p && s.tabTextActive]}>{PERIOD_LABELS[p]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main earnings card */}
      <View style={s.mainCard}>
        <Text style={s.mainLabel}>Нийт орлого</Text>
        <Text style={s.mainAmount}>{data.amount}</Text>
        <View style={s.mainStats}>
          <View style={s.mainStat}>
            <Ionicons name="bicycle-outline" size={16} color="#F59E0B" />
            <Text style={s.mainStatText}>{data.deliveries} хүргэлт</Text>
          </View>
          <View style={s.mainStat}>
            <Ionicons name="time-outline" size={16} color="#F59E0B" />
            <Text style={s.mainStatText}>{data.hours}</Text>
          </View>
        </View>
      </View>

      {/* Balance & withdraw */}
      <View style={s.balanceCard}>
        <View>
          <Text style={s.balanceLabel}>Гаргах боломжтой</Text>
          <Text style={s.balanceAmount}>₮1,240,000</Text>
        </View>
        <TouchableOpacity style={s.withdrawBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-up-circle" size={18} color="#FFF" />
          <Text style={s.withdrawText}>Гаргах</Text>
        </TouchableOpacity>
      </View>

      {/* Recent earnings */}
      <Text style={s.section}>Өнөөдрийн орлого</Text>
      {RECENT.map((r) => (
        <View key={r.id} style={s.recentCard}>
          <View style={s.recentIcon}>
            <Ionicons name="checkmark" size={16} color="#22C55E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.recentId}>{r.id}</Text>
            <Text style={s.recentTime}>{r.time}</Text>
          </View>
          <Text style={s.recentAmount}>{r.amount}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  tabActive: { backgroundColor: '#F59E0B22', borderColor: '#F59E0B' },
  tabText: { color: '#999', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#F59E0B' },
  mainCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B44',
    marginBottom: 12,
  },
  mainLabel: { color: '#999', fontSize: 13 },
  mainAmount: { color: '#F59E0B', fontSize: 36, fontWeight: '900', marginTop: 4 },
  mainStats: { flexDirection: 'row', gap: 24, marginTop: 16 },
  mainStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mainStatText: { color: '#CCC', fontSize: 13 },
  balanceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 8,
  },
  balanceLabel: { color: '#999', fontSize: 12 },
  balanceAmount: { color: '#FFF', fontSize: 18, fontWeight: '800', marginTop: 2 },
  withdrawBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  withdrawText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  section: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12 },
  recentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 12,
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentId: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  recentTime: { color: '#666', fontSize: 11 },
  recentAmount: { color: '#F59E0B', fontSize: 15, fontWeight: '800' },
});
