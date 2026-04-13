"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  X,
  Send,
  ChevronDown,
  ShoppingCart,
  User,
  ImageIcon,
  Loader2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────

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
  // client-side state
  liked?: boolean;
  likeCount?: number;
  commentCount?: number;
  showComments?: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: PostUser;
}

// ── Helpers ──────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Саяхан";
  if (mins < 60) return `${mins} мин`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} цаг`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} өдөр`;
  return new Date(dateStr).toLocaleDateString("mn-MN");
}

function formatPrice(price: number): string {
  return price.toLocaleString("mn-MN") + "₮";
}

// ── Main Page ────────────────────────────────────────────────

export default function SocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/social/feed?page=${pageNum}&limit=10`);
      const data = await res.json();
      if (data.success) {
        const fetched: SocialPost[] = data.data.posts.map((p: SocialPost) => ({
          ...p,
          likeCount: p._count.likes,
          commentCount: p._count.comments,
          liked: false,
          showComments: false,
        }));
        setPosts((prev) => (append ? [...prev, ...fetched] : fetched));
        setHasMore(data.data.meta.hasMore);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next, true);
  };

  const handlePostCreated = (newPost: SocialPost) => {
    setPosts((prev) => [
      {
        ...newPost,
        likeCount: 0,
        commentCount: 0,
        liked: false,
        showComments: false,
      },
      ...prev,
    ]);
    setShowCreate(false);
  };

  const toggleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/social/posts/${postId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
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

  const handleShare = async (postId: string) => {
    // Increment share count optimistically
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, shares: p.shares + 1 } : p
      )
    );
    // Copy link
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/social?post=${postId}`
      );
    } catch {
      // silent
    }
  };

  const toggleComments = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, showComments: !p.showComments } : p
      )
    );
  };

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Нийгмийн худалдаа</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Пост нэмэх
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Одоогоор пост байхгүй байна</p>
            <p className="text-sm mt-1">Эхний постоо нэмээрэй!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={toggleLike}
                onShare={handleShare}
                onToggleComments={toggleComments}
              />
            ))}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {loadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                Цааш үзэх
              </button>
            )}
          </>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
}

// ── Post Card ────────────────────────────────────────────────

function PostCard({
  post,
  onLike,
  onShare,
  onToggleComments,
}: {
  post: SocialPost;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onToggleComments: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* User header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        {post.user.avatar ? (
          <img
            src={post.user.avatar}
            alt={post.user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {post.user.name}
          </p>
          <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 pb-3 text-gray-800 text-sm whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Images */}
      {post.images.length > 0 && (
        <div
          className={`grid gap-0.5 ${
            post.images.length === 1
              ? "grid-cols-1"
              : post.images.length === 2
              ? "grid-cols-2"
              : "grid-cols-2"
          }`}
        >
          {post.images.slice(0, 4).map((img, i) => (
            <div
              key={i}
              className={`relative ${
                post.images.length === 1 ? "aspect-video" : "aspect-square"
              } ${
                post.images.length === 3 && i === 0
                  ? "col-span-2"
                  : ""
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
              />
              {i === 3 && post.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    +{post.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tagged products */}
      {post.products.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 font-medium">
            Бүтээгдэхүүнүүд
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {post.products.map((pp) => (
              <div
                key={pp.id}
                className="flex-shrink-0 w-40 border border-gray-200 rounded-lg overflow-hidden"
              >
                {pp.product.images.length > 0 && (
                  <img
                    src={pp.product.images[0]}
                    alt={pp.product.name}
                    className="w-full h-24 object-cover"
                  />
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {pp.product.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {pp.product.salePrice ? (
                      <>
                        <span className="text-xs font-bold text-red-600">
                          {formatPrice(pp.product.salePrice)}
                        </span>
                        <span className="text-[10px] text-gray-400 line-through">
                          {formatPrice(pp.product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-gray-900">
                        {formatPrice(pp.product.price)}
                      </span>
                    )}
                  </div>
                  <button className="mt-1.5 w-full text-[10px] bg-blue-600 text-white py-1 rounded font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    Сагсанд нэмэх
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center border-t border-gray-100 px-2">
        <button
          onClick={() => onLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
            post.liked
              ? "text-red-500"
              : "text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`}
          />
          {(post.likeCount ?? 0) > 0 && (
            <span>{post.likeCount}</span>
          )}
        </button>
        <button
          onClick={() => onToggleComments(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {(post.commentCount ?? 0) > 0 && (
            <span>{post.commentCount}</span>
          )}
        </button>
        <button
          onClick={() => onShare(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-500 hover:text-green-500 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {post.shares > 0 && <span>{post.shares}</span>}
        </button>
      </div>

      {/* Comments section */}
      {post.showComments && <CommentsSection postId={post.id} />}
    </div>
  );
}

// ── Comments Section ─────────────────────────────────────────

function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/social/posts/${postId}/comment`);
        const data = await res.json();
        if (!cancelled && data.success) {
          setComments(data.data.comments);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/social/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.data]);
        setText("");
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto px-4 py-2 space-y-2">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">
              Сэтгэгдэл байхгүй
            </p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              {c.user.avatar ? (
                <img
                  src={c.user.avatar}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                </div>
              )}
              <div className="bg-white rounded-lg px-3 py-1.5 flex-1">
                <p className="text-xs font-semibold text-gray-900">
                  {c.user.name}
                </p>
                <p className="text-xs text-gray-700">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Add comment */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-200">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Сэтгэгдэл бичих..."
          className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button
          onClick={submit}
          disabled={submitting || !text.trim()}
          className="p-1.5 text-blue-600 disabled:text-gray-300 hover:bg-blue-50 rounded-full transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Create Post Modal ────────────────────────────────────────

function CreatePostModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (post: SocialPost) => void;
}) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<
    { id: string; name: string; price: number; images: string[] }[]
  >([]);
  const [selectedProducts, setSelectedProducts] = useState<
    { id: string; name: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  const addImage = () => {
    const url = imageUrl.trim();
    if (url && !images.includes(url)) {
      setImages((prev) => [...prev, url]);
      setImageUrl("");
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const searchProducts = async (q: string) => {
    setProductSearch(q);
    if (q.length < 2) {
      setProductResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(q)}&limit=5`
      );
      const data = await res.json();
      if (data.success) {
        const items = Array.isArray(data.data)
          ? data.data
          : data.data?.products || [];
        setProductResults(
          items.map(
            (p: { id: string; name: string; price: number; images: string[] }) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              images: p.images || [],
            })
          )
        );
      }
    } catch {
      // silent
    } finally {
      setSearching(false);
    }
  };

  const selectProduct = (p: { id: string; name: string }) => {
    if (!selectedProducts.find((sp) => sp.id === p.id)) {
      setSelectedProducts((prev) => [...prev, p]);
    }
    setProductSearch("");
    setProductResults([]);
  };

  const removeProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const submit = async () => {
    if (!content.trim() && images.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/social/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim() || undefined,
          images,
          productIds: selectedProducts.map((p) => p.id),
        }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated(data.data);
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Шинэ пост</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Text */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Юу бодож байна?"
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          {/* Image URLs */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Зураг нэмэх (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
                placeholder="https://..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addImage}
                className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative w-16 h-16">
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product selector */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Бүтээгдэхүүн холбох
            </label>
            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => searchProducts(e.target.value)}
                placeholder="Бүтээгдэхүүн хайх..."
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-2 w-4 h-4 animate-spin text-gray-400" />
              )}
              {productResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {productResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectProduct(p)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                    >
                      {p.images[0] && (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(p.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedProducts.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                  >
                    {p.name}
                    <button onClick={() => removeProduct(p.id)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={submit}
            disabled={
              submitting || (!content.trim() && images.length === 0)
            }
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Нийтлэх
          </button>
        </div>
      </div>
    </div>
  );
}
