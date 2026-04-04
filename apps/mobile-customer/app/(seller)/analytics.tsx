import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const METRICS = [
  { label: 'Өнөөдөр', value: '₮840K', change: '+12%', up: true },
  { label: '7 хоног', value: '₮4.2M', change: '+8%', up: true },
  { label: '30 хоног', value: '₮16.8M', change: '-3%', up: false },
  { label: 'Нийт', value: '₮124M', change: '', up: true },
];

const CHART_BARS = [
  { day: 'Да', h: 0.4 },
  { day: 'Мя', h: 0.6 },
  { day: 'Лх', h: 0.8 },
  { day: 'Пү', h: 0.5 },
  { day: 'Ба', h: 1.0 },
  { day: 'Бя', h: 0.7 },
  { day: 'Ня', h: 0.3 },
];

const TOP_PRODUCTS = [
  { name: 'Ноолууран цамц', sold: 48, revenue: '₮4.27M' },
  { name: 'Арьсан цүнх', sold: 22, revenue: '₮3.19M' },
  { name: 'Хөнгөн пүүз', sold: 35, revenue: '₮2.38M' },
  { name: 'Спорт цамц', sold: 29, revenue: '₮1.22M' },
];

export default function SellerAnalytics() {
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Revenue metrics */}
      <View style={s.grid}>
        {METRICS.map((m) => (
          <View key={m.label} style={s.metricCard}>
            <Text style={s.metricLabel}>{m.label}</Text>
            <Text style={s.metricValue}>{m.value}</Text>
            {m.change !== '' && (
              <View style={s.changeRow}>
                <Ionicons
                  name={m.up ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={m.up ? '#22C55E' : '#E8242C'}
                />
                <Text style={[s.changeText, { color: m.up ? '#22C55E' : '#E8242C' }]}>
                  {m.change}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Bar chart */}
      <Text style={s.section}>Долоо хоногийн орлого</Text>
      <View style={s.chartCard}>
        <View style={s.chartRow}>
          {CHART_BARS.map((b) => (
            <View key={b.day} style={s.barCol}>
              <View style={[s.bar, { height: b.h * 120 }]} />
              <Text style={s.barLabel}>{b.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top products */}
      <Text style={s.section}>Шилдэг бараа</Text>
      {TOP_PRODUCTS.map((p, i) => (
        <View key={p.name} style={s.prodCard}>
          <Text style={s.prodRank}>#{i + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.prodName}>{p.name}</Text>
            <Text style={s.prodSold}>{p.sold} ширхэг зарагдсан</Text>
          </View>
          <Text style={s.prodRev}>{p.revenue}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    width: '48%' as any,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  metricLabel: { color: '#999', fontSize: 12 },
  metricValue: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 4 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  changeText: { fontSize: 12, fontWeight: '600' },
  section: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  chartCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  chartRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 140 },
  barCol: { alignItems: 'center', gap: 6 },
  bar: { width: 28, borderRadius: 6, backgroundColor: '#22C55E' },
  barLabel: { color: '#999', fontSize: 11 },
  prodCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 12,
  },
  prodRank: { color: '#22C55E', fontSize: 16, fontWeight: '800', width: 30 },
  prodName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  prodSold: { color: '#999', fontSize: 12, marginTop: 2 },
  prodRev: { color: '#22C55E', fontSize: 14, fontWeight: '700' },
});
