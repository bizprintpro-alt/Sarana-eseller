import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SellerAPI } from '../lib/api';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderRole: 'seller' | 'buyer';
  createdAt: string;
}

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadMessages();
    // Poll every 3 seconds for new messages
    pollRef.current = setInterval(loadMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const loadMessages = async () => {
    try {
      const data = await SellerAPI.messages(roomId!);
      const msgs = (data as any)?.messages || [];
      setMessages(msgs);
    } catch {}
  };

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await SellerAPI.sendMessage(roomId!, text.trim());
      setText('');
      loadMessages();
    } catch {}
    setSending(false);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        inverted={false}
        contentContainerStyle={{ padding: 12, gap: 6, paddingBottom: 8 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const isMine = item.senderRole === 'seller';
          return (
            <View style={[s.bubble, isMine ? s.bubbleMine : s.bubbleTheirs]}>
              <Text style={[s.msgText, isMine && { color: '#FFF' }]}>{item.content}</Text>
              <Text style={s.msgTime}>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>💬</Text>
            <Text style={{ color: '#555', fontSize: 13 }}>Мессеж байхгүй</Text>
            <Text style={{ color: '#444', fontSize: 11, marginTop: 4 }}>Эхний мессежээ бичнэ үү</Text>
          </View>
        }
      />

      {/* Input bar */}
      <View style={s.inputBar}>
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder="Мессеж бичих..."
          placeholderTextColor="#555"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity style={[s.sendBtn, (!text.trim() || sending) && { opacity: 0.4 }]}
          onPress={sendMessage} disabled={!text.trim() || sending}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  bubble: { maxWidth: '78%', borderRadius: 16, padding: 12, paddingBottom: 6 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: '#22C55E', borderBottomRightRadius: 4 },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: '#1A1A1A', borderBottomLeftRadius: 4 },
  msgText: { color: '#E0E0E0', fontSize: 14, lineHeight: 20 },
  msgTime: { fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, paddingBottom: Platform.OS === 'android' ? 12 : 28, backgroundColor: '#111111', borderTopWidth: 0.5, borderTopColor: '#2A2A2A', gap: 8 },
  input: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#FFF', fontSize: 14, maxHeight: 100, borderWidth: 0.5, borderColor: '#2A2A2A' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
});
