import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SellerAPI } from '../../lib/api';

const CATEGORIES = [
  'Хувцас', 'Электроник', 'Хоол', 'Гоо сайхан', 'Гэр ахуй',
  'Спорт', 'Хүүхдийн', 'Үйлчилгээ', 'Авто', 'Бусад',
];

export default function NewProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !price) { Alert.alert('Алдаа', 'Нэр, үнэ заавал бөглөнө үү'); return; }
    setSaving(true);
    try {
      await SellerAPI.createProduct({
        name,
        description,
        price: parseInt(price),
        salePrice: salePrice ? parseInt(salePrice) : undefined,
        category,
        stock: stock ? parseInt(stock) : 0,
        images,
      });
      Alert.alert('Амжилттай', 'Бараа нэмэгдлээ');
      router.back();
    } catch (err: any) {
      Alert.alert('Алдаа', err.message || 'Бараа нэмэхэд алдаа гарлаа');
    }
    setSaving(false);
  };

  const pickImage = async () => {
    // TODO: expo-image-picker integration
    Alert.alert('Зураг', 'Image picker удахгүй нэмэгдэнэ');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <Text style={s.title}>Шинэ бараа нэмэх</Text>

      {/* Images */}
      <Text style={s.label}>Зураг (5 хүртэл)</Text>
      <ScrollView horizontal style={{ marginBottom: 16 }} showsHorizontalScrollIndicator={false}>
        {images.map((uri, i) => (
          <Image key={i} source={{ uri }} style={s.imageThumb} />
        ))}
        <TouchableOpacity style={s.addImageBtn} onPress={pickImage}>
          <Ionicons name="camera-outline" size={28} color="#666" />
          <Text style={{ color: '#666', fontSize: 10, marginTop: 4 }}>Зураг</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Name */}
      <Text style={s.label}>Нэр *</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Барааны нэр" placeholderTextColor="#555" />

      {/* Description */}
      <Text style={s.label}>Тайлбар</Text>
      <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={description}
        onChangeText={setDescription} placeholder="Барааны тайлбар" placeholderTextColor="#555" multiline />

      {/* Price */}
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Үнэ (₮) *</Text>
          <TextInput style={s.input} value={price} onChangeText={setPrice} placeholder="0" placeholderTextColor="#555" keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Хямдралт үнэ (₮)</Text>
          <TextInput style={s.input} value={salePrice} onChangeText={setSalePrice} placeholder="Хоосон" placeholderTextColor="#555" keyboardType="number-pad" />
        </View>
      </View>

      {/* Category */}
      <Text style={s.label}>Ангилал</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} style={[s.catChip, category === c && s.catActive]} onPress={() => setCategory(c)}>
            <Text style={[s.catText, category === c && { color: '#22C55E' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stock */}
      <Text style={s.label}>Нөөц (тоо ширхэг)</Text>
      <TextInput style={s.input} value={stock} onChangeText={setStock} placeholder="0" placeholderTextColor="#555" keyboardType="number-pad" />

      {/* Save button */}
      <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
        <Text style={s.saveBtnText}>{saving ? 'Хадгалж байна...' : 'Бараа нэмэх'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  title: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 20 },
  label: { color: '#999', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 12, padding: 14, color: '#FFF', fontSize: 14 },
  row: { flexDirection: 'row', gap: 10 },
  imageThumb: { width: 72, height: 72, borderRadius: 10, marginRight: 8 },
  addImageBtn: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#3D3D3D', alignItems: 'center', justifyContent: 'center' },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1A1A1A', marginRight: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  catActive: { borderColor: '#22C55E', backgroundColor: '#22C55E11' },
  catText: { color: '#999', fontSize: 12, fontWeight: '600' },
  saveBtn: { backgroundColor: '#22C55E', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
