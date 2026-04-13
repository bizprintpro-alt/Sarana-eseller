import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SellerAPI } from '../lib/api';

const ACCENT = '#8B5CF6';

const PERIODS = [
  { key: 'today', label: 'Өнөөдөр' },
  { key: 'week', label: '7 хоног' },
  { key: 'month', label: 'Сар' },
  { key: 'year', label: 'Жил' },
];

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function OwnerAnalytics() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    SellerAPI.revenue(period)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <ScrollView style={st.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      {/* Period tabs */}
      <View style={st.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity key={p.key} style={[st.periodChip, period === p.key && st.periodActive]}
            onPress={() => setPeriod(p.key)}>
            <Text style={[st.periodText, period === p.key && { color: '#FFF' }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={ACCENT} size="large" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Revenue card */}
          <View style={st.revenueCard}>
            <Text style={st.revenueLabel}>Нийт орлого</Text>
            <Text style={st.revenueValue}>{fmt(data?.totalRevenue || 0)}</Text>
            <View style={st.revMeta}>
              <View style={st.revItem}>
                <Text style={st.revItemValue}>{data?.totalOrders || 0}</Text>
                <Text style={st.revItemLabel}>Захиалга</Text>
              </View>
              <View style={st.revItem}>
                <Text style={st.revItemValue}>{fmt(data?.averageOrder || 0)}</Text>
                <Text style={st.revItemLabel}>Дундаж</Text>
              </View>
              <View style={st.revItem}>
                <Text style={st.revItemValue}>{data?.totalProducts || 0}</Text>
                <Text style={st.revItemLabel}>Бараа</Text>
              </View>
            </View>
          </View>

          {/* Top products */}
          <Text style={st.section}>Шилдэг бараа</Text>
          {(data?.topProducts || []).length === 0 ? (
            <Text style={st.noData}>Мэдээлэл байхгүй</Text>
          ) : (
            (data.topProducts || []).slice(0, 5).map((p: any, i: number) => (
              <View key={p.id || i} style={st.topCard}>
                <Text style={st.topRank}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={st.topName} numberOfLines={1}>{p.name}</Text>
                  <Text style={st.topSold}>{p.soldCount || 0} зарагдсан</Text>
                </View>
                <Text style={st.topRevenue}>{fmt(p.revenue || 0)}</Text>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodChip: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 0.5, borderColor: '#2A2A2A' },
  periodActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  periodText: { color: '#999', fontSize: 12, fontWeight: '600' },

  revenueCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 0.5, borderColor: '#2A2A2A' },
  revenueLabel: { color: '#999', fontSize: 12 },
  revenueValue: { color: '#22C55E', fontSize: 32, fontWeight: '900', marginTop: 4 },
  revMeta: { flexDirection: 'row', marginTop: 16, gap: 12 },
  revItem: { flex: 1, backgroundColor: '#2A2A2A', borderRadius: 10, padding: 10, alignItems: 'center' },
  revItemValue: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  revItemLabel: { color: '#999', fontSize: 10, marginTop: 2 },

  section: { color: '#FFF', fontSize: 16, fontWeight: '800', marginTop: 8, marginBottom: 12 },
  noData: { color: '#555', fontSize: 13, textAlign: 'center', paddingVertical: 20 },

  topCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  topRank: { color: ACCENT, fontSize: 16, fontWeight: '900', width: 28 },
  topName: { color: '#E0E0E0', fontSize: 13, fontWeight: '600' },
  topSold: { color: '#999', fontSize: 11 },
  topRevenue: { color: '#22C55E', fontSize: 14, fontWeight: '800' },
});
