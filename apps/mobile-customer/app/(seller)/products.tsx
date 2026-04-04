import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRODUCTS = [
  { id: '1', name: 'Ноолууран цамц', price: '₮89,000', stock: 24, active: true },
  { id: '2', name: 'Арьсан цүнх', price: '₮145,000', stock: 8, active: true },
  { id: '3', name: 'Дулаан малгай', price: '₮35,000', stock: 0, active: false },
  { id: '4', name: 'Хөнгөн пүүз', price: '₮68,000', stock: 15, active: true },
  { id: '5', name: 'Спорт цамц', price: '₮42,000', stock: 31, active: true },
  { id: '6', name: 'Даавуун өмд', price: '₮56,000', stock: 12, active: true },
  { id: '7', name: 'Нарны шил', price: '₮28,000', stock: 5, active: true },
];

export default function SellerProducts() {
  return (
    <View style={s.container}>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={[s.thumb, { backgroundColor: item.active ? '#22C55E22' : '#66666622' }]}>
              <Ionicons name="cube" size={24} color={item.active ? '#22C55E' : '#666'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.price}>{item.price}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[s.stock, item.stock === 0 && { color: '#E8242C' }]}>
                {item.stock === 0 ? 'Дууссан' : `${item.stock} ш`}
              </Text>
              <View style={[s.statusDot, { backgroundColor: item.active ? '#22C55E' : '#666' }]} />
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={s.fab} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#FFF" />
        <Text style={s.fabText}>Бараа нэмэх</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  card: {
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
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  price: { color: '#22C55E', fontSize: 13, fontWeight: '600', marginTop: 2 },
  stock: { color: '#999', fontSize: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#22C55E',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 6,
    elevation: 6,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
