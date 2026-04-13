import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SellerAPI } from '../lib/api';

const BRAND = '#E8242C';

interface Conversation {
  id: string;
  shopName: string;
  shopLogo?: string;
  lastMessage: string;
  updatedAt: string;
  unread: number;
}

export default function ChatTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SellerAPI.conversations()
      .then((data: any) => {
        setConversations(data?.conversations || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={s.item}
      activeOpacity={0.7}
      onPress={() => router.push(`/chat/${item.id}` as any)}
    >
      <View style={s.avatar}>
        {item.shopLogo ? (
          <Image source={{ uri: item.shopLogo }} style={s.avatarImg} />
        ) : (
          <Ionicons name="storefront" size={22} color="#666" />
        )}
      </View>
      <View style={s.content}>
        <View style={s.row}>
          <Text style={s.name} numberOfLines={1}>{item.shopName}</Text>
          <Text style={s.time}>
            {new Date(item.updatedAt).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={s.row}>
          <Text style={s.message} numberOfLines={1}>{item.lastMessage || 'Мессеж байхгүй'}</Text>
          {item.unread > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {loading ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>Ачааллаж байна...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="chatbubbles-outline" size={56} color="#333" />
          <Text style={s.emptyTitle}>Мессеж байхгүй</Text>
          <Text style={s.emptyText}>Дэлгүүртэй чатлахад энд харагдана</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  emptyText: { color: '#666', fontSize: 13 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  content: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#FFF', fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  time: { color: '#666', fontSize: 11 },
  message: { color: '#999', fontSize: 13, flex: 1, marginRight: 8, marginTop: 2 },
  badge: { backgroundColor: BRAND, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
});
