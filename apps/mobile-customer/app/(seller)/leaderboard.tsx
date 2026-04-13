import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SellerAPI } from '../lib/api';

const ACCENT = '#22C55E';

const MEDALS = ['🥇', '🥈', '🥉'];

function fmt(n: number) { return n.toLocaleString() + '₮'; }

function getMonthLabel(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return d.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long' });
}

interface LeaderEntry {
  id: string;
  name: string;
  avatar?: string;
  totalSales: number;
  totalRevenue: number;
  rank: number;
  isMe: boolean;
}

export default function LeaderboardScreen() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    SellerAPI.leaderboard(monthOffset === 0 ? 'month' : `month-${monthOffset}`)
      .then(data => {
        const list = (data?.leaderboard || data?.sellers || []).map((s: any, i: number) => ({
          id: s.id,
          name: s.name || s.shopName || `Борлуулагч #${i + 1}`,
          avatar: s.avatar,
          totalSales: s.totalSales || s.sales || 0,
          totalRevenue: s.totalRevenue || s.revenue || 0,
          rank: i + 1,
          isMe: s.isMe || false,
        }));
        setEntries(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [monthOffset]);

  return (
    <ScrollView style={st.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      {/* Month selector */}
      <View style={st.monthRow}>
        {[0, 1, 2].map(offset => (
          <TouchableOpacity key={offset} style={[st.monthChip, monthOffset === offset && st.monthActive]}
            onPress={() => setMonthOffset(offset)}>
            <Text style={[st.monthText, monthOffset === offset && { color: '#FFF' }]}>
              {offset === 0 ? 'Энэ сар' : getMonthLabel(offset)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Prize banner */}
      <View style={st.prizeBanner}>
        <Text style={{ fontSize: 24 }}>🏆</Text>
        <View style={{ flex: 1 }}>
          <Text style={st.prizeTitle}>1-р байр: 10,000 оноо бонус!</Text>
          <Text style={st.prizeSub}>Тухайн сарын шилдэг борлуулагч</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={ACCENT} size="large" style={{ marginTop: 40 }} />
      ) : entries.length === 0 ? (
        <View style={st.empty}>
          <Ionicons name="trophy-outline" size={48} color="#333" />
          <Text style={st.emptyText}>Мэдээлэл байхгүй</Text>
        </View>
      ) : (
        entries.map((e) => (
          <View key={e.id} style={[st.card, e.isMe && st.cardMe]}>
            {/* Rank */}
            <View style={[st.rankWrap, e.rank <= 3 && { backgroundColor: ['#FFD70033', '#C0C0C033', '#CD7F3233'][e.rank - 1] }]}>
              {e.rank <= 3 ? (
                <Text style={{ fontSize: 20 }}>{MEDALS[e.rank - 1]}</Text>
              ) : (
                <Text style={st.rankNum}>#{e.rank}</Text>
              )}
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={st.name}>{e.name}</Text>
                {e.isMe && (
                  <View style={st.meBadge}><Text style={st.meText}>Би</Text></View>
                )}
              </View>
              <Text style={st.sales}>{e.totalSales} борлуулалт</Text>
            </View>

            {/* Revenue */}
            <Text style={st.revenue}>{fmt(e.totalRevenue)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  monthRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  monthChip: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 0.5, borderColor: '#2A2A2A' },
  monthActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  monthText: { color: '#999', fontSize: 11, fontWeight: '600' },

  prizeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F59E0B15', borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 0.5, borderColor: '#F59E0B33',
  },
  prizeTitle: { color: '#F59E0B', fontSize: 14, fontWeight: '800' },
  prizeSub: { color: '#F59E0B99', fontSize: 11, marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#666', fontSize: 14, marginTop: 12 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  cardMe: { borderColor: ACCENT + '66', backgroundColor: ACCENT + '0D' },

  rankWrap: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#2A2A2A',
    alignItems: 'center', justifyContent: 'center',
  },
  rankNum: { color: '#999', fontSize: 15, fontWeight: '900' },

  name: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  meBadge: { backgroundColor: ACCENT, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  meText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  sales: { color: '#999', fontSize: 11, marginTop: 2 },

  revenue: { color: ACCENT, fontSize: 15, fontWeight: '900' },
});
