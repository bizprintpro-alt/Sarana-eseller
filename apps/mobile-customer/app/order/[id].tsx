import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const STEPS = [
  { key: 'pending', label: 'Захиалга өгсөн', icon: '🛒' },
  { key: 'confirmed', label: 'Баталгаажсан', icon: '✅' },
  { key: 'preparing', label: 'Бэлтгэж байна', icon: '👨‍🍳' },
  { key: 'delivering', label: 'Хүргэж байна', icon: '🚚' },
  { key: 'delivered', label: 'Хүргэгдсэн', icon: '📦' },
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const currentStep = 2; // demo: preparing

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>Захиалгын явц</Text>
      <Text style={s.orderId}>ORD-{id}</Text>

      <View style={s.timeline}>
        {STEPS.map((step, i) => {
          const done = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <View key={step.key} style={s.stepRow}>
              <View style={s.stepLeft}>
                <View style={[s.dot, done && s.dotDone, isCurrent && s.dotCurrent]}>
                  <Text style={{ fontSize: 14 }}>{step.icon}</Text>
                </View>
                {i < STEPS.length - 1 && <View style={[s.line, done && s.lineDone]} />}
              </View>
              <View style={s.stepRight}>
                <Text style={[s.stepLabel, done && s.stepLabelDone]}>{step.label}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={s.card}>
        <Text style={s.cardLabel}>Хүргэлтийн хугацаа</Text>
        <Text style={s.cardValue}>~25 мин</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  title: { fontSize: 20, fontWeight: '900', color: '#FFF', textAlign: 'center' },
  orderId: { fontSize: 13, color: '#555', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  timeline: { paddingLeft: 8 },
  stepRow: { flexDirection: 'row', minHeight: 64 },
  stepLeft: { width: 36, alignItems: 'center' },
  dot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3D3D3D' },
  dotDone: { backgroundColor: '#E8242C', borderColor: '#E8242C' },
  dotCurrent: { shadowColor: '#E8242C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8 },
  line: { width: 2, flex: 1, backgroundColor: '#3D3D3D', marginVertical: 4 },
  lineDone: { backgroundColor: '#E8242C' },
  stepRight: { flex: 1, paddingLeft: 12, paddingTop: 6 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
  stepLabelDone: { color: '#FFF' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginTop: 24, borderWidth: 0.5, borderColor: '#3D3D3D', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 13, color: '#A0A0A0' },
  cardValue: { fontSize: 16, fontWeight: '800', color: '#E8242C' },
});
