import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddressAPI } from '../lib/api';

const BRAND = '#E8242C';

const DISTRICTS = [
  'Баянгол', 'Баянзүрх', 'Сүхбаатар', 'Чингэлтэй', 'Хан-Уул',
  'Сонгинохайрхан', 'Налайх', 'Багануур', 'Багахангай',
];

interface Address {
  id: string;
  name: string;
  phone: string;
  district: string;
  subdistrict: string;
  detail: string;
  isDefault: boolean;
}

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [detail, setDetail] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await AddressAPI.list();
      if (data?.addresses) setAddresses(data.addresses);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setName(''); setPhone(''); setDistrict(''); setSubdistrict(''); setDetail('');
    setIsDefault(false); setEditingId(null); setShowForm(false);
  };

  const openEdit = (a: Address) => {
    setName(a.name); setPhone(a.phone); setDistrict(a.district);
    setSubdistrict(a.subdistrict); setDetail(a.detail); setIsDefault(a.isDefault);
    setEditingId(a.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!name || !phone || !district || !detail) {
      Alert.alert('Алдаа', 'Бүх талбарыг бөглөнө үү');
      return;
    }
    try {
      const body = { name, phone, district, subdistrict, detail, isDefault };
      if (editingId) {
        await AddressAPI.update(editingId, body);
      } else {
        await AddressAPI.create(body);
      }
      resetForm();
      load();
    } catch (err: any) {
      Alert.alert('Алдаа', err.message || 'Хадгалахад алдаа');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Устгах', 'Энэ хаягийг устгах уу?', [
      { text: 'Болих' },
      { text: 'Устгах', style: 'destructive', onPress: async () => {
        try {
          await AddressAPI.delete(id);
          load();
        } catch {}
      }},
    ]);
  };

  if (loading) {
    return <View style={st.center}><ActivityIndicator color={BRAND} size="large" /></View>;
  }

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={BRAND} />}
    >
      {/* Header */}
      <View style={st.header}>
        <Text style={st.title}>Хүргэлтийн хаяг</Text>
        <TouchableOpacity style={st.addBtn} onPress={() => { resetForm(); setShowForm(true); }}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={st.addText}>Нэмэх</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      {showForm && (
        <View style={st.formCard}>
          <Text style={st.formTitle}>{editingId ? 'Хаяг засах' : 'Шинэ хаяг'}</Text>

          <TextInput style={st.input} placeholder="Хүлээн авагчийн нэр" placeholderTextColor="#666"
            value={name} onChangeText={setName} />
          <TextInput style={st.input} placeholder="Утасны дугаар" placeholderTextColor="#666"
            value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          {/* District picker */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {DISTRICTS.map(d => (
              <TouchableOpacity key={d} style={[st.chip, district === d && st.chipActive]}
                onPress={() => setDistrict(d)}>
                <Text style={[st.chipText, district === d && st.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput style={st.input} placeholder="Хороо (жишээ: 3-р хороо)" placeholderTextColor="#666"
            value={subdistrict} onChangeText={setSubdistrict} />
          <TextInput style={[st.input, { height: 70, textAlignVertical: 'top' }]}
            placeholder="Дэлгэрэнгүй хаяг (байр, орц, давхар, тоот)" placeholderTextColor="#666"
            value={detail} onChangeText={setDetail} multiline />

          {/* Default toggle */}
          <TouchableOpacity style={st.defaultRow} onPress={() => setIsDefault(!isDefault)}>
            <Ionicons name={isDefault ? 'checkbox' : 'square-outline'} size={22} color={isDefault ? BRAND : '#666'} />
            <Text style={st.defaultText}>Үндсэн хаяг болгох</Text>
          </TouchableOpacity>

          <View style={st.formActions}>
            <TouchableOpacity style={st.cancelBtn} onPress={resetForm}>
              <Text style={st.cancelText}>Болих</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.saveBtn} onPress={handleSave}>
              <Text style={st.saveText}>Хадгалах</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Address list */}
      {addresses.length === 0 && !showForm ? (
        <View style={st.empty}>
          <Ionicons name="location-outline" size={48} color="#333" />
          <Text style={st.emptyText}>Хаяг бүртгэгдээгүй байна</Text>
        </View>
      ) : (
        addresses.map(a => (
          <View key={a.id} style={[st.card, a.isDefault && st.cardDefault]}>
            <View style={st.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Ionicons name="location" size={18} color={a.isDefault ? BRAND : '#999'} />
                <Text style={st.cardName}>{a.name}</Text>
                {a.isDefault && (
                  <View style={st.defaultBadge}>
                    <Text style={st.defaultBadgeText}>Үндсэн</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => openEdit(a)}>
                  <Ionicons name="create-outline" size={18} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(a.id)}>
                  <Ionicons name="trash-outline" size={18} color={BRAND} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={st.cardPhone}>{a.phone}</Text>
            <Text style={st.cardAddr}>{a.district}, {a.subdistrict}</Text>
            <Text style={st.cardDetail}>{a.detail}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: BRAND, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  formCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#2A2A2A' },
  formTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 14 },
  input: { backgroundColor: '#2A2A2A', borderRadius: 10, padding: 12, color: '#FFF', fontSize: 14, marginBottom: 10 },
  chip: { backgroundColor: '#2A2A2A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8 },
  chipActive: { backgroundColor: BRAND },
  chipText: { color: '#999', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 14 },
  defaultText: { color: '#CCC', fontSize: 13 },
  formActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: '#2A2A2A', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: '#CCC', fontSize: 14, fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: BRAND, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#666', fontSize: 14, marginTop: 12 },

  card: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#2A2A2A' },
  cardDefault: { borderColor: BRAND + '44' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardName: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  defaultBadge: { backgroundColor: BRAND + '22', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  defaultBadgeText: { color: BRAND, fontSize: 9, fontWeight: '800' },
  cardPhone: { color: '#BBB', fontSize: 13, marginBottom: 4 },
  cardAddr: { color: '#999', fontSize: 12 },
  cardDetail: { color: '#777', fontSize: 12, marginTop: 2 },
});
