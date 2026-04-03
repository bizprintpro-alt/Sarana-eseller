import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const RECENT = ['Чихэвч', 'Цамц', 'Гутал', 'Крем'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  return (
    <View style={s.container}>
      <View style={s.searchWrap}>
        <TextInput style={s.input} value={query} onChangeText={setQuery}
          placeholder="Бараа, дэлгүүр хайх..." placeholderTextColor="#555" autoFocus />
      </View>
      {!query && (
        <View style={s.recent}>
          <Text style={s.recentTitle}>Сүүлд хайсан</Text>
          {RECENT.map((r) => (
            <TouchableOpacity key={r} onPress={() => setQuery(r)} style={s.recentItem}>
              <Text style={s.recentText}>🔍 {r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  searchWrap: { padding: 16, backgroundColor: '#111111' },
  input: { backgroundColor: '#2A2A2A', borderRadius: 10, paddingHorizontal: 16, height: 44, color: '#FFF', fontSize: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  recent: { padding: 16 },
  recentTitle: { fontSize: 14, fontWeight: '700', color: '#FFF', marginBottom: 12 },
  recentItem: { paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  recentText: { fontSize: 14, color: '#A0A0A0' },
});
