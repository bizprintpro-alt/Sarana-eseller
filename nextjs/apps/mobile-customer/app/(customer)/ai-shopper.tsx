import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Constants ────────────────────────────────────────────────
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://eseller.mn';

const QUICK_PROMPTS = [
  '50,000₮-н бэлэг',
  'Гэрийн тавилга',
  'Хүүхдийн хувцас',
  'Хямдралтай бараа',
];

const OCCASIONS = ['Бэлэг', 'Өөртөө', 'Байшин', 'Гэр бүл'] as const;

const ts = () =>
  new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Screen ───────────────────────────────────────────────────
export default function AIShopperScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        'Сайн байна уу! Би eseller.mn-ийн AI худалдааны туслах. Юу хайж байгаагаа хэлээрэй!',
      time: ts(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [occasion, setOccasion] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  const send = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || loading) return;

      const userMsg: Message = { id: uid(), role: 'user', content: text, time: ts() };
      const assistantId = uid();

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '', time: ts() },
      ]);
      if (!overrideText) setInput('');
      setLoading(true);

      try {
        const res = await fetch(`${API_URL}/api/ai/shop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history,
            budget: 500_000,
            occasion: occasion ?? undefined,
          }),
        });

        if (!res.ok) throw new Error('API error');

        const contentType = res.headers.get('content-type') ?? '';

        if (contentType.includes('text/event-stream') && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let fullText = '';
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const payload = line.slice(6);
              if (payload === '[DONE]') break;
              try {
                const parsed = JSON.parse(payload) as { text: string };
                fullText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullText } : m,
                  ),
                );
              } catch {
                // skip
              }
            }
          }

          setHistory((prev) => [
            ...prev,
            { role: 'user', content: text },
            { role: 'assistant', content: fullText },
          ]);
        } else {
          const data = await res.json();
          const reply: string = data.reply ?? data.error ?? 'Алдаа гарлаа';
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: reply } : m,
            ),
          );
          setHistory((prev) => [
            ...prev,
            { role: 'user', content: text },
            { role: 'assistant', content: reply },
          ]);
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Алдаа гарлаа. Дахин оролдоно уу.' }
              : m,
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [input, loading, history, occasion],
  );

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[s.bubble, isUser ? s.userBubble : s.aiBubble]}>
        {item.content ? (
          <>
            <Text style={[s.msgText, isUser && s.userText]}>{item.content}</Text>
            <Text style={[s.time, isUser && s.userTime]}>{item.time}</Text>
          </>
        ) : (
          <ActivityIndicator size="small" color="#8b5cf6" />
        )}
      </View>
    );
  }, []);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>AI Худалдааны Туслах</Text>
        <Text style={s.headerSub}>Бараа хайх, зөвлөгөө авах</Text>
      </View>

      {/* Quick prompts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.quickRow}
      >
        {QUICK_PROMPTS.map((q) => (
          <TouchableOpacity key={q} style={s.quickBtn} onPress={() => send(q)}>
            <Text style={s.quickText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Occasion chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.occasionRow}
      >
        {OCCASIONS.map((o) => (
          <TouchableOpacity
            key={o}
            style={[s.occasionBtn, occasion === o && s.occasionActive]}
            onPress={() => setOccasion(occasion === o ? null : o)}
          >
            <Text style={[s.occasionText, occasion === o && s.occasionActiveText]}>
              {o}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={s.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input bar */}
      <View style={s.inputBar}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Юу хайж байна вэ?"
          placeholderTextColor="#666"
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={() => send()}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || loading) && s.sendDisabled]}
          onPress={() => send()}
          disabled={!input.trim() || loading}
        >
          <Text style={s.sendIcon}>{'>'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#7c3aed',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  quickRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    marginRight: 8,
  },
  quickText: {
    fontSize: 12,
    color: '#a78bfa',
  },
  occasionRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  occasionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
  },
  occasionActive: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139,92,246,0.2)',
  },
  occasionText: {
    fontSize: 11,
    color: '#888',
  },
  occasionActiveText: {
    color: '#c4b5fd',
  },
  list: {
    padding: 12,
    paddingBottom: 8,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#eee',
  },
  userText: {
    color: '#fff',
  },
  time: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'right',
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(255,255,255,0.6)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#eee',
    borderWidth: 1,
    borderColor: '#333',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: '#1a1a1a',
    opacity: 0.5,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
