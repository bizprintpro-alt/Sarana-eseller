import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Dimensions, RefreshControl, Image, ScrollView,
  Modal, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CONFIG } from '../lib/config';

const { width } = Dimensions.get('window');
const BRAND = '#3B82F6';

// ─── Types ───────────────────────────────────────────────────

interface PostUser {
  id: string;
  name: string;
  avatar: string | null;
}

interface PostProduct {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    images: string[];
  };
}

interface SocialPost {
  id: string;
  userId: string;
  content: string | null;
  images: string[];
  shares: number;
  createdAt: string;
  user: PostUser;
  products: PostProduct[];
  _count: { likes: number; comments: number };
  liked: boolean;
  likeCount: number;
  commentCount: number;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: PostUser;
}

// ─── Helpers ─────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  try {
    const SecureStore = require('expo-secure-store');
    return await SecureStore.getItemAsync(CONFIG.STORAGE_TOKEN);
  } catch {
    return null;
  }
}

async function apiFetch(endpoint: string, opts: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${CONFIG.API_URL}${endpoint}`, { ...opts, headers });
  return res.json();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Саяхан';
  if (mins < 60) return `${mins} мин`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} цаг`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} өдөр`;
  return new Date(dateStr).toLocaleDateString('mn-MN');
}

function formatPrice(price: number): string {
  return price.toLocaleString() + '₮';
}

// ─── Main Screen ─────────────────────────────────────────────

export default function SocialScreen() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      const data = await apiFetch(`/social/feed?page=${pageNum}&limit=10`);
      if (data.success) {
        const fetched: SocialPost[] = data.data.posts.map((p: any) => ({
          ...p,
          likeCount: p._count.likes,
          commentCount: p._count.comments,
          liked: false,
        }));
        setPosts(prev => append ? [...prev, ...fetched] : fetched);
        setHasMore(data.data.meta.hasMore);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1);
  };

  const loadMore = () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchPosts(next, true);
  };

  const toggleLike = async (postId: string) => {
    try {
      const data = await apiFetch(`/social/posts/${postId}/like`, { method: 'POST' });
      if (data.success) {
        setPosts(prev =>
          prev.map(p =>
            p.id === postId
              ? { ...p, liked: data.data.liked, likeCount: data.data.count }
              : p
          )
        );
      }
    } catch {
      // silent
    }
  };

  const handleShare = (postId: string) => {
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p)
    );
  };

  const renderPost = ({ item: post }: { item: SocialPost }) => (
    <View style={styles.card}>
      {/* User header */}
      <View style={styles.userRow}>
        {post.user.avatar ? (
          <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={18} color="#9CA3AF" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{post.user.name}</Text>
          <Text style={styles.timeText}>{timeAgo(post.createdAt)}</Text>
        </View>
      </View>

      {/* Content */}
      {post.content ? (
        <Text style={styles.content}>{post.content}</Text>
      ) : null}

      {/* Images — horizontal scroll */}
      {post.images.length > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
        >
          {post.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.postImage} resizeMode="cover" />
          ))}
        </ScrollView>
      )}

      {/* Tagged products */}
      {post.products.length > 0 && (
        <View style={styles.productsSection}>
          <Text style={styles.productsLabel}>Бүтээгдэхүүнүүд</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {post.products.map(pp => (
              <View key={pp.id} style={styles.productCard}>
                {pp.product.images.length > 0 && (
                  <Image
                    source={{ uri: pp.product.images[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {pp.product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatPrice(pp.product.salePrice ?? pp.product.price)}
                  </Text>
                  <TouchableOpacity style={styles.addToCartBtn}>
                    <Ionicons name="cart-outline" size={12} color="#fff" />
                    <Text style={styles.addToCartText}>Сагсанд нэмэх</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post.id)}>
          <Ionicons
            name={post.liked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.liked ? '#EF4444' : '#6B7280'}
          />
          {post.likeCount > 0 && (
            <Text style={[styles.actionCount, post.liked && { color: '#EF4444' }]}>
              {post.likeCount}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowComments(post.id)}
        >
          <Ionicons name="chatbubble-outline" size={19} color="#6B7280" />
          {post.commentCount > 0 && (
            <Text style={styles.actionCount}>{post.commentCount}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(post.id)}>
          <Ionicons name="share-social-outline" size={20} color="#6B7280" />
          {post.shares > 0 && (
            <Text style={styles.actionCount}>{post.shares}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Hint */}
      <Text style={styles.hintText}>Давхар товшиж таалах</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Нийгмийн худалдаа</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Одоогоор пост байхгүй</Text>
          </View>
        }
      />

      {/* Comments modal */}
      {showComments && (
        <CommentsModal
          postId={showComments}
          onClose={() => setShowComments(null)}
          onCommentAdded={() => {
            setPosts(prev =>
              prev.map(p =>
                p.id === showComments
                  ? { ...p, commentCount: p.commentCount + 1 }
                  : p
              )
            );
          }}
        />
      )}
    </View>
  );
}

// ─── Comments Modal ──────────────────────────────────────────

function CommentsModal({
  postId,
  onClose,
  onCommentAdded,
}: {
  postId: string;
  onClose: () => void;
  onCommentAdded: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/social/posts/${postId}/comment`);
        if (data.success) setComments(data.data.comments);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const data = await apiFetch(`/social/posts/${postId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ content: text.trim() }),
      });
      if (data.success) {
        setComments(prev => [...prev, data.data]);
        setText('');
        onCommentAdded();
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Сэтгэгдэл</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Comments list */}
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={BRAND} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item: c }) => (
                <View style={styles.commentRow}>
                  {c.user.avatar ? (
                    <Image source={{ uri: c.user.avatar }} style={styles.commentAvatar} />
                  ) : (
                    <View style={[styles.commentAvatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={12} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentUserName}>{c.user.name}</Text>
                    <Text style={styles.commentText}>{c.content}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.noComments}>Сэтгэгдэл байхгүй</Text>
              }
            />
          )}

          {/* Input */}
          <View style={styles.commentInput}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Сэтгэгдэл бичих..."
              style={styles.commentTextInput}
              returnKeyType="send"
              onSubmitEditing={submit}
            />
            <TouchableOpacity
              onPress={submit}
              disabled={submitting || !text.trim()}
              style={[
                styles.sendBtn,
                (!text.trim() || submitting) && { opacity: 0.4 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },

  header: {
    backgroundColor: '#fff',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
    gap: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6' },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  timeText: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  content: { paddingHorizontal: 12, paddingBottom: 10, fontSize: 14, color: '#374151', lineHeight: 20 },

  imageScroll: { width },
  postImage: { width: width - 24, height: 240 },

  productsSection: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  productsLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 6 },
  productCard: {
    width: 140,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginRight: 8,
  },
  productImage: { width: 140, height: 80 },
  productInfo: { padding: 6 },
  productName: { fontSize: 11, fontWeight: '600', color: '#111827' },
  productPrice: { fontSize: 11, fontWeight: '700', color: '#111827', marginTop: 2 },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND,
    borderRadius: 4,
    paddingVertical: 4,
    marginTop: 4,
    gap: 4,
  },
  addToCartText: { fontSize: 10, color: '#fff', fontWeight: '600' },

  actionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionCount: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  hintText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#D1D5DB',
    paddingBottom: 6,
  },

  empty: { alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 15, color: '#9CA3AF', marginTop: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  commentRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6' },
  commentBubble: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentUserName: { fontSize: 12, fontWeight: '600', color: '#111827' },
  commentText: { fontSize: 12, color: '#374151', marginTop: 1 },
  noComments: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 20 },

  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
