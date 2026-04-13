import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrdersAPI } from '../lib/api';
import * as SecureStore from 'expo-secure-store';

const BRAND = '#2563EB';

interface BNPLPaymentItem {
  id: string;
  dueDate: string;
  amount: number;
  paidAt: string | null;
  status: string;
}

interface BNPLApp {
  id: string;
  totalAmount: number;
  downPayment: number;
  monthlyAmount: number;
  months: number;
  bank: string;
  status: string;
  order: { id: string; orderNumber: string; total: number };
  payments: BNPLPaymentItem[];
  nextPayment: BNPLPaymentItem | null;
  progress: { paid: number; total: number };
}

const STATUS_META: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  PENDING:   { label: 'Хүлээгдэж байна', color: '#F59E0B', icon: 'time-outline' },
  ACTIVE:    { label: 'Идэвхтэй', color: '#2563EB', icon: 'card-outline' },
  COMPLETED: { label: 'Дууссан', color: '#22C55E', icon: 'checkmark-circle-outline' },
  DEFAULTED: { label: 'Хугацаа хэтэрсэн', color: '#EF4444', icon: 'alert-circle-outline' },
  REJECTED:  { label: 'Татгалзсан', color: '#6B7280', icon: 'close-circle-outline' },
};

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  PAID:    '#22C55E',
  OVERDUE: '#EF4444',
};

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: 'Хүлээгдэж байна',
  PAID:    'Төлсөн',
  OVERDUE: 'Хугацаа хэтэрсэн',
};

const fmt = (n: number) => n.toLocaleString();

function fmtDate(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

async function fetchBNPL(): Promise<BNPLApp[]> {
  const token = await SecureStore.getItemAsync('token');
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://eseller.mn'}/api/bnpl/payments`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  return data.data || [];
}

export default function BNPLScreen() {
  const [apps, setApps] = useState<BNPLApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchBNPL();
      setApps(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const handlePay = (paymentId: string) => {
    Alert.alert('Төлбөр хийх', 'Төлбөр хийх хэсэг удахгүй нэмэгдэнэ');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  const renderApp = ({ item: app }: { item: BNPLApp }) => {
    const meta = STATUS_META[app.status] || STATUS_META.PENDING;
    const progressPct = app.progress.total > 0
      ? (app.progress.paid / app.progress.total) * 100
      : 0;

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNum}>Захиалга #{app.order.orderNumber}</Text>
            <Text style={styles.subtitle}>{app.bank} | {app.months} сар</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: meta.color + '20' }]}>
            <Ionicons name={meta.icon} size={14} color={meta.color} />
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        {/* Amounts */}
        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Нийт</Text>
            <Text style={styles.amountValue}>{fmt(app.totalAmount)}₮</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Сарын</Text>
            <Text style={[styles.amountValue, { color: BRAND }]}>{fmt(app.monthlyAmount)}₮</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Урьдчилгаа</Text>
            <Text style={styles.amountValue}>{fmt(app.downPayment)}₮</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Төлбөрийн явц</Text>
            <Text style={styles.progressLabel}>
              {app.progress.paid}/{app.progress.total} ({Math.round(progressPct)}%)
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        {/* Next payment */}
        {app.nextPayment && (
          <View style={styles.nextPayment}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nextPaymentLabel}>Дараагийн төлбөр</Text>
              <Text style={styles.nextPaymentValue}>
                {fmtDate(app.nextPayment.dueDate)} — {fmt(app.nextPayment.amount)}₮
              </Text>
            </View>
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => handlePay(app.nextPayment!.id)}
            >
              <Ionicons name="wallet-outline" size={14} color="#fff" />
              <Text style={styles.payBtnText}>Төлбөр хийх</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment list */}
        {app.payments.map((p, i) => (
          <View key={p.id} style={styles.paymentRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.paymentNum}>#{i + 1}</Text>
              <Text style={styles.paymentDate}>{fmtDate(p.dueDate)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.paymentAmount}>{fmt(p.amount)}₮</Text>
              <View
                style={[
                  styles.paymentBadge,
                  { backgroundColor: (PAYMENT_COLORS[p.status] || '#6B7280') + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.paymentBadgeText,
                    { color: PAYMENT_COLORS[p.status] || '#6B7280' },
                  ]}
                >
                  {PAYMENT_LABELS[p.status] || p.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="card-outline" size={24} color={BRAND} />
        <Text style={styles.title}>Зээлээр авах</Text>
      </View>

      {apps.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="card-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>Танд одоогоор BNPL зээл байхгүй байна</Text>
        </View>
      ) : (
        <FlatList
          data={apps}
          keyExtractor={(item) => item.id}
          renderItem={renderApp}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  orderNum: { fontSize: 14, fontWeight: '600', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  amountRow: {
    flexDirection: 'row', backgroundColor: '#F9FAFB',
    borderRadius: 12, padding: 12, marginBottom: 12, gap: 8,
  },
  amountItem: { flex: 1 },
  amountLabel: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  amountValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  progressSection: { marginBottom: 12 },
  progressHeader: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4,
  },
  progressLabel: { fontSize: 11, color: '#6B7280' },
  progressTrack: {
    height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: BRAND, borderRadius: 3 },
  nextPayment: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#DBEAFE',
  },
  nextPaymentLabel: { fontSize: 11, color: '#6B7280' },
  nextPaymentValue: { fontSize: 13, fontWeight: '500', color: '#111827' },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: BRAND, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  payBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  paymentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 4,
  },
  paymentNum: { fontSize: 11, color: '#9CA3AF' },
  paymentDate: { fontSize: 13, color: '#374151' },
  paymentAmount: { fontSize: 13, fontWeight: '600', color: '#111827' },
  paymentBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  paymentBadgeText: { fontSize: 10, fontWeight: '600' },
});
