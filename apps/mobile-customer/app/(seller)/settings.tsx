import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SellerSettings() {
  const [name, setName] = useState('Миний дэлгүүр');
  const [phone, setPhone] = useState('99112233');
  const [address, setAddress] = useState('БЗД, 3-р хороо, Энхтайваны өргөн чөлөө 15');
  const [hours, setHours] = useState('09:00 - 21:00');

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={s.section}>Дэлгүүрийн мэдээлэл</Text>

      <View style={s.field}>
        <Text style={s.label}>Нэр</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#666"
        />
      </View>

      <View style={s.field}>
        <Text style={s.label}>Утасны дугаар</Text>
        <TextInput
          style={s.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#666"
        />
      </View>

      <View style={s.field}>
        <Text style={s.label}>Хаяг</Text>
        <TextInput
          style={[s.input, { height: 72, textAlignVertical: 'top' }]}
          value={address}
          onChangeText={setAddress}
          multiline
          placeholderTextColor="#666"
        />
      </View>

      <View style={s.field}>
        <Text style={s.label}>Ажиллах цаг</Text>
        <TextInput
          style={s.input}
          value={hours}
          onChangeText={setHours}
          placeholderTextColor="#666"
        />
      </View>

      <TouchableOpacity style={s.saveBtn} activeOpacity={0.8}>
        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
        <Text style={s.saveBtnText}>Хадгалах</Text>
      </TouchableOpacity>

      <Text style={[s.section, { marginTop: 32 }]}>Бусад</Text>

      <TouchableOpacity style={s.menuItem} activeOpacity={0.7}>
        <Ionicons name="notifications-outline" size={20} color="#CCC" />
        <Text style={s.menuText}>Мэдэгдэл тохируулах</Text>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={s.menuItem} activeOpacity={0.7}>
        <Ionicons name="card-outline" size={20} color="#CCC" />
        <Text style={s.menuText}>Төлбөрийн мэдээлэл</Text>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={s.menuItem} activeOpacity={0.7}>
        <Ionicons name="help-circle-outline" size={20} color="#CCC" />
        <Text style={s.menuText}>Тусламж</Text>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  section: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  field: { marginBottom: 14 },
  label: { color: '#999', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#FFF',
    fontSize: 15,
    padding: 14,
  },
  saveBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  menuItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 12,
  },
  menuText: { color: '#CCC', fontSize: 14, fontWeight: '600', flex: 1 },
});
