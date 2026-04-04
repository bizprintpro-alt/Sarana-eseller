import { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BRAND = '#E8242C';

const AD_CATEGORIES = [
  { key: 'apartment', label: 'Орон сууц', emoji: '🏠' },
  { key: 'auto', label: 'Авто', emoji: '🚗' },
  { key: 'electronics', label: 'Электроник', emoji: '📱' },
  { key: 'fashion', label: 'Хувцас', emoji: '👗' },
  { key: 'furniture', label: 'Тавилга', emoji: '🛋️' },
  { key: 'services', label: 'Үйлчилгээ', emoji: '🔧' },
  { key: 'kids', label: 'Хүүхэд', emoji: '🧸' },
  { key: 'sports', label: 'Спорт', emoji: '⚽' },
  { key: 'beauty', label: 'Гоо сайхан', emoji: '💄' },
  { key: 'other', label: 'Бусад', emoji: '📦' },
];

const DISTRICTS = ['СБД', 'ХУД', 'БЗД', 'ЧД', 'БГД', 'СХД', 'НД', 'БНД'];

const CONDITIONS = [
  { key: 'new', label: 'Шинэ' },
  { key: 'like_new', label: 'Бараг шинэ' },
  { key: 'used', label: 'Хэрэглэсэн' },
  { key: 'broken', label: 'Эвдэрсэн' },
];

export default function PostAdScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [condition, setCondition] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim() && price.trim() && category && district;

  const handleAddImage = () => {
    if (images.length >= 10) {
      Alert.alert('Дээд хэмжээ', 'Хамгийн ихдээ 10 зураг оруулах боломжтой');
      return;
    }
    // TODO: Image picker integration
    const placeholders = ['📸', '🖼️', '🏞️', '📷', '🎞️'];
    setImages([...images, placeholders[images.length % placeholders.length]]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert('Дутуу мэдээлэл', 'Гарчиг, үнэ, ангилал, дүүрэг заавал бөглөнө үү');
      return;
    }

    setSubmitting(true);
    // TODO: API call to POST /api/feed
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Амжилттай!',
        'Таны зар амжилттай илгээгдлээ. Админ шалгасны дараа нийтлэгдэнэ.',
        [{ text: 'Зүгээр', onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header info */}
        <View style={s.headerInfo}>
          <Ionicons name="megaphone" size={24} color={BRAND} />
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Зар оруулах</Text>
            <Text style={s.headerDesc}>Зурагтай зар илүү олон хүнд хүрнэ</Text>
          </View>
        </View>

        {/* ─── Images ─── */}
        <View style={s.section}>
          <Text style={s.label}>Зураг (10 хүртэл)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
            {/* Add button */}
            <TouchableOpacity style={s.addImageBtn} onPress={handleAddImage}>
              <Ionicons name="camera" size={28} color="#777" />
              <Text style={s.addImageText}>Зураг нэмэх</Text>
              <Text style={s.addImageCount}>{images.length}/10</Text>
            </TouchableOpacity>
            {/* Image previews */}
            {images.map((img, i) => (
              <View key={i} style={s.imagePreview}>
                <Text style={{ fontSize: 36 }}>{img}</Text>
                <TouchableOpacity style={s.removeImageBtn} onPress={() => removeImage(i)}>
                  <Ionicons name="close" size={14} color="#FFF" />
                </TouchableOpacity>
                {i === 0 && (
                  <View style={s.mainImageBadge}>
                    <Text style={s.mainImageText}>Нүүр</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ─── Title ─── */}
        <View style={s.section}>
          <Text style={s.label}>Гарчиг <Text style={s.required}>*</Text></Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Жишээ: iPhone 15 Pro, бараг шинэ"
            placeholderTextColor="#555"
            maxLength={100}
          />
          <Text style={s.charCount}>{title.length}/100</Text>
        </View>

        {/* ─── Category ─── */}
        <View style={s.section}>
          <Text style={s.label}>Ангилал <Text style={s.required}>*</Text></Text>
          <View style={s.catGrid}>
            {AD_CATEGORIES.map((c) => (
              <TouchableOpacity key={c.key}
                style={[s.catItem, category === c.key && s.catItemActive]}
                onPress={() => setCategory(c.key)}>
                <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
                <Text style={[s.catItemText, category === c.key && { color: '#FFF' }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Price ─── */}
        <View style={s.section}>
          <Text style={s.label}>Үнэ <Text style={s.required}>*</Text></Text>
          <View style={s.priceRow}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor="#555"
              keyboardType="numeric"
            />
            <View style={s.currencyBadge}>
              <Text style={s.currencyText}>₮</Text>
            </View>
          </View>
        </View>

        {/* ─── Condition ─── */}
        <View style={s.section}>
          <Text style={s.label}>Нөхцөл байдал</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {CONDITIONS.map((c) => (
              <TouchableOpacity key={c.key}
                style={[s.condPill, condition === c.key && s.condPillActive]}
                onPress={() => setCondition(condition === c.key ? '' : c.key)}>
                <Text style={[s.condText, condition === c.key && { color: '#FFF' }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── District ─── */}
        <View style={s.section}>
          <Text style={s.label}>Дүүрэг <Text style={s.required}>*</Text></Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {DISTRICTS.map((d) => (
              <TouchableOpacity key={d}
                style={[s.condPill, district === d && s.condPillActive]}
                onPress={() => setDistrict(d)}>
                <Text style={[s.condText, district === d && { color: '#FFF' }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Description ─── */}
        <View style={s.section}>
          <Text style={s.label}>Дэлгэрэнгүй тайлбар</Text>
          <TextInput
            style={[s.input, s.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Барааны нөхцөл, онцлог, тоо ширхэг гэх мэт..."
            placeholderTextColor="#555"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={s.charCount}>{description.length}/1000</Text>
        </View>

        {/* ─── Phone ─── */}
        <View style={s.section}>
          <Text style={s.label}>Холбоо барих утас</Text>
          <View style={s.phoneRow}>
            <View style={s.phonePrefix}>
              <Text style={s.phonePrefixText}>🇲🇳 +976</Text>
            </View>
            <TextInput
              style={[s.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="9911 2233"
              placeholderTextColor="#555"
              keyboardType="phone-pad"
              maxLength={8}
            />
          </View>
        </View>

        {/* ─── VIP Upgrade ─── */}
        <TouchableOpacity style={s.vipCard} activeOpacity={0.8}>
          <View style={s.vipLeft}>
            <Text style={{ fontSize: 24 }}>👑</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.vipTitle}>ВИП зар болгох</Text>
              <Text style={s.vipDesc}>Зарыг дээд талд байрлуулж, илүү олон хүнд харуулна</Text>
            </View>
          </View>
          <View style={s.vipPrice}>
            <Text style={s.vipPriceText}>5,000₮</Text>
            <Text style={s.vipPriceSub}>7 хоног</Text>
          </View>
        </TouchableOpacity>

        {/* ─── Rules ─── */}
        <View style={s.rulesCard}>
          <Ionicons name="information-circle" size={18} color="#3B82F6" />
          <View style={{ flex: 1 }}>
            <Text style={s.rulesTitle}>Зар оруулах дүрэм</Text>
            <Text style={s.rulesText}>• Хуурамч зар оруулахыг хориглоно</Text>
            <Text style={s.rulesText}>• Зураг бодит байх шаардлагатай</Text>
            <Text style={s.rulesText}>• Админ шалгасны дараа нийтлэгдэнэ</Text>
          </View>
        </View>
      </ScrollView>

      {/* ─── Submit Bar ─── */}
      <View style={s.submitBar}>
        <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
          <Text style={s.cancelText}>Болих</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting || !canSubmit}
        >
          {submitting ? (
            <Text style={s.submitText}>Илгээж байна...</Text>
          ) : (
            <>
              <Ionicons name="paper-plane" size={16} color="#FFF" />
              <Text style={s.submitText}>Зар оруулах</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Header
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: '#111111', borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  headerDesc: { fontSize: 12, color: '#777', marginTop: 2 },

  // Section
  section: { paddingHorizontal: 16, marginTop: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#E0E0E0', marginBottom: 10 },
  required: { color: BRAND },

  // Input
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 16, height: 48, color: '#FFF', fontSize: 15, borderWidth: 0.5, borderColor: '#3D3D3D' },
  textArea: { height: 120, paddingTop: 14, lineHeight: 22 },
  charCount: { fontSize: 11, color: '#555', textAlign: 'right', marginTop: 4 },

  // Images
  addImageBtn: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#3D3D3D', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addImageText: { fontSize: 11, color: '#777', fontWeight: '600' },
  addImageCount: { fontSize: 10, color: '#555' },
  imagePreview: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  removeImageBtn: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  mainImageBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: BRAND, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  mainImageText: { fontSize: 9, fontWeight: '700', color: '#FFF' },

  // Categories
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catItem: { width: '23%', alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#2A2A2A', gap: 4 },
  catItemActive: { backgroundColor: 'rgba(232,36,44,0.15)', borderColor: BRAND },
  catItemText: { fontSize: 11, fontWeight: '600', color: '#A0A0A0' },

  // Price
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  currencyBadge: { height: 48, paddingHorizontal: 16, backgroundColor: '#2A2A2A', borderTopRightRadius: 12, borderBottomRightRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#3D3D3D', borderLeftWidth: 0, marginLeft: -1 },
  currencyText: { fontSize: 18, fontWeight: '800', color: '#FFF' },

  // Condition / District pills
  condPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#3D3D3D' },
  condPillActive: { backgroundColor: BRAND, borderColor: BRAND },
  condText: { fontSize: 13, fontWeight: '600', color: '#A0A0A0' },

  // Phone
  phoneRow: { flexDirection: 'row' },
  phonePrefix: { height: 48, paddingHorizontal: 14, backgroundColor: '#2A2A2A', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#3D3D3D', borderRightWidth: 0 },
  phonePrefixText: { fontSize: 13, fontWeight: '600', color: '#A0A0A0' },

  // VIP Card
  vipCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 24, padding: 16, backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' },
  vipLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  vipTitle: { fontSize: 14, fontWeight: '800', color: '#FFD700' },
  vipDesc: { fontSize: 11, color: '#999', marginTop: 2 },
  vipPrice: { alignItems: 'center' },
  vipPriceText: { fontSize: 16, fontWeight: '900', color: '#FFD700' },
  vipPriceSub: { fontSize: 10, color: '#999' },

  // Rules
  rulesCard: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 16, padding: 14, backgroundColor: 'rgba(59,130,246,0.08)', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(59,130,246,0.2)' },
  rulesTitle: { fontSize: 13, fontWeight: '700', color: '#3B82F6', marginBottom: 4 },
  rulesText: { fontSize: 12, color: '#888', lineHeight: 18 },

  // Submit Bar
  submitBar: { flexDirection: 'row', padding: 16, paddingBottom: 28, gap: 10, borderTopWidth: 0.5, borderTopColor: '#2A2A2A', backgroundColor: '#111111' },
  cancelBtn: { paddingHorizontal: 20, height: 50, borderRadius: 12, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#A0A0A0', fontWeight: '700', fontSize: 15 },
  submitBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: BRAND, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
