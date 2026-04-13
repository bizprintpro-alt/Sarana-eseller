import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export default function DriverProfile() {
  const [notifNew, setNotifNew] = useState(true);
  const { logout, user } = useAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A0A0A' }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      {/* Avatar + Stats */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={{ fontSize: 36 }}>🚚</Text>
        </View>
        <Text style={s.name}>{user?.name || 'Жолооч'}</Text>
        <Text style={s.sub}>Онлайн · 4.9 ★</Text>
      </View>

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statVal}>312</Text>
          <Text style={s.statLabel}>Хүргэлт</Text>
        </View>
        <View style={[s.stat, s.statBorder]}>
          <Text style={s.statVal}>4.9</Text>
          <Text style={s.statLabel}>Үнэлгээ</Text>
        </View>
        <View style={[s.stat, s.statBorder]}>
          <Text style={s.statVal}>98%</Text>
          <Text style={s.statLabel}>Ирц</Text>
        </View>
      </View>

      {/* Vehicle info */}
      <Text style={s.section}>Тээврийн хэрэгсэл</Text>
      <View style={s.infoCard}>
        {[
          { icon: 'car-outline' as const, label: 'Төрөл', value: 'Суудлын' },
          { icon: 'document-text-outline' as const, label: 'Улсын дугаар', value: 'УБ 1234' },
        ].map((item) => (
          <View key={item.label} style={s.infoRow}>
            <Ionicons name={item.icon} size={18} color="#999" />
            <Text style={s.infoLabel}>{item.label}</Text>
            <Text style={s.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Documents */}
      <Text style={s.section}>Баримт бичиг</Text>
      <View style={s.infoCard}>
        {[
          { label: 'Иргэний үнэмлэх', status: 'verified' },
          { label: 'Жолооны үнэмлэх', status: 'verified' },
          { label: 'Даатгал', status: 'pending' },
        ].map((doc) => (
          <View key={doc.label} style={s.infoRow}>
            <Ionicons name={doc.status === 'verified' ? 'checkmark-circle' : 'time'} size={18}
              color={doc.status === 'verified' ? '#22C55E' : '#F59E0B'} />
            <Text style={[s.infoLabel, { flex: 1 }]}>{doc.label}</Text>
            <Text style={{ color: doc.status === 'verified' ? '#22C55E' : '#F59E0B', fontSize: 11, fontWeight: '600' }}>
              {doc.status === 'verified' ? 'Баталгаажсан' : 'Хүлээгдэж буй'}
            </Text>
          </View>
        ))}
      </View>

      {/* Notifications */}
      <Text style={s.section}>Мэдэгдэл</Text>
      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.switchLabel}>Шинэ хүргэлт</Text>
          <Text style={s.switchDesc}>Хүргэлт ирэхэд дуут мэдэгдэл</Text>
        </View>
        <Switch value={notifNew} onValueChange={setNotifNew} trackColor={{ true: '#F59E0B', false: '#333' }} thumbColor="#FFF" />
      </View>

      {/* Menu */}
      <Text style={s.section}>Бусад</Text>
      {[
        { icon: '⚙️', label: 'Тохиргоо' },
        { icon: '📞', label: 'Холбоо барих' },
        { icon: '❓', label: 'Тусламж' },
      ].map((m) => (
        <TouchableOpacity key={m.label} style={s.menuItem}>
          <Text style={{ fontSize: 16 }}>{m.icon}</Text>
          <Text style={s.menuText}>{m.label}</Text>
          <Text style={{ color: '#3D3D3D' }}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={() => {
        Alert.alert('Гарах', 'Гарах уу?', [
          { text: 'Болих', style: 'cancel' },
          { text: 'Гарах', style: 'destructive', onPress: logout },
        ]);
      }}>
        <Ionicons name="log-out-outline" size={18} color="#E8242C" />
        <Text style={s.logoutText}>Гарах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  sub: { fontSize: 13, color: '#22C55E', marginTop: 2, fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 12, marginBottom: 20, borderWidth: 0.5, borderColor: '#3D3D3D' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder: { borderLeftWidth: 0.5, borderLeftColor: '#2A2A2A' },
  statVal: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  statLabel: { fontSize: 10, color: '#A0A0A0', marginTop: 2 },
  section: { color: '#FFF', fontSize: 15, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  infoCard: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 4, borderWidth: 0.5, borderColor: '#3D3D3D' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  infoLabel: { color: '#999', fontSize: 13 },
  infoValue: { color: '#FFF', fontSize: 13, fontWeight: '600', marginLeft: 'auto' },
  switchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  switchLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  switchDesc: { color: '#666', fontSize: 11, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 6, borderWidth: 0.5, borderColor: '#3D3D3D' },
  menuText: { fontSize: 14, fontWeight: '600', color: '#E0E0E0', flex: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, marginTop: 16, backgroundColor: '#E8242C11', borderRadius: 12 },
  logoutText: { color: '#E8242C', fontSize: 15, fontWeight: '700' },
});
