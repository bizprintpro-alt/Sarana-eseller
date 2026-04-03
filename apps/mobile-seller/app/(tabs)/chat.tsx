import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const THREADS = [
  { id: '1', name: 'Б. Мөнхбат', lastMsg: 'За баярлалаа', time: '2 мин', unread: 0 },
  { id: '2', name: 'О. Сараа', lastMsg: 'Хэзээ хүргэх вэ?', time: '15 мин', unread: 2 },
  { id: '3', name: 'Д. Ганбат', lastMsg: 'XL хэмжээ байна уу?', time: '1 цаг', unread: 1 },
];

export default function SellerChat() {
  return (
    <FlatList data={THREADS} keyExtractor={(i) => i.id} style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      contentContainerStyle={{ gap: 1 }}
      renderItem={({ item }) => (
        <TouchableOpacity style={s.thread} activeOpacity={0.7}>
          <View style={s.avatar}><Text style={{ fontSize: 18 }}>👤</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{item.name}</Text>
            <Text style={s.msg} numberOfLines={1}>{item.lastMsg}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.time}>{item.time}</Text>
            {item.unread > 0 && <View style={s.unread}><Text style={s.unreadText}>{item.unread}</Text></View>}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const s = StyleSheet.create({
  thread: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, backgroundColor: '#1A1A1A', borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  msg: { fontSize: 12, color: '#A0A0A0', marginTop: 2 },
  time: { fontSize: 10, color: '#555' },
  unread: { backgroundColor: '#E8242C', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  unreadText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
});
