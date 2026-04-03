import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();

  // TODO: fetch from API
  const product = { _id: id, name: 'Sporty гутал Air', price: 89000, salePrice: 69000, emoji: '👟', description: 'Спорт болон өдөр тутамд тохиромжтой. Чанартай, тохилог.', rating: 4.8, reviewCount: 56, store: { name: 'SportsMN' } };
  const disc = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  return (
    <View style={s.container}>
      <ScrollView>
        {/* Image */}
        <View style={s.imageWrap}>
          <Text style={{ fontSize: 80 }}>{product.emoji}</Text>
          {disc > 0 && <View style={s.discBadge}><Text style={s.discText}>-{disc}%</Text></View>}
        </View>

        <View style={s.info}>
          <Text style={s.store}>{product.store.name}</Text>
          <Text style={s.name}>{product.name}</Text>

          {/* Rating */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <Text style={{ color: '#F59E0B', fontSize: 13 }}>★ {product.rating}</Text>
            <Text style={{ color: '#555', fontSize: 12 }}>({product.reviewCount} үнэлгээ)</Text>
          </View>

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 12 }}>
            <Text style={s.price}>{(product.salePrice || product.price).toLocaleString()}₮</Text>
            {disc > 0 && <Text style={s.oldPrice}>{product.price.toLocaleString()}₮</Text>}
          </View>

          {/* Trust badges */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {['🚚 Хурдан хүргэлт', '🛡️ Баталгаатай', '🔄 7 хоног буцаалт'].map((b) => (
              <View key={b} style={s.trustBadge}><Text style={s.trustText}>{b}</Text></View>
            ))}
          </View>

          {/* Description */}
          {product.description && (
            <Text style={s.desc}>{product.description}</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.wishBtn}>
          <Text style={{ fontSize: 20 }}>♡</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.cartBtn} activeOpacity={0.8}>
          <Text style={s.cartBtnText}>🛒 Сагсанд нэмэх — {(product.salePrice || product.price).toLocaleString()}₮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  imageWrap: { height: 300, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  discBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: '#E8242C', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  discText: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  info: { padding: 16 },
  store: { fontSize: 12, color: '#A0A0A0' },
  name: { fontSize: 22, fontWeight: '900', color: '#FFF', marginTop: 4, letterSpacing: -0.3 },
  price: { fontSize: 28, fontWeight: '900', color: '#E8242C' },
  oldPrice: { fontSize: 14, color: '#555', textDecorationLine: 'line-through' },
  trustBadge: { backgroundColor: '#1A1A1A', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 0.5, borderColor: '#3D3D3D' },
  trustText: { fontSize: 11, color: '#A0A0A0' },
  desc: { fontSize: 14, color: '#E0E0E0', lineHeight: 22, marginTop: 16 },
  bottomBar: { flexDirection: 'row', padding: 16, gap: 10, borderTopWidth: 0.5, borderTopColor: '#2A2A2A', backgroundColor: '#111111' },
  wishBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#3D3D3D' },
  cartBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#E8242C', alignItems: 'center', justifyContent: 'center' },
  cartBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});
