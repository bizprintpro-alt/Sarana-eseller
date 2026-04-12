import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function SellerSettings() {
  const [name, setName] = useState('Миний дэлгүүр');
  const [phone, setPhone] = useState('99112233');
  const [address, setAddress] = useState('БЗД, 3-р хороо');
  const [hours, setHours] = useState('09:00 - 21:00');
  const [notifOrders, setNotifOrders] = useState(true);
  const [notifPayout, setNotifPayout] = useState(true);
  const { logout } = useAuth();

  const handleSave = () => {
    Alert.alert('Амжилттай', 'Мэдээлэл хадгалагдлаа');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      {/* Store Info */}
      <Text style={s.section}>Дэлгүүрийн мэдээлэл</Text>

      <View style={s.field}>
        <Text style={s.label}>Нэр</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholderTextColor="#666" />
      </View>

      <View style={s.field}>
        <Text style={s.label}>Утасны дугаар</Text>
        <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#666" />
      </View>

      <View style={s.field}>
        <Text style={s.label}>Хаяг</Text>
        <TextInput style={[s.input, { height: 72, textAlignVertical: 'top' }]} value={address}
          onChangeText={setAddress} multiline placeholderTextColor="#666" />
      </View>

      <View style={s.field}>
        <Text style={s.label}>Ажиллах цаг</Text>
        <TextInput style={s.input} value={hours} onChangeText={setHours} placeholderTextColor="#666" />
      </View>

      <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
        <Text style={s.saveBtnText}>Хадгалах</Text>
      </TouchableOpacity>

      {/* Notifications */}
      <Text style={[s.section, { marginTop: 28 }]}>Мэдэгдэл</Text>

      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.switchLabel}>Шинэ захиалга</Text>
          <Text style={s.switchDesc}>Захиалга ирэхэд дуут мэдэгдэл</Text>
        </View>
        <Switch value={notifOrders} onValueChange={setNotifOrders} trackColor={{ true: '#22C55E', false: '#333' }} thumbColor="#FFF" />
      </View>

      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.switchLabel}>Payout мэдэгдэл</Text>
          <Text style={s.switchDesc}>Банк шилжүүлэг амжилттай</Text>
        </View>
        <Switch value={notifPayout} onValueChange={setNotifPayout} trackColor={{ true: '#22C55E', false: '#333' }} thumbColor="#FFF" />
      </View>

      {/* Menu items */}
      <Text style={[s.section, { marginTop: 28 }]}>Удирдлага</Text>

      {[
        { icon: 'chatbubbles-outline' as const, label: 'Чат', desc: 'Хэрэглэгчдийн мессеж', action: '/(seller)/chat' },
        { icon: 'card-outline' as const, label: 'Төлбөрийн мэдээлэл', desc: 'Банкны данс', action: '' },
        { icon: 'time-outline' as const, label: 'Ажиллах цаг', desc: '7 өдрийн тохиргоо', action: '' },
        { icon: 'diamond-outline' as const, label: 'Багц (план)', desc: 'Одоогийн: Үнэгүй', action: '' },
      ].map((item) => (
        <TouchableOpacity key={item.label} style={s.menuItem} activeOpacity={0.7}
          onPress={() => item.action ? router.push(item.action as any) : Alert.alert(item.label, 'Удахгүй нэмэгдэнэ')}>
          <Ionicons name={item.icon} size={20} color="#CCC" />
          <View style={{ flex: 1 }}>
            <Text style={s.menuText}>{item.label}</Text>
            <Text style={s.menuDesc}>{item.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>
      ))}

      {/* Advanced */}
      <Text style={[s.section, { marginTop: 28 }]}>Нэмэлт</Text>

      {[
        { icon: 'color-wand-outline' as const, label: 'AI Дэлгүүр засварлагч', color: '#EC4899' },
        { icon: 'wallet-outline' as const, label: 'Хэтэвч', color: '#F59E0B' },
        { icon: 'link-outline' as const, label: 'Интеграц', color: '#3B82F6' },
        { icon: 'help-circle-outline' as const, label: 'Тусламж', color: '#999' },
      ].map((item) => (
        <TouchableOpacity key={item.label} style={s.menuItem} activeOpacity={0.7}>
          <Ionicons name={item.icon} size={20} color={item.color} />
          <Text style={[s.menuText, { flex: 1 }]}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={() => {
        Alert.alert('Гарах', 'Гарах уу?', [
          { text: 'Болих', style: 'cancel' },
          { text: 'Гарах', style: 'destructive', onPress: logout },
        ]);
      }}>
        <Ionicons name="log-out-outline" size={20} color="#E8242C" />
        <Text style={s.logoutText}>Гарах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  section: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  field: { marginBottom: 14 },
  label: { color: '#999', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', color: '#FFF', fontSize: 15, padding: 14 },
  saveBtn: { backgroundColor: '#22C55E', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  switchLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  switchDesc: { color: '#666', fontSize: 11, marginTop: 2 },
  menuItem: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A', gap: 12 },
  menuText: { color: '#CCC', fontSize: 14, fontWeight: '600' },
  menuDesc: { color: '#666', fontSize: 11, marginTop: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, marginTop: 20, backgroundColor: '#E8242C11', borderRadius: 12 },
  logoutText: { color: '#E8242C', fontSize: 15, fontWeight: '700' },
});
