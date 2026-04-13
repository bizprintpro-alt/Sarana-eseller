import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ACCENT = '#8B5CF6';
const BRAND = '#E8242C';

const MENU = [
  {
    section: 'Дэлгүүрийн тохиргоо',
    items: [
      { icon: 'storefront-outline' as const, label: 'Дэлгүүрийн мэдээлэл', desc: 'Нэр, лого, cover', action: 'shop-info' },
      { icon: 'time-outline' as const, label: 'Ажлын цаг', desc: 'Нээх, хаах цаг', action: 'hours' },
      { icon: 'location-outline' as const, label: 'Хүргэлтийн бүс', desc: 'Дүүрэг, хороо тохируулах', action: 'zone' },
      { icon: 'card-outline' as const, label: 'Банкны данс', desc: 'Орлого авах данс', action: 'bank' },
    ],
  },
  {
    section: 'Борлуулалт',
    items: [
      { icon: 'pricetag-outline' as const, label: 'Комиссын тариф', desc: '5% стандарт', action: 'commission' },
      { icon: 'megaphone-outline' as const, label: 'Сурталчилгаа', desc: 'Бараа онцлох, VIP зар', action: 'promote' },
      { icon: 'people-outline' as const, label: 'Борлуулагч урих', desc: 'Affiliate линк', action: 'affiliate' },
    ],
  },
  {
    section: 'Тусламж',
    items: [
      { icon: 'help-circle-outline' as const, label: 'Тусламж', desc: 'FAQ, холбоо барих', action: 'help' },
      { icon: 'document-text-outline' as const, label: 'Нөхцөл', desc: 'Үйлчилгээний нөхцөл', action: 'terms' },
    ],
  },
];

export default function OwnerSettings() {
  const handleAction = (action: string) => {
    switch (action) {
      case 'help':
        Alert.alert('Холбоо барих', 'Имэйл: info@eseller.mn\nУтас: 7000-1234', [
          { text: 'Залгах', onPress: () => Linking.openURL('tel:70001234') },
          { text: 'Хаах' },
        ]);
        break;
      default:
        Alert.alert('Удахгүй', 'Энэ тохиргоо удахгүй нэмэгдэнэ');
    }
  };

  return (
    <ScrollView style={st.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      {MENU.map(section => (
        <View key={section.section}>
          <Text style={st.sectionTitle}>{section.section}</Text>
          <View style={st.card}>
            {section.items.map(item => (
              <TouchableOpacity key={item.label} style={st.item} onPress={() => handleAction(item.action)}>
                <View style={st.iconWrap}>
                  <Ionicons name={item.icon} size={20} color="#A0A0A0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.itemLabel}>{item.label}</Text>
                  <Text style={st.itemDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#3D3D3D" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Close shop */}
      <TouchableOpacity style={st.dangerBtn} onPress={() => Alert.alert('Анхааруулга', 'Дэлгүүр хаахад итгэлтэй байна уу?')}>
        <Ionicons name="close-circle-outline" size={18} color={BRAND} />
        <Text style={st.dangerText}>Дэлгүүр хаах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginTop: 16, marginBottom: 10 },

  card: { backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 0.5, borderColor: '#2A2A2A', overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#222', gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  itemLabel: { color: '#E0E0E0', fontSize: 14, fontWeight: '700' },
  itemDesc: { color: '#666', fontSize: 11, marginTop: 2 },

  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 32, padding: 14, backgroundColor: 'rgba(232,36,44,0.08)',
    borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(232,36,44,0.15)',
  },
  dangerText: { color: BRAND, fontWeight: '800', fontSize: 15 },
});
