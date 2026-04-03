import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function CartScreen() {
  // TODO: connect to shared cart store
  const items: any[] = [];

  return (
    <View style={s.container}>
      {items.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
          <Text style={s.emptyTitle}>Сагс хоосон байна</Text>
          <Text style={s.emptyDesc}>Дэлгүүрээс бараа нэмээрэй</Text>
          <TouchableOpacity style={s.shopBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={s.shopBtnText}>Дэлгүүр үзэх</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView>
          {/* Cart items will render here */}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#A0A0A0', marginBottom: 20 },
  shopBtn: { backgroundColor: '#E8242C', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  shopBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
