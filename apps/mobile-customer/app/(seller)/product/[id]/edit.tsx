import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProductsAPI, SellerAPI } from '../../../lib/api';

const CATEGORIES = [
  'Хувцас', 'Электроник', 'Хоол', 'Гоо сайхан', 'Гэр ахуй',
  'Спорт', 'Хүүхдийн', 'Үйлчилгээ', 'Авто', 'Бусад',
];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const p = await ProductsAPI.get(id!);
      setName(p.name || '');
      setDescription(p.description || '');
      setPrice(String(p.price || ''));
      setSalePrice(p.salePrice ? String(p.salePrice) : '');
      setCategory(p.category || '');
      setStock(String(p.stock ?? 0));
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name || !price) { Alert.alert('Алдаа', 'Нэр, үнэ заавал бөглөнө үү'); return; }
    setSaving(true);
    try {
      await SellerAPI.updateProduct(id!, {
        name, description,
        price: parseInt(price),
        salePrice: salePrice ? parseInt(salePrice) : null,
        category,
        stock: stock ? parseInt(stock) : 0,
      });
      Alert.alert('Амжилттай', 'Бараа шинэчлэгдлээ');
      router.back();
    } catch (err: any) {
      Alert.alert('Алдаа', err.message || 'Шинэчлэхэд алдаа гарлаа');
    }
    setSaving(false);
  };

  const handleDelete = () => {
    Alert.alert('Устгах', 'Энэ барааг устгах уу?', [
      { text: 'Болих', style: 'cancel' },
      { text: 'Устгах', style: 'destructive', onPress: async () => {
        try {
          await SellerAPI.updateProduct(id!, { isActive: false });
          router.back();
        } catch {}
      }},
    ]);
  };

  if (loading) {
    return <View style={s.container}><Text style={{ color: '#555', textAlign: 'center', marginTop: 40 }}>Ачааллаж байна...</Text></View>;
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <Text style={s.title}>Бараа засварлах</Text>

      <Text style={s.label}>Нэр *</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Барааны нэр" placeholderTextColor="#555" />

      <Text style={s.label}>Тайлбар</Text>
      <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={description}
        onChangeText={setDescription} placeholder="Барааны тайлбар" placeholderTextColor="#555" multiline />

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

      <Text style={s.label}>Ангилал</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} style={[s.catChip, category === c && s.catActive]} onPress={() => setCategory(c)}>
            <Text style={[s.catText, category === c && { color: '#22C55E' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s.label}>Нөөц (тоо ширхэг)</Text>
      <TextInput style={s.input} value={stock} onChangeText={setStock} placeholder="0" placeholderTextColor="#555" keyboardType="number-pad" />

      <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
        <Text style={s.saveBtnText}>{saving ? 'Хадгалж байна...' : 'Хадгалах'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={18} color="#E8242C" />
        <Text style={s.deleteBtnText}>Бараа устгах</Text>
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
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1A1A1A', marginRight: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  catActive: { borderColor: '#22C55E', backgroundColor: '#22C55E11' },
  catText: { color: '#999', fontSize: 12, fontWeight: '600' },
  saveBtn: { backgroundColor: '#22C55E', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 16, marginTop: 12 },
  deleteBtnText: { color: '#E8242C', fontSize: 14, fontWeight: '700' },
});
