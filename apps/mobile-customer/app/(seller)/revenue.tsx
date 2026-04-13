import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SellerAPI } from '../lib/api';

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M₮';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K₮';
  return n.toLocaleString() + '₮';
}

const PERIODS = [
  { key: '7d', label: '7 хоног' },
  { key: '30d', label: '30 хоног' },
  { key: '90d', label: '3 сар' },
];

export default function RevenueScreen() {
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [payoutModal, setPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  const load = async () => {
    try {
      const data = await SellerAPI.revenue(period);
      setStats(data);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [period]);

  const handlePayout = async () => {
    if (!payoutAmount || parseInt(payoutAmount) < 1000) {
      Alert.alert('Алдаа', 'Хамгийн багадаа 1,000₮');
      return;
    }
    try {
      Alert.alert('Амжилттай', 'Payout хүсэлт илгээгдлээ');
      setPayoutModal(false);
      setPayoutAmount('');
    } catch {
      Alert.alert('Алдаа', 'Payout илгээхэд алдаа гарлаа');
    }
  };

  const walletBalance = stats?.walletBalance || 0;
  const escrowHolding = stats?.escrowHolding || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const commissionPaid = stats?.commissionPaid || 0;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#22C55E" />}>

        {/* Period selector */}
        <View style={s.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity key={p.key} style={[s.periodBtn, period === p.key && s.periodActive]}
              onPress={() => setPeriod(p.key)}>
              <Text style={[s.periodText, period === p.key && s.periodTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Balance cards */}
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Үлдэгдэл</Text>
          <Text style={s.balanceValue}>{fmt(walletBalance)}</Text>
          <TouchableOpacity style={s.payoutBtn} onPress={() => setPayoutModal(true)}>
            <Ionicons name="arrow-up-circle" size={18} color="#FFF" />
            <Text style={s.payoutBtnText}>Банкруу шилжүүлэх</Text>
          </TouchableOpacity>
        </View>

        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Нийт орлого</Text>
            <Text style={[s.statValue, { color: '#22C55E' }]}>{fmt(totalRevenue)}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Хүлээгдэж буй</Text>
            <Text style={[s.statValue, { color: '#F59E0B' }]}>{fmt(escrowHolding)}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Комисс</Text>
            <Text style={[s.statValue, { color: '#E8242C' }]}>{fmt(commissionPaid)}</Text>
          </View>
        </View>

        {/* Revenue chart placeholder */}
        <View style={s.chartCard}>
          <Text style={s.sectionTitle}>
            <Ionicons name="bar-chart-outline" size={16} color="#22C55E" /> Орлогын динамик
          </Text>
          <View style={s.chartBars}>
            {(stats?.dailyRevenue || Array(7).fill(0)).slice(-7).map((val: number, i: number) => {
              const max = Math.max(...(stats?.dailyRevenue || [1]));
              const h = max > 0 ? Math.max(8, (val / max) * 100) : 8;
              return (
                <View key={i} style={s.barCol}>
                  <View style={[s.bar, { height: h, backgroundColor: i === 6 ? '#22C55E' : '#2A2A2A' }]} />
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent transactions */}
        <Text style={s.sectionTitle}>Сүүлийн гүйлгээнүүд</Text>
        {(stats?.recentTransactions || []).length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>💰</Text>
            <Text style={{ color: '#555', fontSize: 13 }}>Гүйлгээ байхгүй</Text>
          </View>
        ) : (
          (stats?.recentTransactions || []).map((tx: any, i: number) => (
            <View key={i} style={s.txCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.txId}>#{tx.orderNumber || tx.id?.slice(-5)}</Text>
                <Text style={s.txDate}>{tx.date ? new Date(tx.date).toLocaleDateString('mn-MN') : ''}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.txAmount}>{fmt(tx.amount || 0)}</Text>
                <Text style={s.txCommission}>Комисс: {fmt(tx.commission || 0)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Payout Modal */}
      <Modal visible={payoutModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>Банкруу шилжүүлэх</Text>
            <Text style={s.modalSub}>Үлдэгдэл: {fmt(walletBalance)}</Text>

            <Text style={s.inputLabel}>Дүн (₮)</Text>
            <TextInput style={s.input} value={payoutAmount} onChangeText={setPayoutAmount}
              keyboardType="number-pad" placeholder="50000" placeholderTextColor="#555" />

            <TouchableOpacity style={s.modalBtn} onPress={handlePayout}>
              <Text style={s.modalBtnText}>Шилжүүлэх</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.modalCancel} onPress={() => setPayoutModal(false)}>
              <Text style={{ color: '#999', fontWeight: '600' }}>Болих</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1A1A1A', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  periodActive: { backgroundColor: '#22C55E22', borderColor: '#22C55E' },
  periodText: { color: '#999', fontSize: 12, fontWeight: '700' },
  periodTextActive: { color: '#22C55E' },
  balanceCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 12 },
  balanceLabel: { color: '#999', fontSize: 12 },
  balanceValue: { color: '#FFF', fontSize: 32, fontWeight: '900', marginVertical: 8 },
  payoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#22C55E', borderRadius: 12, paddingVertical: 12, marginTop: 8 },
  payoutBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  statLabel: { color: '#999', fontSize: 10, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '800' },
  chartCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 16 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 100, marginTop: 12 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '80%', borderRadius: 4 },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  emptyCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 0.5, borderColor: '#2A2A2A' },
  txId: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  txDate: { color: '#666', fontSize: 11, marginTop: 2 },
  txAmount: { color: '#22C55E', fontSize: 15, fontWeight: '800' },
  txCommission: { color: '#E8242C', fontSize: 10, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  modalSub: { color: '#999', fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  inputLabel: { color: '#999', fontSize: 11, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#2A2A2A', borderRadius: 12, padding: 14, color: '#FFF', fontSize: 18, fontWeight: '700', textAlign: 'center', borderWidth: 1, borderColor: '#3D3D3D' },
  modalBtn: { backgroundColor: '#22C55E', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  modalBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  modalCancel: { alignItems: 'center', marginTop: 12, paddingVertical: 10 },
});
