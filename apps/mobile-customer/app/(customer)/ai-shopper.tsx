import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

const API = process.env.EXPO_PUBLIC_API_URL || 'https://eseller.mn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  '50,000₮-н бэлэг хайж байна',
  'Гэрийн тавилга',
  'Хүүхдийн хувцас',
  'Эрэгтэй гутал',
];

export default function AIShopperScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: 'Сайн байна уу! Би таны хувийн худалдааны туслах. Юу хайж байна вэ?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function send(text?: string) {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/ai/shop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.data?.reply || data.reply || 'Уучлаарай, хариу алга.';

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: 'Уучлаарай, алдаа гарлаа. Дахин оролдоно уу.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>AI Худалдааны туслах</Text>
          <Text style={s.headerSub}>Бараа хайх, зөвлөгөө авах</Text>
        </View>
      </View>

      {/* Quick prompts */}
      <View style={s.quickRow}>
        {QUICK_PROMPTS.map((q) => (
          <TouchableOpacity key={q} onPress={() => send(q)} style={s.quickChip}>
            <Text style={s.quickText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.aiBubble]}>
            <Text style={[s.bubbleText, item.role === 'user' ? s.userText : s.aiText]}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={s.loadingRow}>
          <ActivityIndicator size="small" color="#1B3A5C" />
          <Text style={{ fontSize: 11, color: '#888', marginLeft: 6 }}>Хайж байна...</Text>
        </View>
      )}

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Юу хайж байна вэ?"
          returnKeyType="send"
          onSubmitEditing={() => send()}
          multiline
        />
        <TouchableOpacity
          onPress={() => send()}
          style={[s.sendBtn, !input.trim() && { opacity: 0.4 }]}
          disabled={!input.trim() || loading}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#1B3A5C', padding: 16, paddingTop: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 1 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 10, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e5e5e5' },
  quickChip: { backgroundColor: '#EEF2F7', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  quickText: { fontSize: 11, color: '#1B3A5C' },
  bubble: { maxWidth: '80%', borderRadius: 12, padding: 10 },
  userBubble: { backgroundColor: '#1B3A5C', alignSelf: 'flex-end', borderBottomRightRadius: 3 },
  aiBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 3, borderWidth: 0.5, borderColor: '#e5e5e5' },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  userText: { color: '#fff' },
  aiText: { color: '#222' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingHorizontal: 16 },
  inputRow: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#e5e5e5' },
  input: { flex: 1, backgroundColor: '#F5F7FA', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1B3A5C', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
});
