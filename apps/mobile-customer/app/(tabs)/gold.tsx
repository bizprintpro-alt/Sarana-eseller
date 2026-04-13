import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GOLD = '#C0953C';

const BENEFITS = [
  { icon: 'flash', title: 'Flash Sale эрт нэвтрэх', desc: '1 цагийн өмнө' },
  { icon: 'bicycle', title: 'Үнэгүй хүргэлт', desc: '50,000₮+ захиалгад' },
  { icon: 'star', title: '2x оноо', desc: 'Бүх захиалгаас давхар оноо' },
  { icon: 'gift', title: 'Төрсөн өдрийн бонус', desc: '1,000 оноо бэлэг' },
  { icon: 'pricetag', title: 'Тусгай хөнгөлөлт', desc: 'Gold-д зориулсан купон' },
  { icon: 'shield-checkmark', title: 'Тэргүүлэх дэмжлэг', desc: '24/7 чат дэмжлэг' },
];

const PLANS = [
  { months: 1, price: 9900, perMonth: 9900, popular: false },
  { months: 3, price: 24900, perMonth: 8300, popular: true },
  { months: 12, price: 79900, perMonth: 6658, popular: false },
];

export default function GoldScreen() {
  const [selected, setSelected] = useState(1);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      {/* Hero */}
      <View style={s.hero}>
        <Ionicons name="diamond" size={48} color={GOLD} />
        <Text style={s.heroTitle}>Gold гишүүнчлэл</Text>
        <Text style={s.heroSub}>Давуу эрхтэй худалдан авалт хийгээрэй</Text>
      </View>

      {/* Benefits */}
      <Text style={s.section}>Давуу талууд</Text>
      {BENEFITS.map((b, i) => (
        <View key={i} style={s.benefitCard}>
          <View style={s.benefitIcon}>
            <Ionicons name={b.icon as any} size={20} color={GOLD} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.benefitTitle}>{b.title}</Text>
            <Text style={s.benefitDesc}>{b.desc}</Text>
          </View>
        </View>
      ))}

      {/* Plans */}
      <Text style={s.section}>Багц сонгох</Text>
      {PLANS.map((p, i) => (
        <TouchableOpacity
          key={i}
          style={[s.planCard, selected === i && s.planActive]}
          onPress={() => setSelected(i)}
        >
          {p.popular && (
            <View style={s.popularBadge}>
              <Text style={s.popularText}>Хамгийн хямд</Text>
            </View>
          )}
          <View style={s.planHeader}>
            <Ionicons
              name={selected === i ? 'radio-button-on' : 'radio-button-off'}
              size={22} color={selected === i ? GOLD : '#555'}
            />
            <Text style={s.planMonths}>{p.months} сар</Text>
          </View>
          <Text style={s.planPrice}>{p.price.toLocaleString()}₮</Text>
          <Text style={s.planPerMonth}>сард {p.perMonth.toLocaleString()}₮</Text>
        </TouchableOpacity>
      ))}

      {/* Subscribe button */}
      <TouchableOpacity
        style={s.subscribeBtn}
        onPress={() => Alert.alert('Gold', 'QPay төлбөр удахгүй нэмэгдэнэ')}
      >
        <Ionicons name="diamond" size={18} color="#FFF" />
        <Text style={s.subscribeText}>Gold болох</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  hero: { alignItems: 'center', paddingVertical: 28, backgroundColor: '#1A1200', borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: GOLD + '33' },
  heroTitle: { color: GOLD, fontSize: 24, fontWeight: '900', marginTop: 12 },
  heroSub: { color: '#999', fontSize: 13, marginTop: 4 },

  section: { color: '#FFF', fontSize: 17, fontWeight: '800', marginTop: 16, marginBottom: 12 },

  benefitCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  benefitIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: GOLD + '15', alignItems: 'center', justifyContent: 'center' },
  benefitTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  benefitDesc: { color: '#999', fontSize: 11, marginTop: 2 },

  planCard: {
    backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#2A2A2A',
  },
  planActive: { borderColor: GOLD, backgroundColor: GOLD + '0D' },
  popularBadge: { position: 'absolute', top: -10, right: 12, backgroundColor: GOLD, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  popularText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  planMonths: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  planPrice: { color: GOLD, fontSize: 22, fontWeight: '900', marginLeft: 30 },
  planPerMonth: { color: '#999', fontSize: 12, marginLeft: 30 },

  subscribeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: GOLD, borderRadius: 16, padding: 18, marginTop: 20,
  },
  subscribeText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
