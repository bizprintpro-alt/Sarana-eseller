import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const PRODUCTS = [
  { id: '1', name: 'Premium цагаан цамц', price: 35000, stock: 24, emoji: '👕' },
  { id: '2', name: 'Sporty гутал Air', price: 69000, stock: 8, emoji: '👟' },
  { id: '3', name: 'Bluetooth чихэвч', price: 99000, stock: 3, emoji: '🎧' },
  { id: '4', name: 'Leather цүнх', price: 75000, stock: 12, emoji: '👜' },
  { id: '5', name: 'Нүүрний крем SPF50', price: 28000, stock: 45, emoji: '💄' },
];

export default function SellerProducts() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <TouchableOpacity style={s.addBtn} onPress={() => router.push('/products/add')}>
        <Text style={s.addText}>+ Бараа нэмэх</Text>
      </TouchableOpacity>
      <FlatList data={PRODUCTS} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => router.push(`/products/${item.id}`)} activeOpacity={0.8}>
            <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.stock}>Үлдэгдэл: {item.stock} {item.stock < 5 && '⚠️'}</Text>
            </View>
            <Text style={s.price}>{item.price.toLocaleString()}₮</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  addBtn: { backgroundColor: '#E8242C', margin: 16, marginBottom: 0, borderRadius: 12, padding: 14, alignItems: 'center' },
  addText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: '#3D3D3D' },
  name: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  stock: { fontSize: 11, color: '#A0A0A0', marginTop: 2 },
  price: { fontSize: 15, fontWeight: '800', color: '#E8242C' },
});
