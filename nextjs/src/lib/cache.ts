// ══════════════════════════════════════════════════════════════
// eseller.mn — Simple in-memory cache (upgradable to Upstash Redis)
// ══════════════════════════════════════════════════════════════

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    // Try Upstash Redis if configured
    if (process.env.UPSTASH_REDIS_URL) {
      try {
        const res = await fetch(`${process.env.UPSTASH_REDIS_URL}/get/${key}`, {
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN}` },
        });
        const { result } = await res.json();
        return result ? JSON.parse(result) : null;
      } catch { /* fall through to memory */ }
    }

    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { store.delete(key); return null; }
    return entry.data as T;
  },

  async set(key: string, data: unknown, ttlSeconds: number): Promise<void> {
    if (process.env.UPSTASH_REDIS_URL) {
      try {
        await fetch(`${process.env.UPSTASH_REDIS_URL}/setex/${key}/${ttlSeconds}/${JSON.stringify(data)}`, {
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN}` },
        });
        return;
      } catch { /* fall through */ }
    }

    store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  async invalidate(pattern: string): Promise<void> {
    // Memory: delete matching keys
    for (const key of store.keys()) {
      if (key.startsWith(pattern.replace('*', '')) || key.includes(pattern.replace('*', ''))) {
        store.delete(key);
      }
    }

    // Upstash: use scan (if configured)
    if (process.env.UPSTASH_REDIS_URL) {
      try {
        const scanRes = await fetch(`${process.env.UPSTASH_REDIS_URL}/keys/${pattern}`, {
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN}` },
        });
        const { result: keys } = await scanRes.json();
        if (keys?.length) {
          await fetch(`${process.env.UPSTASH_REDIS_URL}/del/${keys.join('/')}`, {
            headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN}` },
          });
        }
      } catch {}
    }
  },
};

/** Helper: cached fetch wrapper */
export async function withCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = await cache.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  await cache.set(key, data, ttl);
  return data;
}
