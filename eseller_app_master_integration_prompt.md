# ESELLER.MN — MASTER INTEGRATION PROMPT
# Хэрэглэгчийн аппд бүх шинэчлэлүүдийг нэгтгэх

Та одоо байгаа Eseller.mn хэрэглэгчийн аппд доорх бүх шинэчлэлүүдийг нэг дор нэгтгэнэ.
Энэ prompt-ыг дараалан биелүүлнэ — өмнөх алхам дуусаагүй бол дараагийнхыг эхлүүлэхгүй.

---

# АЛХАМ 0 — ОДООГИЙН АПП ШИНЖЛЭХ

```bash
# Эхлэхийн өмнө одоогийн аппын бүтцийг шалга
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .expo | sort
cat package.json
cat app.config.ts 2>/dev/null || cat app.config.js 2>/dev/null || cat app.json
```

Дараах зүйлсийг тодорхойл:
1. Expo Router ашиглаж байна уу? (v2 эсвэл v3)
2. State management юу вэ? (Zustand / Redux / Context)
3. Одоо ямар хуудсууд байна?
4. Auth яаж хийгдсэн байна?
5. API calls яаж хийдэг? (axios / fetch / React Query)

Шинжилгээний дараа ТАЙЛАН гарга:
```
ОДООГИЙН БАЙДАЛ:
- Expo Router: vX.X
- State: [zustand/redux/context]
- Auth: [nextauth/custom/none]
- Хуудсуудын тоо: X
- API: [axios/fetch/react-query]
- Дутуу зүйлс: [...]
```

---

# АЛХАМ 1 — FOLDER STRUCTURE + DEPENDENCIES

## 1.1 Дутуу package-уудыг нэмэх

```bash
npx expo install \
  zustand \
  @tanstack/react-query \
  expo-secure-store \
  expo-local-authentication \
  expo-notifications \
  expo-camera \
  expo-location \
  expo-task-manager \
  expo-image-picker \
  expo-av \
  react-native-qrcode-svg \
  @gorhom/bottom-sheet \
  react-native-reanimated \
  react-native-gesture-handler \
  nativewind \
  react-native-swiper-flatlist
```

## 1.2 Target folder structure

```
app/
├── _layout.tsx                     ← Root: auth guard + role redirect
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx                   ← Phone + OTP
│   └── role-select.tsx             ← Multi-role onboarding
│
├── (customer)/                     ← Хэрэглэгчийн таб (ОДОО БАЙГАА + ШИНЭЧЛЭЛТ)
│   ├── _layout.tsx
│   ├── index.tsx                   ← Нүүр feed (VIP→Featured→Discounted→Normal)
│   ├── search.tsx                  ← Real-time typeahead хайлт
│   ├── cart.tsx                    ← Сагс + loyalty redeem
│   ├── orders/
│   │   ├── index.tsx               ← Захиалгын жагсаалт
│   │   └── [id].tsx                ← Захиалгын дэлгэрэнгүй + tracking
│   └── profile/
│       ├── index.tsx               ← Профайл + loyalty widget
│       ├── wishlist.tsx            ← Хүслийн жагсаалт
│       ├── notifications.tsx
│       └── settings.tsx
│
├── (seller)/                       ← Борлуулагчийн таб (ШИНЭ)
│   ├── _layout.tsx
│   ├── index.tsx                   ← Dashboard
│   ├── orders/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── products/
│   │   ├── index.tsx
│   │   ├── new.tsx                 ← Camera + AI suggest
│   │   └── [id]/edit.tsx
│   ├── analytics.tsx
│   ├── campaigns.tsx               ← SMS/Email campaign
│   └── settings.tsx
│
├── (driver)/                       ← Жолоочийн таб (ШИНЭ)
│   ├── _layout.tsx
│   ├── index.tsx                   ← Online/Offline + delivery queue
│   ├── active/[id].tsx             ← GPS навигаци + confirm
│   ├── history.tsx
│   └── earnings.tsx
│
├── product/[slug].tsx              ← Бараа дэлгэрэнгүй (ШИНЭЧЛЭЛТ)
├── store/[slug].tsx                ← Дэлгүүрийн профайл
├── receipt/[id].tsx                ← eБаримт QR
├── chat/[id].tsx                   ← Чат
└── gold/index.tsx                  ← Gold membership

packages/                           ← Shared (НЭМ)
├── store/
│   ├── roleStore.ts
│   ├── cartStore.ts
│   └── loyaltyStore.ts
├── api/
│   ├── client.ts
│   └── hooks/
└── ui/
    ├── RoleSwitcher.tsx
    ├── RoleHeaderButton.tsx
    └── LoyaltyWidget.tsx
```

---

# АЛХАМ 2 — ROLE STORE + ROOT LAYOUT

## 2.1 Zustand role store үүсгэх

`packages/store/roleStore.ts` файлд бичнэ:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'

export type AppRole = 'customer' | 'seller' | 'driver'

interface RoleStore {
  userId:          string | null
  accessToken:     string | null
  refreshToken:    string | null
  activeRole:      AppRole
  availableRoles:  AppRole[]
  entityId:        string | null
  entityName:      string | null

  setAuth:         (userId: string, access: string, refresh: string) => void
  setActiveRole:   (role: AppRole) => void
  addRole:         (role: AppRole, entityId?: string, name?: string) => void
  clearAuth:       () => void
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set, get) => ({
      userId: null, accessToken: null, refreshToken: null,
      activeRole: 'customer', availableRoles: ['customer'],
      entityId: null, entityName: null,

      setAuth: (userId, accessToken, refreshToken) =>
        set({ userId, accessToken, refreshToken }),

      setActiveRole: (role) => {
        if (!get().availableRoles.includes(role)) return
        set({ activeRole: role })
      },

      addRole: (role, entityId, entityName) =>
        set(state => ({
          availableRoles: [...new Set([...state.availableRoles, role])],
          ...(entityId ? { entityId, entityName } : {}),
        })),

      clearAuth: () => set({
        userId: null, accessToken: null, refreshToken: null,
        activeRole: 'customer', availableRoles: ['customer'],
        entityId: null, entityName: null,
      }),
    }),
    {
      name: 'eseller-role-store',
      storage: createJSONStorage(() => ({
        getItem:    SecureStore.getItemAsync,
        setItem:    SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      })),
    }
  )
)
```

## 2.2 Root layout — role-based routing

`app/_layout.tsx`-г шинэчлэх:

```tsx
import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useRoleStore } from '@/packages/store/roleStore'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } }
})

function RoleGuard() {
  const { userId, activeRole } = useRoleStore()
  const router   = useRouter()
  const segments = useSegments()

  useEffect(() => {
    const inAuth = segments[0] === '(auth)'

    if (!userId && !inAuth) {
      router.replace('/(auth)/login')
      return
    }
    if (userId && inAuth) {
      router.replace(`/(${activeRole})/`)
      return
    }
    if (userId && !inAuth) {
      const expected = `(${activeRole})`
      if (segments[0] !== expected) {
        router.replace(`/(${activeRole})/`)
      }
    }
  }, [userId, activeRole])

  return <Slot />
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RoleGuard />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
```

---

# АЛХАМ 3 — AUTH + LOGIN

Одоогийн login screen-ийг шинэчлэх — role detection нэмэх:

```tsx
// app/(auth)/login.tsx
// Өмнөх OTP login логикоо хадгалаад, handleVerified функцыг шинэчлэ:

const handleVerified = async (userId: string, tokens: { access: string; refresh: string }) => {
  const { setAuth, addRole } = useRoleStore.getState()
  setAuth(userId, tokens.access, tokens.refresh)

  // Fetch user's available roles
  const rolesData = await fetch(`${API_URL}/api/auth/roles`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  }).then(r => r.json())

  // [ { role: 'customer' }, { role: 'seller', entityId: 'xxx', name: 'Миний дэлгүүр' } ]
  rolesData.forEach((r: any) => addRole(r.role, r.entityId, r.name))

  if (rolesData.length > 1) {
    router.replace('/(auth)/role-select')
  } else {
    router.replace('/(customer)/')
  }
}
```

---

# АЛХАМ 4 — ROLE SWITCHER COMPONENT

`packages/ui/RoleSwitcher.tsx` үүсгэх:

```tsx
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useRoleStore, AppRole } from '@/packages/store/roleStore'

const ROLE_META: Record<AppRole, { label: string; sub: string; emoji: string; color: string; bg: string }> = {
  customer: { label: 'Хэрэглэгч',   sub: 'Бараа захиалах',         emoji: '🛍', color: '#E8242C', bg: 'rgba(232,36,44,0.12)' },
  seller:   { label: 'Борлуулагч',  sub: 'Захиалга авах, удирдах', emoji: '🏪', color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  driver:   { label: 'Жолооч',      sub: 'Хүргэлтийн даалгавар',   emoji: '🚚', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
}

export function RoleSwitcher({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { activeRole, availableRoles, setActiveRole } = useRoleStore()
  const router = useRouter()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' }} onPress={onClose}>
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: '#1A1A1A', borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: 24, paddingBottom: 44,
        }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#3D3D3D', borderRadius: 99, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 16 }}>Роль сонгох</Text>

          {availableRoles.map(role => {
            const m = ROLE_META[role]
            const active = role === activeRole
            return (
              <TouchableOpacity key={role}
                onPress={() => { setActiveRole(role); onClose() }}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  padding: 14, borderRadius: 14, marginBottom: 8,
                  backgroundColor: active ? m.bg : '#2A2A2A',
                  borderWidth: active ? 1.5 : 0.5,
                  borderColor: active ? m.color : '#3D3D3D',
                }}>
                <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: m.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: active ? m.color : '#fff' }}>{m.label}</Text>
                  <Text style={{ fontSize: 12, color: '#A0A0A0', marginTop: 2 }}>{m.sub}</Text>
                </View>
                {active && (
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: m.color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}

          <TouchableOpacity
            onPress={() => { onClose(); router.push('/become-seller') }}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              padding: 14, borderRadius: 14, marginTop: 4,
              borderWidth: 0.5, borderStyle: 'dashed', borderColor: '#3D3D3D',
            }}>
            <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22, color: '#E8242C', fontWeight: '700' }}>+</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#E8242C', fontWeight: '600' }}>Борлуулагч / Жолооч болох</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  )
}
```

---

# АЛХАМ 5 — CUSTOMER TAB LAYOUT (Шинэчлэх)

```tsx
// app/(customer)/_layout.tsx
import { useState } from 'react'
import { Tabs } from 'expo-router'
import { TouchableOpacity, Text, View } from 'react-native'
import { useRoleStore } from '@/packages/store/roleStore'
import { RoleSwitcher } from '@/packages/ui/RoleSwitcher'

function RoleHeaderBtn() {
  const [open, setOpen] = useState(false)
  const { activeRole, availableRoles } = useRoleStore()

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 5,
          marginRight: 14, backgroundColor: 'rgba(232,36,44,0.12)',
          paddingHorizontal: 10, paddingVertical: 5,
          borderRadius: 20, borderWidth: 0.5, borderColor: '#E8242C',
        }}>
        <Text style={{ fontSize: 13 }}>🛍</Text>
        <Text style={{ fontSize: 12, color: '#E8242C', fontWeight: '600' }}>Хэрэглэгч</Text>
        {availableRoles.length > 1 && (
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#E8242C' }} />
        )}
      </TouchableOpacity>
      <RoleSwitcher visible={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default function CustomerLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle:             { backgroundColor: '#1A1A1A', borderTopColor: '#3D3D3D', height: 58, paddingBottom: 8 },
      tabBarActiveTintColor:   '#E8242C',
      tabBarInactiveTintColor: '#A0A0A0',
      headerStyle:             { backgroundColor: '#0A0A0A' },
      headerTintColor:         '#fff',
      headerRight:             () => <RoleHeaderBtn />,
    }}>
      <Tabs.Screen name="index"    options={{ title: 'Нүүр' }} />
      <Tabs.Screen name="search"   options={{ title: 'Хайлт' }} />
      <Tabs.Screen name="cart"     options={{ title: 'Сагс' }} />
      <Tabs.Screen name="orders"   options={{ title: 'Захиалга' }} />
      <Tabs.Screen name="profile"  options={{ title: 'Профайл' }} />
    </Tabs>
  )
}
```

---

# АЛХАМ 6 — CUSTOMER HOME SCREEN (Шинэчлэх)

Одоогийн `app/(customer)/index.tsx`-г шинэчлэх.
Статик mock data-г бүгдийг устгаж, API холбоно:

```tsx
// app/(customer)/index.tsx
'use client' // remove if already RN component
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { FlatList, ScrollView, View, Text, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native'
import { useRoleStore } from '@/packages/store/roleStore'
import { API_URL } from '@/packages/api/client'

export default function HomeScreen() {
  const { accessToken } = useRoleStore()

  // Fetch VIP + Featured banners (SSR equivalent: initial fetch)
  const { data: banners } = useQuery({
    queryKey: ['banners', 'HERO'],
    queryFn:  () => fetch(`${API_URL}/api/banners/HERO`).then(r => r.json()),
  })

  // Fetch discounted products
  const { data: discounted } = useQuery({
    queryKey: ['feed', 'discounted'],
    queryFn:  () => fetch(`${API_URL}/api/feed?tier=DISCOUNTED&limit=10`).then(r => r.json()),
  })

  // Infinite scroll main feed
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['feed', 'main'],
    queryFn: ({ pageParam = 1 }) =>
      fetch(`${API_URL}/api/feed?page=${pageParam}&limit=20&tier=NORMAL`).then(r => r.json()),
    getNextPageParam: (last) => last.meta?.hasMore ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
  })

  const allProducts = data?.pages.flatMap(p => p.items) || []

  return (
    <FlatList
      data={allProducts}
      keyExtractor={item => item.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 10, paddingHorizontal: 12 }}
      contentContainerStyle={{ paddingBottom: 80 }}

      ListHeaderComponent={
        <View>
          {/* Hero banners */}
          <HeroBannerSwiper banners={banners || []} />

          {/* Announcement bar */}
          <AnnouncementBar />

          {/* Discounted horizontal scroll */}
          <SectionHeader title="Хямдралтай бараа" badge="SALE" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 12, paddingBottom: 8 }}>
            {discounted?.items?.map(item => (
              <ProductCard key={item.id} product={item} style={{ width: 160 }} />
            ))}
          </ScrollView>

          {/* Main feed header */}
          <SectionHeader title="Бүх бараа" />
        </View>
      }

      renderItem={({ item }) => <ProductCard product={item} style={{ flex: 1 }} />}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}

      onEndReached={() => { if (hasNextPage) fetchNextPage() }}
      onEndReachedThreshold={0.4}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color="#E8242C" style={{ padding: 20 }} /> : null}
    />
  )
}
```

---

# АЛХАМ 7 — PRODUCT DETAIL SCREEN (Шинэчлэх)

`app/product/[slug].tsx`-г шинэчлэх — олон зураг, видео, spec, wishlist, loyalty:

```tsx
import { ScrollView, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/packages/api/client'
import { useRoleStore } from '@/packages/store/roleStore'
import { useCartStore } from '@/packages/store/cartStore'

const { width } = Dimensions.get('window')

export default function ProductDetailScreen() {
  const { slug }           = useLocalSearchParams<{ slug: string }>()
  const { accessToken }    = useRoleStore()
  const { addItem }        = useCartStore()
  const [activeImg, setActiveImg] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [qty, setQty] = useState(1)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn:  () => fetch(`${API_URL}/api/products/${slug}`).then(r => r.json()),
  })

  if (isLoading) return <ProductDetailSkeleton />
  if (!product)  return <NotFound />

  const handleAddToCart = () => {
    addItem({ ...product, quantity: qty })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleWishlist = async () => {
    if (!accessToken) { router.push('/(auth)/login'); return }
    await fetch(`${API_URL}/api/wishlist/${product.id}`, {
      method: wishlisted ? 'DELETE' : 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    setWishlisted(!wishlisted)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <ScrollView>

        {/* Image gallery */}
        <View style={{ position: 'relative' }}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}>
            {product.images.map((img: string, i: number) => (
              <Image key={i} source={{ uri: img }}
                style={{ width, height: width * 0.85, resizeMode: 'cover' }} />
            ))}
          </ScrollView>

          {/* Dot indicators */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, position: 'absolute', bottom: 12, left: 0, right: 0 }}>
            {product.images.map((_: any, i: number) => (
              <View key={i} style={{
                width: activeImg === i ? 16 : 6, height: 6,
                borderRadius: 3, backgroundColor: activeImg === i ? '#E8242C' : 'rgba(255,255,255,0.4)',
              }} />
            ))}
          </View>

          {/* Badges */}
          <View style={{ position: 'absolute', top: 12, left: 12, gap: 6 }}>
            {product.tier === 'VIP' && <TierBadge label="ВИП" color="#FFD700" textColor="#0A0A0A" />}
            {product.discountPct && <TierBadge label={`-${product.discountPct}%`} color="#E8242C" textColor="#fff" />}
            {product.isNew && <TierBadge label="Шинэ" color="#22C55E" textColor="#fff" />}
          </View>

          {/* Wishlist */}
          <TouchableOpacity onPress={handleWishlist}
            style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}>{wishlisted ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Product info */}
        <View style={{ padding: 16 }}>
          {/* Seller */}
          <TouchableOpacity onPress={() => router.push(`/store/${product.seller.slug}`)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            {product.seller.logo && <Image source={{ uri: product.seller.logo }} style={{ width: 20, height: 20, borderRadius: 10 }} />}
            <Text style={{ fontSize: 12, color: '#A0A0A0' }}>{product.seller.name}</Text>
            {product.seller.isVerified && <Text style={{ fontSize: 11, color: '#3B82F6' }}>✓</Text>}
          </TouchableOpacity>

          {/* Name + RefID */}
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 }}>{product.name}</Text>
          <Text style={{ fontSize: 11, color: '#555', fontFamily: 'monospace', marginBottom: 12 }}>#{product.refId}</Text>

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#E8242C' }}>
              {product.price.toLocaleString()}₮
            </Text>
            {product.originalPrice && (
              <Text style={{ fontSize: 16, color: '#555', textDecorationLine: 'line-through' }}>
                {product.originalPrice.toLocaleString()}₮
              </Text>
            )}
          </View>

          {/* Rating */}
          <StarRating rating={product.rating} count={product.reviewCount} soldCount={product.soldCount} />

          {/* Quantity */}
          <QuantitySelector value={qty} min={1} max={product.stock} onChange={setQty} />

          {/* Specs */}
          {product.specifications?.length > 0 && (
            <SpecificationTable specs={product.specifications} />
          )}

          {/* Description */}
          <ProductDescription html={product.descriptionHtml} />

          {/* Download files */}
          {product.files?.length > 0 && <DownloadFiles files={product.files} />}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#1A1A1A', borderTopWidth: 0.5, borderTopColor: '#3D3D3D',
        padding: 16, flexDirection: 'row', gap: 10,
      }}>
        <TouchableOpacity
          onPress={() => router.push(`/chat/${product.seller.id}`)}
          style={{ flex: 0.4, height: 48, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#E0E0E0', fontWeight: '600' }}>Чат</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAddToCart}
          style={{ flex: 1, height: 48, borderRadius: 10, backgroundColor: addedToCart ? '#22C55E' : '#E8242C', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {addedToCart ? 'Нэмэгдлээ ✓' : 'Сагсанд нэмэх'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
```

---

# АЛХАМ 8 — SELLER TAB (Шинэ)

```tsx
// app/(seller)/_layout.tsx
import { useState } from 'react'
import { Tabs } from 'expo-router'
import { RoleSwitcher } from '@/packages/ui/RoleSwitcher'

export default function SellerLayout() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Tabs screenOptions={{
        tabBarStyle:             { backgroundColor: '#1A1A1A', borderTopColor: '#3D3D3D', height: 58, paddingBottom: 8 },
        tabBarActiveTintColor:   '#22C55E',
        tabBarInactiveTintColor: '#A0A0A0',
        headerStyle:             { backgroundColor: '#0A0A0A' },
        headerTintColor:         '#fff',
        headerRight: () => (
          <TouchableOpacity onPress={() => setOpen(true)}
            style={{ marginRight: 14, backgroundColor: 'rgba(34,197,94,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 0.5, borderColor: '#22C55E' }}>
            <Text style={{ fontSize: 12, color: '#22C55E', fontWeight: '600' }}>🏪 Борлуулагч</Text>
          </TouchableOpacity>
        ),
      }}>
        <Tabs.Screen name="index"     options={{ title: 'Тойм' }} />
        <Tabs.Screen name="orders"    options={{ title: 'Захиалга' }} />
        <Tabs.Screen name="products"  options={{ title: 'Бараа' }} />
        <Tabs.Screen name="analytics" options={{ title: 'Тайлан' }} />
        <Tabs.Screen name="settings"  options={{ title: 'Тохиргоо' }} />
      </Tabs>
      <RoleSwitcher visible={open} onClose={() => setOpen(false)} />
    </>
  )
}

// app/(seller)/index.tsx — Real-time order alerts
import { useEffect } from 'react'
import { useRoleStore } from '@/packages/store/roleStore'

export default function SellerDashboard() {
  const { entityId, accessToken } = useRoleStore()

  // Real-time WebSocket for new orders
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/seller/${entityId}?token=${accessToken}`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'NEW_ORDER') {
        // Vibrate + sound + notification
        Vibration.vibrate([0, 400, 200, 400])
        showNewOrderAlert(data.order)
      }
    }
    return () => ws.close()
  }, [entityId])

  return (/* Dashboard UI */)
}
```

---

# АЛХАМ 9 — DRIVER TAB (Шинэ)

```tsx
// app/(driver)/_layout.tsx + app/(driver)/index.tsx
// Background GPS + online/offline toggle
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'

const BG_TASK = 'ESELLER_DRIVER_LOCATION'

TaskManager.defineTask(BG_TASK, ({ data }) => {
  if (data) {
    const loc = (data as any).locations[0]
    fetch(`${API_URL}/api/delivery/location`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useRoleStore.getState().accessToken}` },
      body:    JSON.stringify({ lat: loc.coords.latitude, lng: loc.coords.longitude }),
    }).catch(() => {})
  }
})
```

---

# АЛХАМ 10 — LOYALTY WIDGET + CHECKOUT INTEGRATION

## 10.1 Loyalty widget профайл дотор

```tsx
// app/(customer)/profile/index.tsx — профайл хуудасны дээд хэсэгт нэмэх

import { useQuery } from '@tanstack/react-query'

function LoyaltyCard({ userId, accessToken }) {
  const { data } = useQuery({
    queryKey: ['loyalty', userId],
    queryFn:  () => fetch(`${API_URL}/api/loyalty/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(r => r.json()),
  })

  if (!data) return null

  const { account, goldMembership } = data
  const TIER_COLORS = { BRONZE: '#CD7F32', SILVER: '#C0C0C0', GOLD: '#FFD700', PLATINUM: '#E5E4E2' }

  return (
    <View style={{ margin: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#3D3D3D' }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: TIER_COLORS[account.tier] + '22', borderBottomWidth: 0.5, borderBottomColor: '#3D3D3D' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 11, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: 1 }}>
              {TIER_LABELS[account.tier]} гишүүн
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: TIER_COLORS[account.tier], marginTop: 2 }}>
              {account.balance.toLocaleString()} оноо
            </Text>
          </View>
          {goldMembership?.status === 'ACTIVE' && (
            <View style={{ backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FFD700' }}>
              <Text style={{ color: '#FFD700', fontSize: 12, fontWeight: '700' }}>⭐ GOLD</Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick actions */}
      <View style={{ flexDirection: 'row' }}>
        {[
          { label: 'Зарцуулах', emoji: '🎁', onPress: openRedeemSheet },
          { label: 'Түүх',      emoji: '📋', onPress: () => router.push('/profile/points-history') },
          { label: 'Gold',      emoji: '⭐', onPress: () => router.push('/gold'), highlight: !goldMembership },
        ].map((item, i) => (
          <TouchableOpacity key={i} onPress={item.onPress} style={{
            flex: 1, padding: 12, alignItems: 'center',
            borderRightWidth: i < 2 ? 0.5 : 0, borderRightColor: '#3D3D3D',
            backgroundColor: item.highlight ? 'rgba(255,215,0,0.05)' : 'transparent',
          }}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>{item.emoji}</Text>
            <Text style={{ fontSize: 11, color: item.highlight ? '#FFD700' : '#A0A0A0' }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
```

## 10.2 Checkout дотор оноо зарцуулах

```tsx
// app/(customer)/cart.tsx — checkout section-д нэмэх

function LoyaltyRedeemSection({ orderTotal, onApply }) {
  const { userId, accessToken } = useRoleStore()
  const [points, setPoints] = useState(0)
  const { data: loyalty } = useQuery(['loyalty', userId], ...)

  if (!loyalty?.account?.balance) return null

  const maxPoints  = Math.min(loyalty.account.balance, Math.floor(orderTotal * 0.3 / 5))
  const discount   = points * 5

  return (
    <View style={{ margin: 16, padding: 14, backgroundColor: 'rgba(255,215,0,0.06)', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(255,215,0,0.2)' }}>
      <Text style={{ fontSize: 13, color: '#FFD700', fontWeight: '600', marginBottom: 8 }}>
        ⭐ {loyalty.account.balance.toLocaleString()} оноо байна
      </Text>
      <Slider minimumValue={0} maximumValue={maxPoints} step={100}
        value={points} onValueChange={setPoints}
        minimumTrackTintColor="#FFD700" maximumTrackTintColor="#3D3D3D" thumbTintColor="#FFD700" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ fontSize: 13, color: '#FFD700', fontWeight: '700' }}>{points} оноо</Text>
        <Text style={{ fontSize: 13, color: '#22C55E', fontWeight: '700' }}>= -{discount.toLocaleString()}₮</Text>
      </View>
      {points > 0 && (
        <TouchableOpacity onPress={() => handleRedeem(points)}
          style={{ marginTop: 10, padding: 10, backgroundColor: '#FFD700', borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: '#0A0A0A', fontWeight: '800' }}>{discount.toLocaleString()}₮ хямдруулах</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
```

---

# АЛХАМ 11 — eBARIMT RECEIPT SCREEN

```tsx
// app/receipt/[id].tsx
import QRCode from 'react-native-qrcode-svg'
import * as Sharing from 'expo-sharing'

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams()
  const { data: receipt } = useQuery({
    queryKey: ['receipt', id],
    queryFn:  () => fetch(`${API_URL}/api/orders/${id}/receipt`, {
      headers: { Authorization: `Bearer ${useRoleStore.getState().accessToken}` }
    }).then(r => r.json()),
  })

  if (!receipt) return <LoadingScreen />

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <View style={{ alignItems: 'center', padding: 32 }}>
        <View style={{ backgroundColor: '#1A1A1A', padding: 24, borderRadius: 20, alignItems: 'center', width: '100%' }}>
          <Text style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 4 }}>eБаримт</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 20, fontFamily: 'monospace' }}>
            {receipt.billId}
          </Text>

          <QRCode value={receipt.qrData} size={200} color="#fff" backgroundColor="#1A1A1A" />

          {receipt.lottery && (
            <View style={{ marginTop: 20, padding: 16, backgroundColor: 'rgba(232,36,44,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(232,36,44,0.3)', width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#A0A0A0', marginBottom: 4 }}>Сугалааны дугаар</Text>
              <Text style={{ fontSize: 28, fontWeight: '900', color: '#E8242C', letterSpacing: 4 }}>
                {receipt.lottery}
              </Text>
            </View>
          )}

          {/* Totals */}
          <View style={{ width: '100%', marginTop: 20 }}>
            {[
              { label: 'Дүн', value: receipt.amount },
              { label: 'НӨАТ (10%)', value: receipt.vatAmount },
              { label: 'Хотын татвар (2%)', value: receipt.cityTaxAmount },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#3D3D3D' }}>
                <Text style={{ fontSize: 13, color: '#A0A0A0' }}>{row.label}</Text>
                <Text style={{ fontSize: 13, color: '#fff', fontWeight: '600' }}>{row.value.toLocaleString()}₮</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={() => Sharing.shareAsync(receiptUrl)}
          style={{ marginTop: 16, padding: 14, backgroundColor: '#E8242C', borderRadius: 12, width: '100%', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Хуваалцах</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
```

---

# АЛХАМ 12 — SEARCH SCREEN (Шинэчлэх)

```tsx
// app/(customer)/search.tsx — Real-time typeahead
import { useState, useCallback } from 'react'
import { TextInput, FlatList, View, Text, Image, TouchableOpacity } from 'react-native'

export default function SearchScreen() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setResults([]); return }
      setLoading(true)
      const data = await fetch(`${API_URL}/api/search/suggest?q=${encodeURIComponent(q)}`).then(r => r.json())
      setResults(data.suggestions || [])
      setLoading(false)
    }, 300),
    []
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <View style={{ padding: 12 }}>
        <TextInput
          value={query}
          onChangeText={q => { setQuery(q); search(q) }}
          placeholder="Бараа, дэлгүүр хайх..."
          placeholderTextColor="#555"
          autoFocus
          style={{
            backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12,
            color: '#fff', fontSize: 16, borderWidth: 0.5, borderColor: '#3D3D3D',
          }}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/product/${item.slug}`)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A' }}>
            <Image source={{ uri: item.image }} style={{ width: 48, height: 48, borderRadius: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: '#fff', fontWeight: '500' }}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: '#A0A0A0' }}>{item.category}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#E8242C' }}>
              {item.price.toLocaleString()}₮
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={query.length > 1 && !loading ? (
          <Text style={{ textAlign: 'center', color: '#555', padding: 40 }}>Олдсонгүй</Text>
        ) : null}
      />
    </View>
  )
}
```

---

# АЛХАМ 13 — API CLIENT SETUP

```typescript
// packages/api/client.ts
import { useRoleStore } from '@/packages/store/roleStore'

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://eseller.mn'
export const WS_URL  = process.env.EXPO_PUBLIC_WS_URL  || 'wss://eseller.mn'

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = useRoleStore.getState().accessToken

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Auto refresh token if 401
  if (res.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return apiFetch(path, options) // Retry
    } else {
      useRoleStore.getState().clearAuth()
      throw new Error('Session expired')
    }
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken, setAuth } = useRoleStore.getState()
  if (!refreshToken) return false
  try {
    const data = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).then(r => r.json())
    setAuth(data.userId, data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}
```

---

# АЛХАМ 14 — ENVIRONMENT + BUILD

```bash
# .env файл үүсгэх
cat > .env << 'EOF'
EXPO_PUBLIC_API_URL=https://eseller.mn
EXPO_PUBLIC_WS_URL=wss://eseller.mn
EOF

# app.config.ts шинэчлэх — нэг апп config
# Одоогийн app.config.ts-д дараахийг нэмэх:

# plugins-д нэмэх:
# "expo-router",
# "expo-secure-store",
# ["expo-location", { "locationAlwaysAndWhenInUsePermission": "Хүргэлтийн мөрдөлтөд ашиглана." }],
# ["expo-notifications", { "sounds": ["./assets/sounds/order-alert.mp3"] }],
# ["expo-camera", { "cameraPermission": "Баркод скан хийхэд ашиглана." }],
```

---

# ХЭРЭГЖИЛТИЙН ДАРААЛАЛ

```
Алхам 0:  Аппын одоогийн бүтцийг шинжлэх → тайлан гаргах
Алхам 1:  Дутуу package суулгах + folder structure
Алхам 2:  Role store + root layout (auth redirect)
Алхам 3:  Login screen-д role detection нэмэх
Алхам 4:  RoleSwitcher component
Алхам 5:  Customer tab layout шинэчлэх (RoleHeaderBtn)
Алхам 6:  Home screen — static mock → live API
Алхам 7:  Product detail screen шинэчлэх
Алхам 8:  Seller tab нэмэх (dashboard + real-time orders)
Алхам 9:  Driver tab нэмэх (GPS + delivery)
Алхам 10: Loyalty widget + checkout integration
Алхам 11: eБаримт receipt screen
Алхам 12: Search screen — typeahead
Алхам 13: API client setup (auto token refresh)
Алхам 14: Environment + build config

ТЕСТ:
  - Role switch: customer → seller → driver → customer (< 300ms)
  - Background location (driver mode only, battery check)
  - Token expiry + auto refresh
  - Offline mode (cached data харуулах)
  - iOS + Android device test
```
