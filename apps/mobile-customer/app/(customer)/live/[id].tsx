import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { LiveAPI } from '../../lib/api';

const BRAND = '#E8242C';

interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
}

interface LiveProduct {
  id: string;
  productId: string;
  flashPrice?: number;
  flashStock?: number;
  soldCount: number;
  isPinned: boolean;
  product: Product;
}

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface StreamDetail {
  id: string;
  title: string;
  status: string;
  viewerCount: number;
  youtubeUrl?: string;
  facebookUrl?: string;
  muxPlaybackId?: string;
  embedType?: string;
  scheduledAt?: string;
  shop: { id: string; name: string };
  host: { id: string; name: string };
  products: LiveProduct[];
  messages: Message[];
}

function getEmbedUrl(stream: StreamDetail): string | null {
  if (stream.youtubeUrl) {
    const patterns = [/youtube\.com\/live\/([^?&#]+)/, /youtube\.com\/watch\?v=([^&#]+)/, /youtu\.be\/([^?&#]+)/];
    for (const p of patterns) {
      const m = stream.youtubeUrl.match(p);
      if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&playsinline=1`;
    }
  }
  if (stream.facebookUrl) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(stream.facebookUrl)}&autoplay=true`;
  }
  return null;
}

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function LiveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const chatRef = useRef<ScrollView>(null);

  const fetchStream = useCallback(async () => {
    if (!id) return;
    try {
      const res = await LiveAPI.detail(id);
      const data = res?.data || res;
      if (data) {
        setStream(data);
        setMessages((data.messages || []).slice().reverse());
      }
    } catch {
      /* ignore */
    }
  }, [id]);

  useEffect(() => {
    fetchStream();
    const interval = setInterval(fetchStream, 5000);
    return () => clearInterval(interval);
  }, [fetchStream]);

  useEffect(() => {
    setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!chatInput.trim() || sending || !id) return;
    setSending(true);
    try {
      const res = await LiveAPI.sendMessage(id, chatInput.trim());
      const msg = res?.data || res;
      if (msg?.id) {
        setMessages((prev) => [...prev, msg]);
        setChatInput('');
      }
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    if (purchasing || !id) return;
    setPurchasing(productId);
    try {
      const res = await LiveAPI.purchase(id, productId);
      const data = res?.data || res;
      if (data?.id) {
        Alert.alert('Амжилттай', 'Захиалга үүслээ!');
        fetchStream();
      } else {
        Alert.alert('Алдаа', res?.error || 'Алдаа гарлаа');
      }
    } catch {
      Alert.alert('Алдаа', 'Алдаа гарлаа');
    } finally {
      setPurchasing(null);
    }
  };

  if (!stream) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  const isLive = stream.status === 'LIVE';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Video embed or placeholder */}
      {(() => {
        const embedUrl = getEmbedUrl(stream);
        if (embedUrl) {
          return (
            <View style={styles.video}>
              <WebView
                source={{ uri: embedUrl }}
                style={{ flex: 1 }}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
              />
              {/* Top bar overlay */}
              <View style={[styles.topBar, { position: 'absolute' }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                  <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={styles.topRight}>
                  {isLive && (
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  )}
                  <View style={styles.viewerBadge}>
                    <Ionicons name="people-outline" size={12} color="#fff" />
                    <Text style={styles.viewerText}>{stream.viewerCount}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }
        return (
          <View style={styles.video}>
            <Ionicons name="videocam-outline" size={40} color="#555" />
            <Text style={styles.videoTitle}>{stream.title}</Text>
            <Text style={styles.videoShop}>{stream.shop.name}</Text>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <View style={styles.topRight}>
                {isLive && (
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
                <View style={styles.viewerBadge}>
                  <Ionicons name="people-outline" size={12} color="#fff" />
                  <Text style={styles.viewerText}>{stream.viewerCount}</Text>
                </View>
              </View>
            </View>
            {!isLive && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  {stream.status === 'ENDED' ? 'Дууссан' : 'Удахгүй эхлэнэ'}
                </Text>
              </View>
            )}
          </View>
        );
      })()}

      {/* Products horizontal scroll */}
      <View style={styles.productsSection}>
        <FlatList
          horizontal
          data={stream.products}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
          renderItem={({ item: lp }) => {
            const effectivePrice = lp.flashPrice ?? lp.product.price;
            const hasDiscount = lp.flashPrice != null && lp.flashPrice < lp.product.price;
            const remaining = lp.flashStock != null ? lp.flashStock - lp.soldCount : null;

            return (
              <View style={styles.productCard}>
                <View style={styles.productThumb}>
                  <Ionicons name="bag-outline" size={20} color="#666" />
                  {lp.isPinned && (
                    <View style={styles.pinBadge}>
                      <Ionicons name="pin" size={10} color="#fff" />
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{lp.product.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.flashPrice}>{fmt(effectivePrice)}</Text>
                    {hasDiscount && (
                      <Text style={styles.originalPrice}>{fmt(lp.product.price)}</Text>
                    )}
                  </View>
                  {remaining !== null && (
                    <Text style={styles.stockText}>Үлдсэн: {remaining}</Text>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.buyBtn,
                      (!isLive || (remaining !== null && remaining <= 0)) && styles.buyBtnDisabled,
                    ]}
                    disabled={!!purchasing || !isLive || (remaining !== null && remaining <= 0)}
                    onPress={() => handlePurchase(lp.productId)}
                  >
                    <Text style={styles.buyBtnText}>
                      {purchasing === lp.productId
                        ? '...'
                        : remaining !== null && remaining <= 0
                          ? 'Дууссан'
                          : 'Авах'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>

      {/* Chat */}
      <View style={styles.chatSection}>
        <ScrollView ref={chatRef} style={styles.chatScroll} contentContainerStyle={{ paddingVertical: 8 }}>
          {messages.map((msg) => (
            <View key={msg.id} style={styles.chatMsg}>
              {msg.type === 'PURCHASE' ? (
                <View style={styles.purchaseMsg}>
                  <Text style={styles.purchaseMsgText}>
                    <Text style={{ fontWeight: '700' }}>{msg.user.name}</Text> {msg.content}
                  </Text>
                </View>
              ) : msg.type === 'JOIN' ? (
                <Text style={styles.joinMsg}>{msg.user.name} нэгдлээ</Text>
              ) : (
                <Text style={styles.textMsg}>
                  <Text style={styles.msgUser}>{msg.user.name} </Text>
                  {msg.content}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="Мессеж бичих..."
            placeholderTextColor="#888"
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!chatInput.trim() || sending) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!chatInput.trim() || sending}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  video: {
    height: 220,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 8 },
  videoShop: { color: '#aaa', fontSize: 13, marginTop: 2 },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 6,
    borderRadius: 20,
  },
  topRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BRAND,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewerText: { color: '#fff', fontSize: 10 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: { color: '#ddd', fontSize: 18, fontWeight: '700' },
  productsSection: { paddingVertical: 10 },
  productCard: {
    width: 140,
    backgroundColor: '#222',
    borderRadius: 10,
    overflow: 'hidden',
  },
  productThumb: {
    height: 80,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#eab308',
    padding: 3,
    borderRadius: 4,
  },
  productInfo: { padding: 8 },
  productName: { color: '#fff', fontSize: 12, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 3 },
  flashPrice: { color: BRAND, fontWeight: '700', fontSize: 13 },
  originalPrice: { color: '#777', fontSize: 10, textDecorationLine: 'line-through' },
  stockText: { color: '#888', fontSize: 10, marginTop: 2 },
  buyBtn: {
    marginTop: 6,
    backgroundColor: BRAND,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyBtnDisabled: { backgroundColor: '#555' },
  buyBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  chatSection: { flex: 1, borderTopWidth: 1, borderTopColor: '#333' },
  chatScroll: { flex: 1, paddingHorizontal: 12 },
  chatMsg: { marginBottom: 4 },
  purchaseMsg: {
    backgroundColor: 'rgba(234,179,8,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  purchaseMsgText: { color: '#eab308', fontSize: 13 },
  joinMsg: { color: '#666', fontSize: 11, textAlign: 'center' },
  textMsg: { color: '#ccc', fontSize: 13 },
  msgUser: { color: '#60a5fa', fontWeight: '600' },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: BRAND,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#444' },
});
