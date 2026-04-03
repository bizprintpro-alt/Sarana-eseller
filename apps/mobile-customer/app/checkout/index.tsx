import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

export default function CheckoutScreen() {
  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Delivery info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📍 Хүргэлтийн мэдээлэл</Text>
          <TextInput style={s.input} placeholder="Утасны дугаар" placeholderTextColor="#555" keyboardType="phone-pad" />
          <TextInput style={s.input} placeholder="Хаяг" placeholderTextColor="#555" />
          <TextInput style={s.input} placeholder="Нэмэлт тэмдэглэл" placeholderTextColor="#555" />
        </View>

        {/* Payment method */}
        <View style={s.card}>
          <Text style={s.cardTitle}>💳 Төлбөрийн хэлбэр</Text>
          {['QPay', 'Картаар', 'Бэлнээр'].map((m) => (
            <TouchableOpacity key={m} style={s.payOption} activeOpacity={0.7}>
              <Text style={s.payText}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <View style={s.card}>
          <View style={s.sumRow}><Text style={s.sumLabel}>Дүн</Text><Text style={s.sumValue}>69,000₮</Text></View>
          <View style={s.sumRow}><Text style={s.sumLabel}>Хүргэлт</Text><Text style={[s.sumValue, { color: '#22C55E' }]}>Үнэгүй</Text></View>
          <View style={[s.sumRow, { borderTopWidth: 0.5, borderTopColor: '#2A2A2A', paddingTop: 10, marginTop: 6 }]}>
            <Text style={[s.sumLabel, { color: '#FFF', fontWeight: '800' }]}>Нийт</Text>
            <Text style={[s.sumValue, { fontSize: 18 }]}>69,000₮</Text>
          </View>
        </View>
      </ScrollView>

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.payBtn} activeOpacity={0.8}>
          <Text style={s.payBtnText}>Захиалга баталгаажуулах — 69,000₮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#3D3D3D', gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  input: { backgroundColor: '#2A2A2A', borderRadius: 10, paddingHorizontal: 14, height: 44, color: '#FFF', fontSize: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  payOption: { backgroundColor: '#2A2A2A', borderRadius: 10, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  payText: { fontSize: 14, fontWeight: '600', color: '#E0E0E0' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sumLabel: { fontSize: 13, color: '#A0A0A0' },
  sumValue: { fontSize: 14, fontWeight: '800', color: '#E8242C' },
  bottomBar: { padding: 16, borderTopWidth: 0.5, borderTopColor: '#2A2A2A', backgroundColor: '#111111' },
  payBtn: { backgroundColor: '#E8242C', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
