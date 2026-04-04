import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BRAND = '#E8242C';

const CATEGORIES = [
  {
    key: 'fashion',
    label: 'Хувцас & Гутал',
    icon: 'shirt' as const,
    color: '#EC4899',
    subs: ['Эрэгтэй хувцас', 'Эмэгтэй хувцас', 'Хүүхдийн хувцас', 'Гутал', 'Цүнх & Аксессуар', 'Спорт хувцас'],
  },
  {
    key: 'electronics',
    label: 'Электроник',
    icon: 'laptop' as const,
    color: '#6366F1',
    subs: ['Гар утас', 'Компьютер & Laptop', 'Чихэвч & Чанга яригч', 'Камер', 'Тоглоом', 'Дагалдах хэрэгсэл'],
  },
  {
    key: 'food',
    label: 'Хоол & Ундаа',
    icon: 'restaurant' as const,
    color: '#F59E0B',
    subs: ['Ресторан', 'Кафе & Цай', 'Хүнсний бүтээгдэхүүн', 'Амттан & Бялуу', 'Ундаа', 'Эрүүл хоол'],
  },
  {
    key: 'beauty',
    label: 'Гоо сайхан',
    icon: 'sparkles' as const,
    color: '#EC4899',
    subs: ['Арьс арчилгаа', 'Нүүр будалт', 'Үсний арчилгаа', 'Сүрчиг', 'Хумсны арчилгаа', 'Биеийн арчилгаа'],
  },
  {
    key: 'home',
    label: 'Гэр ахуй',
    icon: 'home' as const,
    color: '#10B981',
    subs: ['Тавилга', 'Гал тогоо', 'Унтлагын өрөө', 'Гэрэлтүүлэг', 'Чимэглэл', 'Цэвэрлэгээ'],
  },
  {
    key: 'sports',
    label: 'Спорт & Амралт',
    icon: 'football' as const,
    color: '#3B82F6',
    subs: ['Фитнес', 'Гадаа спорт', 'Аялал', 'Дугуй', 'Загас агнуур', 'Йога & Медитейшн'],
  },
  {
    key: 'kids',
    label: 'Хүүхэд & Нялхас',
    icon: 'happy' as const,
    color: '#F97316',
    subs: ['Тоглоом', 'Хүүхдийн хувцас', 'Сургалтын хэрэгсэл', 'Нялхсын хэрэгсэл', 'Хүүхдийн ном', 'Хүүхдийн тавилга'],
  },
  {
    key: 'services',
    label: 'Үйлчилгээ',
    icon: 'construct' as const,
    color: '#8B5CF6',
    subs: ['Үсчин & Гоо сайхан', 'Гэрийн засвар', 'Хэвлэх үйлчилгээ', 'Машин угаалга', 'Цэвэрлэгээ', 'Зөөвөрлөлт'],
  },
  {
    key: 'auto',
    label: 'Авто',
    icon: 'car-sport' as const,
    color: '#EF4444',
    subs: ['Автомашин', 'Сэлбэг', 'Аксессуар', 'Дугуй', 'Тос & Шингэн', 'Засвар үйлчилгээ'],
  },
  {
    key: 'health',
    label: 'Эрүүл мэнд',
    icon: 'medkit' as const,
    color: '#14B8A6',
    subs: ['Витамин & БАН', 'Эмийн сан', 'Эмнэлгийн хэрэгсэл', 'Маск & Хамгаалалт', 'Масааж', 'Шүдний арчилгаа'],
  },
];

export default function CategoryScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  return (
    <View style={s.container}>
      {/* Top banner */}
      <View style={s.topBanner}>
        <Ionicons name="grid" size={20} color={BRAND} />
        <Text style={s.topBannerText}>Бүх ангилал</Text>
        <Text style={s.topBannerCount}>{CATEGORIES.length} ангилал · {CATEGORIES.reduce((a, c) => a + c.subs.length, 0)} дэд ангилал</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {CATEGORIES.map((cat) => {
          const isOpen = expanded === cat.key;
          return (
            <View key={cat.key}>
              {/* Category header */}
              <TouchableOpacity
                style={[s.catHeader, isOpen && s.catHeaderActive]}
                activeOpacity={0.7}
                onPress={() => toggle(cat.key)}
              >
                <View style={[s.catIcon, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons name={cat.icon} size={22} color={cat.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.catLabel}>{cat.label}</Text>
                  <Text style={s.catCount}>{cat.subs.length} дэд ангилал</Text>
                </View>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={isOpen ? BRAND : '#555'}
                />
              </TouchableOpacity>

              {/* Subcategories */}
              {isOpen && (
                <View style={s.subsContainer}>
                  {/* "Бүгдийг харах" row */}
                  <TouchableOpacity style={s.subItemAll}>
                    <Ionicons name="apps" size={16} color={BRAND} />
                    <Text style={s.subItemAllText}>Бүх {cat.label}</Text>
                    <Ionicons name="arrow-forward" size={14} color={BRAND} />
                  </TouchableOpacity>
                  {cat.subs.map((sub, i) => (
                    <TouchableOpacity key={sub} style={[s.subItem, i < cat.subs.length - 1 && s.subBorder]}>
                      <View style={s.subDot} />
                      <Text style={s.subText}>{sub}</Text>
                      <Ionicons name="chevron-forward" size={14} color="#3D3D3D" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Top banner
  topBanner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#111111', borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A', gap: 10 },
  topBannerText: { fontSize: 16, fontWeight: '800', color: '#FFF', flex: 1 },
  topBannerCount: { fontSize: 11, color: '#777' },

  // Category header
  catHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A' },
  catHeaderActive: { backgroundColor: '#111111' },
  catIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  catCount: { fontSize: 11, color: '#777', marginTop: 2 },

  // Subcategories
  subsContainer: { backgroundColor: '#111111', paddingLeft: 16 },
  subItemAll: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingRight: 16, marginLeft: 58, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  subItemAllText: { flex: 1, fontSize: 14, fontWeight: '700', color: BRAND },
  subItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, paddingRight: 16, marginLeft: 58 },
  subBorder: { borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A' },
  subDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#3D3D3D' },
  subText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#D0D0D0' },
});
