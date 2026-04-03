import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function ConfirmDelivery() {
  const { id } = useLocalSearchParams();
  const [method, setMethod] = useState<'pin' | 'photo' | 'qr'>('pin');
  const [pin, setPin] = useState('');

  return (
    <View style={s.container}>
      <Text style={s.title}>Хүргэлт баталгаажуулах</Text>
      <Text style={s.sub}>ORD-{id}</Text>

      {/* Method tabs */}
      <View style={s.tabs}>
        {[{ key: 'pin' as const, label: '🔢 PIN код' }, { key: 'photo' as const, label: '📷 Зураг' }, { key: 'qr' as const, label: '📱 QR скан' }].map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setMethod(t.key)}
            style={[s.tab, method === t.key && s.tabActive]}>
            <Text style={[s.tabText, method === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {method === 'pin' && (
        <View style={s.content}>
          <Text style={s.label}>Хэрэглэгчийн PIN код оруулна уу</Text>
          <TextInput style={s.pinInput} value={pin} onChangeText={setPin} keyboardType="number-pad" maxLength={4}
            placeholder="0000" placeholderTextColor="#555" textAlign="center" />
          <TouchableOpacity style={[s.confirmBtn, !pin && { opacity: 0.5 }]}
            onPress={() => { if (pin.length === 4) router.back(); }} disabled={pin.length < 4}>
            <Text style={s.confirmText}>Баталгаажуулах</Text>
          </TouchableOpacity>
        </View>
      )}

      {method === 'photo' && (
        <View style={s.content}>
          <View style={s.cameraPlaceholder}><Text style={{ fontSize: 48 }}>📷</Text><Text style={s.cameraText}>Камер нээх</Text></View>
          <TouchableOpacity style={s.confirmBtn}><Text style={s.confirmText}>Зураг авч баталгаажуулах</Text></TouchableOpacity>
        </View>
      )}

      {method === 'qr' && (
        <View style={s.content}>
          <View style={s.cameraPlaceholder}><Text style={{ fontSize: 48 }}>📱</Text><Text style={s.cameraText}>QR код скан хийх</Text></View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 16 },
  title: { fontSize: 22, fontWeight: '900', color: '#FFF', textAlign: 'center', marginTop: 20 },
  sub: { fontSize: 13, color: '#555', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  tab: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#1A1A1A', alignItems: 'center', borderWidth: 0.5, borderColor: '#3D3D3D' },
  tabActive: { backgroundColor: '#E8242C', borderColor: '#E8242C' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#A0A0A0' },
  tabTextActive: { color: '#FFF' },
  content: { alignItems: 'center', gap: 20 },
  label: { fontSize: 14, color: '#E0E0E0', textAlign: 'center' },
  pinInput: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#3D3D3D', borderRadius: 14, width: 160, height: 60, fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 12 },
  confirmBtn: { backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  confirmText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  cameraPlaceholder: { width: '100%', height: 200, backgroundColor: '#1A1A1A', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#3D3D3D' },
  cameraText: { color: '#A0A0A0', fontSize: 13, marginTop: 8 },
});
