import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Status = 'all' | 'new' | 'confirmed' | 'preparing' | 'delivering' | 'delivered';

const FILTERS: { key: Status; label: string }[] = [
  { key: 'all', label: 'Бүгд' },
  { key: 'new', label: 'Шинэ' },
  { key: 'confirmed', label: 'Баталсан' },
  { key: 'preparing', label: 'Бэлтгэж буй' },
  { key: 'delivering', label: 'Хүргэж буй' },
  { key: 'delivered', label: 'Хүргэгдсэн' },
];

const STATUS_COLORS: Record<string, string> = {
  new: '#22C55E',
  confirmed: '#3B82F6',
  preparing: '#F59E0B',
  delivering: '#8B5CF6',
  delivered: '#666',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Шинэ',
  confirmed: 'Баталсан',
  preparing: 'Бэлтгэж буй',
  delivering: 'Хүргэж буй',
  delivered: 'Хүргэгдсэн',
};

const ORDERS = [
  { id: '#2401', customer: 'Б.Болд', items: 3, total: '₮72,000', status: 'new', time: '2 мин' },
  { id: '#2400', customer: 'Д.Сараа', items: 1, total: '₮25,000', status: 'confirmed', time: '15 мин' },
  { id: '#2399', customer: 'Г.Тэмүүлэн', items: 5, total: '₮148,000', status: 'preparing', time: '28 мин' },
  { id: '#2398', customer: 'О.Оюука', items: 2, total: '₮56,000', status: 'delivering', time: '45 мин' },
  { id: '#2397', customer: 'Э.Энхжин', items: 1, total: '₮18,000', status: 'delivered', time: '1 цаг' },
  { id: '#2396', customer: 'Н.Нарангэрэл', items: 4, total: '₮95,000', status: 'delivered', time: '2 цаг' },
];

export default function SellerOrders() {
  const [filter, setFilter] = useState<Status>('all');
  const filtered = filter === 'all' ? ORDERS : ORDERS.filter((o) => o.status === filter);

  return (
    <View style={s.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterBtn, filter === f.key && s.filterActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardId}>{item.id}</Text>
              <Text style={s.cardTime}>{item.time}</Text>
            </View>
            <Text style={s.cardCustomer}>{item.customer} · {item.items} бараа</Text>
            <View style={s.cardFooter}>
              <Text style={s.cardTotal}>{item.total}</Text>
              <View style={[s.badge, { backgroundColor: (STATUS_COLORS[item.status] ?? '#666') + '22' }]}>
                <Text style={[s.badgeText, { color: STATUS_COLORS[item.status] ?? '#666' }]}>
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  filterRow: { maxHeight: 52, paddingVertical: 10 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  filterActive: { backgroundColor: '#22C55E22', borderColor: '#22C55E' },
  filterText: { color: '#999', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#22C55E' },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardId: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  cardTime: { color: '#666', fontSize: 12 },
  cardCustomer: { color: '#CCC', fontSize: 13, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTotal: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
