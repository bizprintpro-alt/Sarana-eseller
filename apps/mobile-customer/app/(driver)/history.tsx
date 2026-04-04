import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HISTORY = [
  { id: 'D-098', shop: 'Миний дэлгүүр', customer: 'А.Анар', address: 'БЗД 5-р хороо', reward: '₮5,200', date: 'Өнөөдөр 14:30', distance: '3.2 км' },
  { id: 'D-097', shop: 'Fashion Store', customer: 'Н.Номин', address: 'СБД 2-р хороо', reward: '₮4,800', date: 'Өнөөдөр 13:10', distance: '2.8 км' },
  { id: 'D-096', shop: 'TechShop', customer: 'Б.Батаа', address: 'ЧД 4-р хороо', reward: '₮6,500', date: 'Өнөөдөр 11:45', distance: '4.5 км' },
  { id: 'D-093', shop: 'Миний дэлгүүр', customer: 'Т.Тулга', address: 'БГД 7-р хороо', reward: '₮3,800', date: 'Өчигдөр 18:20', distance: '1.9 км' },
  { id: 'D-092', shop: 'GreenMart', customer: 'С.Сүхээ', address: 'ХУД 9-р хороо', reward: '₮7,100', date: 'Өчигдөр 16:55', distance: '5.6 км' },
  { id: 'D-091', shop: 'Fashion Store', customer: 'Д.Дөлгөөн', address: 'СБД 1-р хороо', reward: '₮4,200', date: 'Өчигдөр 14:30', distance: '2.1 км' },
  { id: 'D-088', shop: 'BookStore', customer: 'Э.Эрдэнэ', address: 'БЗД 6-р хороо', reward: '₮5,500', date: '2 өдрийн өмнө', distance: '3.7 км' },
];

export default function DriverHistory() {
  return (
    <FlatList
      style={s.container}
      data={HISTORY}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.iconWrap}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardId}>{item.id} · {item.shop}</Text>
              <Text style={s.cardDate}>{item.date}</Text>
            </View>
            <Text style={s.cardReward}>{item.reward}</Text>
          </View>
          <View style={s.details}>
            <View style={s.detailRow}>
              <Ionicons name="person-outline" size={13} color="#666" />
              <Text style={s.detailText}>{item.customer}</Text>
            </View>
            <View style={s.detailRow}>
              <Ionicons name="location-outline" size={13} color="#666" />
              <Text style={s.detailText}>{item.address} · {item.distance}</Text>
            </View>
          </View>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22C55E22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardId: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  cardDate: { color: '#666', fontSize: 11, marginTop: 2 },
  cardReward: { color: '#F59E0B', fontSize: 15, fontWeight: '800' },
  details: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2A2A2A', gap: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: '#999', fontSize: 12 },
});
