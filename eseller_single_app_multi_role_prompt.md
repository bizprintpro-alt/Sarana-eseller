# Eseller.mn — Single App, Multi-Role Architecture
## Claude Code Prompt — One App, Three Roles

Нэг React Native апп дотор хэрэглэгч, борлуулагч, жолооч гурвыг хооронд нь шилжиж ордог систем.
Загвар: Grab (rider↔driver), Gojek (user↔merchant↔driver), eBay (buyer↔seller)

Stack: Expo SDK 51, Expo Router v3, React Native, Zustand, React Query, NativeWind v4

---

## ЯАГААД НЭГ АПП ДЭЭ?

```
3 тусдаа апп:                    1 нэгдсэн апп:
────────────────────────         ────────────────────────
✗ 3x maintenance                 ✓ 1x codebase
✗ 3x App Store review            ✓ 1x release
✗ 3x push notification setup     ✓ Shared auth tokens
✗ Хэрэглэгч 3 апп татах         ✓ 1 апп татна
✗ Shared code давтагдана         ✓ Role switching UI
✗ Auth token 3 дахин             ✓ 2026-ын best practice
```

---

## 1. APP STRUCTURE — Expo Router file-based routing

```
app/
├── _layout.tsx                    ← Root layout + auth guard
├── (auth)/
│   ├── login.tsx                  ← Phone + OTP
│   └── onboarding.tsx             ← Анхны нэвтрэлтийн дараах роль тохируулга
│
├── (customer)/                    ← Хэрэглэгчийн таб
│   ├── _layout.tsx                ← Customer tab navigator
│   ├── index.tsx                  ← Feed / Нүүр
│   ├── search.tsx
│   ├── cart.tsx
│   ├── orders.tsx
│   └── profile.tsx
│
├── (seller)/                      ← Борлуулагчийн таб
│   ├── _layout.tsx                ← Seller tab navigator
│   ├── index.tsx                  ← Dashboard
│   ├── orders.tsx                 ← Захиалгын жагсаалт
│   ├── products.tsx               ← Бараа удирдлага
│   ├── analytics.tsx
│   └── settings.tsx
│
├── (driver)/                      ← Жолоочийн таб
│   ├── _layout.tsx                ← Driver tab navigator
│   ├── index.tsx                  ← Хүргэлтийн дэлгэц
│   ├── history.tsx
│   └── earnings.tsx
│
└── (shared)/                      ← Бүх роллд нийтлэг
    ├── product/[id].tsx
    ├── chat/[id].tsx
    ├── notifications.tsx
    └── account-settings.tsx

packages/
├── store/          ← Zustand stores (auth, role, cart)
├── api/            ← React Query hooks
├── ui/             ← Shared components
└── tokens/         ← Design tokens (colors, spacing)
```

---

## 2. ROLE STATE — Zustand store

```typescript
// packages/store/src/roleStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'

export type AppRole = 'customer' | 'seller' | 'driver'

interface RoleStore {
  // Auth
  userId:       string | null
  accessToken:  string | null
  refreshToken: string | null

  // Active role
  activeRole:   AppRole
  // All roles this user has
  availableRoles: AppRole[]

  // Per-role entity (seller/driver has entity)
  entityId:     string | null
  entityType:   string | null
  entityName:   string | null

  // Actions
  setAuth:          (userId: string, access: string, refresh: string) => void
  setActiveRole:    (role: AppRole) => void
  addRole:          (role: AppRole, entityId?: string) => void
  clearAuth:        () => void
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set, get) => ({
      userId:         null,
      accessToken:    null,
      refreshToken:   null,
      activeRole:     'customer',
      availableRoles: ['customer'],
      entityId:       null,
      entityType:     null,
      entityName:     null,

      setAuth: (userId, accessToken, refreshToken) =>
        set({ userId, accessToken, refreshToken }),

      setActiveRole: (role) => {
        const { availableRoles } = get()
        if (!availableRoles.includes(role)) return
        set({ activeRole: role })
      },

      addRole: (role, entityId) =>
        set(state => ({
          availableRoles: [...new Set([...state.availableRoles, role])],
          ...(entityId ? { entityId } : {}),
        })),

      clearAuth: () => set({
        userId: null, accessToken: null, refreshToken: null,
        activeRole: 'customer', availableRoles: ['customer'],
        entityId: null, entityType: null, entityName: null,
      }),
    }),
    {
      name:    'role-store',
      storage: createJSONStorage(() => ({
        getItem:    (key) => SecureStore.getItemAsync(key),
        setItem:    (key, val) => SecureStore.setItemAsync(key, val),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      })),
    }
  )
)
```

---

## 3. ROOT LAYOUT — Role-based routing

```tsx
// app/_layout.tsx
import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { useRoleStore } from '@/packages/store'

export default function RootLayout() {
  const { userId, activeRole } = useRoleStore()
  const router   = useRouter()
  const segments = useSegments()

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'

    if (!userId && !inAuthGroup) {
      // Not logged in → login
      router.replace('/(auth)/login')
      return
    }

    if (userId && inAuthGroup) {
      // Logged in, redirect to active role
      router.replace(getRoleRoute(activeRole))
      return
    }

    // Role changed → navigate to new role's home
    if (userId && !inAuthGroup) {
      const currentGroup = segments[0]
      const expectedGroup = `(${activeRole})`
      if (currentGroup !== expectedGroup) {
        router.replace(getRoleRoute(activeRole))
      }
    }
  }, [userId, activeRole, segments])

  return <Slot />
}

function getRoleRoute(role: AppRole): string {
  switch (role) {
    case 'customer': return '/(customer)/'
    case 'seller':   return '/(seller)/'
    case 'driver':   return '/(driver)/'
  }
}
```

---

## 4. ROLE SWITCHER COMPONENT — Global FAB / Profile дотор

```tsx
// packages/ui/src/RoleSwitcher.tsx
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native'
import { useRoleStore, AppRole } from '@/packages/store'
import { useRouter } from 'expo-router'

const ROLE_CONFIG: Record<AppRole, {
  label:       string
  sublabel:    string
  icon:        string
  color:       string
  bgColor:     string
}> = {
  customer: {
    label:    'Хэрэглэгч',
    sublabel: 'Бараа хайх, захиалах',
    icon:     '🛍',
    color:    '#3B82F6',
    bgColor:  'rgba(59,130,246,0.15)',
  },
  seller: {
    label:    'Борлуулагч',
    sublabel: 'Захиалга авах, бараа удирдах',
    icon:     '🏪',
    color:    '#22C55E',
    bgColor:  'rgba(34,197,94,0.15)',
  },
  driver: {
    label:    'Жолооч',
    sublabel: 'Хүргэлтийн даалгавар',
    icon:     '🚚',
    color:    '#F59E0B',
    bgColor:  'rgba(245,158,11,0.15)',
  },
}

interface RoleSwitcherProps {
  visible:   boolean
  onClose:   () => void
}

export function RoleSwitcher({ visible, onClose }: RoleSwitcherProps) {
  const { activeRole, availableRoles, setActiveRole } = useRoleStore()
  const router = useRouter()

  const handleSwitch = (role: AppRole) => {
    setActiveRole(role)
    onClose()
    // Navigation handled by root layout useEffect
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
        onPress={onClose}
      >
        <View style={{
          position:        'absolute',
          bottom:          0,
          left:            0,
          right:           0,
          backgroundColor: '#1A1A1A',
          borderTopLeftRadius:  24,
          borderTopRightRadius: 24,
          padding:         24,
          paddingBottom:   40,
        }}>
          {/* Handle bar */}
          <View style={{
            width:           40, height: 4,
            backgroundColor: '#3D3D3D',
            borderRadius:    99,
            alignSelf:       'center',
            marginBottom:    20,
          }} />

          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 16 }}>
            Роль солих
          </Text>

          {/* Available roles */}
          {availableRoles.map(role => {
            const cfg       = ROLE_CONFIG[role]
            const isActive  = role === activeRole

            return (
              <TouchableOpacity
                key={role}
                onPress={() => handleSwitch(role)}
                activeOpacity={0.7}
                style={{
                  flexDirection:  'row',
                  alignItems:     'center',
                  gap:            12,
                  padding:        14,
                  borderRadius:   12,
                  marginBottom:   8,
                  backgroundColor: isActive ? cfg.bgColor : '#2A2A2A',
                  borderWidth:     isActive ? 1.5 : 0.5,
                  borderColor:     isActive ? cfg.color : '#3D3D3D',
                }}
              >
                <View style={{
                  width:           44, height: 44,
                  borderRadius:    12,
                  backgroundColor: cfg.bgColor,
                  alignItems:      'center',
                  justifyContent:  'center',
                }}>
                  <Text style={{ fontSize: 22 }}>{cfg.icon}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize:   14,
                    fontWeight: '600',
                    color:      isActive ? cfg.color : '#fff',
                  }}>
                    {cfg.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#A0A0A0', marginTop: 2 }}>
                    {cfg.sublabel}
                  </Text>
                </View>

                {isActive && (
                  <View style={{
                    width:           22, height: 22,
                    borderRadius:    11,
                    backgroundColor: cfg.color,
                    alignItems:      'center',
                    justifyContent:  'center',
                  }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}

          {/* Add new role */}
          {availableRoles.length < 3 && (
            <TouchableOpacity
              onPress={() => { onClose(); router.push('/become-seller') }}
              style={{
                flexDirection:   'row',
                alignItems:      'center',
                gap:             12,
                padding:         14,
                borderRadius:    12,
                marginTop:       4,
                borderWidth:     0.5,
                borderColor:     '#3D3D3D',
                borderStyle:     'dashed',
              }}
            >
              <View style={{
                width:           44, height: 44,
                borderRadius:    12,
                backgroundColor: '#2A2A2A',
                alignItems:      'center',
                justifyContent:  'center',
              }}>
                <Text style={{ fontSize: 20, color: '#E8242C' }}>+</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#E8242C', fontWeight: '600' }}>
                Борлуулагч / Жолооч болох
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Modal>
  )
}
```

---

## 5. ROLE INDICATOR — Tab bar дотор харагдах идэвхтэй роль

```tsx
// packages/ui/src/RoleIndicatorBadge.tsx
// Shown in profile tab + header

export function RoleIndicatorBadge() {
  const { activeRole } = useRoleStore()
  const cfg = ROLE_CONFIG[activeRole]

  return (
    <View style={{
      flexDirection:   'row',
      alignItems:      'center',
      gap:             5,
      backgroundColor: cfg.bgColor,
      paddingHorizontal: 10,
      paddingVertical:   4,
      borderRadius:    99,
      borderWidth:     0.5,
      borderColor:     cfg.color,
    }}>
      <Text style={{ fontSize: 11 }}>{cfg.icon}</Text>
      <Text style={{ fontSize: 11, fontWeight: '600', color: cfg.color }}>
        {cfg.label}
      </Text>
    </View>
  )
}
```

---

## 6. TAB NAVIGATORS — per role

```tsx
// app/(customer)/_layout.tsx
import { Tabs } from 'expo-router'
import { RoleHeaderButton } from '@/packages/ui'

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle:            { backgroundColor: '#1A1A1A', borderTopColor: '#3D3D3D' },
        tabBarActiveTintColor:  '#E8242C',
        tabBarInactiveTintColor:'#A0A0A0',
        headerStyle:            { backgroundColor: '#0A0A0A' },
        headerTintColor:        '#fff',
        headerRight: () => <RoleHeaderButton />,  // Opens RoleSwitcher
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Нүүр',    tabBarIcon: ({ color }) => <HomeIcon color={color} /> }} />
      <Tabs.Screen name="search"   options={{ title: 'Хайлт',   tabBarIcon: ({ color }) => <SearchIcon color={color} /> }} />
      <Tabs.Screen name="cart"     options={{ title: 'Сагс',    tabBarIcon: ({ color }) => <CartIcon color={color} /> }} />
      <Tabs.Screen name="orders"   options={{ title: 'Захиалга',tabBarIcon: ({ color }) => <OrderIcon color={color} /> }} />
      <Tabs.Screen name="profile"  options={{ title: 'Профайл', tabBarIcon: ({ color }) => <UserIcon color={color} /> }} />
    </Tabs>
  )
}

// app/(seller)/_layout.tsx
export default function SellerTabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#22C55E', /* seller green */ ...commonOptions }}>
      <Tabs.Screen name="index"     options={{ title: 'Тойм' }} />
      <Tabs.Screen name="orders"    options={{ title: 'Захиалга' }} />
      <Tabs.Screen name="products"  options={{ title: 'Бараа' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Тайлан' }} />
      <Tabs.Screen name="settings"  options={{ title: 'Тохиргоо' }} />
    </Tabs>
  )
}

// app/(driver)/_layout.tsx
export default function DriverTabsLayout() {
  const { isOnline, toggleOnline } = useDriverStore()

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#F59E0B', /* driver amber */ ...commonOptions }}>
      <Tabs.Screen name="index"   options={{ title: 'Хүргэлт',
        tabBarIcon: ({ color }) => <TruckIcon color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Түүх' }} />
      <Tabs.Screen name="earnings"options={{ title: 'Орлого' }} />
    </Tabs>
  )
}
```

---

## 7. ROLE HEADER BUTTON — Хялбар шилжих товч

```tsx
// packages/ui/src/RoleHeaderButton.tsx
import { TouchableOpacity, View, Text } from 'react-native'
import { useState } from 'react'
import { useRoleStore } from '@/packages/store'
import { RoleSwitcher } from './RoleSwitcher'

export function RoleHeaderButton() {
  const [open, setOpen] = useState(false)
  const { activeRole, availableRoles } = useRoleStore()
  const cfg = ROLE_CONFIG[activeRole]

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          flexDirection:   'row',
          alignItems:      'center',
          gap:             6,
          marginRight:     12,
          backgroundColor: cfg.bgColor,
          paddingHorizontal: 10,
          paddingVertical:   6,
          borderRadius:    20,
          borderWidth:     0.5,
          borderColor:     cfg.color,
        }}
      >
        <Text style={{ fontSize: 14 }}>{cfg.icon}</Text>
        <Text style={{ fontSize: 12, color: cfg.color, fontWeight: '600' }}>
          {cfg.label}
        </Text>
        {/* Indicator dot if has multiple roles */}
        {availableRoles.length > 1 && (
          <View style={{
            width:           7, height: 7,
            borderRadius:    4,
            backgroundColor: '#E8242C',
          }} />
        )}
      </TouchableOpacity>

      <RoleSwitcher visible={open} onClose={() => setOpen(false)} />
    </>
  )
}
```

---

## 8. AUTH FLOW — Login + role detection

```tsx
// app/(auth)/login.tsx
export default function LoginScreen() {
  const [step, setStep]   = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const router            = useRouter()
  const { setAuth, addRole } = useRoleStore()

  const handleVerified = async (userId: string, tokens: Tokens) => {
    setAuth(userId, tokens.access, tokens.refresh)

    // Fetch user's roles from API
    const roles = await api.auth.getUserRoles(userId)
    // roles = [{ role: 'customer' }, { role: 'seller', entityId: 'xxx' }, ...]

    roles.forEach(r => addRole(r.role, r.entityId))

    // If only customer → skip role select, go to feed
    if (roles.length === 1 && roles[0].role === 'customer') {
      router.replace('/(customer)/')
      return
    }

    // Multiple roles → show role picker once
    router.replace('/(auth)/onboarding')
  }

  // ... OTP login UI
}

// app/(auth)/onboarding.tsx — Role picker on first login with multiple roles
export default function OnboardingScreen() {
  const { availableRoles, setActiveRole } = useRoleStore()
  const router = useRouter()

  const handleSelect = (role: AppRole) => {
    setActiveRole(role)
    router.replace(getRoleRoute(role))
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 }}>
        Сайн байна уу!
      </Text>
      <Text style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 32 }}>
        Та ямар горимоор нэвтрэх вэ?
      </Text>

      {availableRoles.map(role => {
        const cfg = ROLE_CONFIG[role]
        return (
          <TouchableOpacity key={role} onPress={() => handleSelect(role)}
            style={{
              flexDirection:   'row',
              alignItems:      'center',
              gap:             14,
              padding:         18,
              borderRadius:    16,
              marginBottom:    12,
              backgroundColor: '#1A1A1A',
              borderWidth:     0.5,
              borderColor:     '#3D3D3D',
            }}
          >
            <View style={{
              width: 52, height: 52, borderRadius: 14,
              backgroundColor: cfg.bgColor,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 26 }}>{cfg.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>{cfg.label}</Text>
              <Text style={{ fontSize: 13, color: '#A0A0A0', marginTop: 2 }}>{cfg.sublabel}</Text>
            </View>
            <Text style={{ color: '#555', fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )
      })}

      <Text style={{ fontSize: 11, color: '#555', textAlign: 'center', marginTop: 16 }}>
        Дараа нь профайл дотроос солих боломжтой
      </Text>
    </View>
  )
}
```

---

## 9. API — User roles endpoint

```typescript
// app/api/auth/roles/route.ts (web backend)

export async function GET(req: Request) {
  const userId = await requireAuth(req)

  const user = await db.user.findUnique({
    where:   { id: userId },
    include: {
      store:        { select: { id: true, name: true, isVerified: true } },
      agent:        { select: { id: true, name: true, isVerified: true } },
      company:      { select: { id: true, name: true, isVerified: true } },
      driverProfile:{ select: { id: true, isActive: true } },
    }
  })

  const roles: Array<{ role: AppRole; entityId?: string; entityName?: string; status?: string }> = [
    { role: 'customer' },  // Always available
  ]

  // Add seller role if any entity exists and is verified
  const entity = user?.store || user?.agent || user?.company
  if (entity?.isVerified) {
    roles.push({
      role:       'seller',
      entityId:   entity.id,
      entityName: entity.name,
      status:     'active',
    })
  } else if (entity && !entity.isVerified) {
    // Entity exists but not verified yet — show as pending
    roles.push({
      role:       'seller',
      entityId:   entity.id,
      entityName: entity.name,
      status:     'pending',
    })
  }

  // Add driver role if approved
  if (user?.driverProfile?.isActive) {
    roles.push({ role: 'driver' })
  }

  return Response.json(roles)
}
```

---

## 10. SHARED SCREENS — Бүх ролд нийтлэг хуудсууд

```tsx
// app/(shared)/notifications.tsx
// Notification type determines display — same screen for all roles
export default function NotificationsScreen() {
  const { activeRole, userId } = useRoleStore()

  const { data } = useQuery({
    queryKey: ['notifications', userId, activeRole],
    queryFn:  () => api.notifications.list({ role: activeRole }),
  })

  // Each notification has a `role` field — filter by activeRole
  return (
    <FlatList
      data={data?.notifications}
      renderItem={({ item }) => <NotificationItem item={item} />}
    />
  )
}

// app/(shared)/account-settings.tsx
// Profile settings — same for all roles, shows current role info
export default function AccountSettingsScreen() {
  const { activeRole, availableRoles, entityId } = useRoleStore()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  return (
    <ScrollView>
      {/* Current role */}
      <Section title="Идэвхтэй роль">
        <TouchableOpacity onPress={() => setSwitcherOpen(true)}>
          <RoleRow role={activeRole} showChevron />
        </TouchableOpacity>
      </Section>

      {/* All roles */}
      {availableRoles.length > 1 && (
        <Section title="Миний роллууд">
          {availableRoles.map(role => (
            <RoleRow key={role} role={role} isActive={role === activeRole}
              onPress={() => { useRoleStore.getState().setActiveRole(role); setSwitcherOpen(false) }} />
          ))}
        </Section>
      )}

      <Section title="Нэмэлт роль нэмэх">
        <MenuItem icon="store" label="Борлуулагч болох" onPress={() => router.push('/become-seller')} />
        <MenuItem icon="truck" label="Жолооч болох"      onPress={() => router.push('/become-driver')} />
      </Section>

      <RoleSwitcher visible={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </ScrollView>
  )
}
```

---

## 11. BUILD CONFIG — One app, one bundle

```typescript
// app.config.ts
export default ({ config }) => ({
  ...config,
  name:    'Eseller.mn',
  slug:    'eseller-mn',
  version: '1.0.0',

  icon:          './assets/icon.png',   // Single icon
  splash:        { image: './assets/splash.png', backgroundColor: '#0A0A0A' },

  ios: {
    bundleIdentifier: 'mn.eseller.app',
    supportsTablet:    true,
  },
  android: {
    package:           'mn.eseller.app',
    adaptiveIcon:      { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#0A0A0A' },
  },

  plugins: [
    'expo-router',
    'expo-secure-store',
    ['expo-location', { locationAlwaysAndWhenInUsePermission: 'Хүргэлтийн мөрдөлтөд ашиглана.' }],
    ['expo-notifications', { /* push config */ }],
    ['expo-camera', { cameraPermission: 'Баркод скан хийхэд ашиглана.' }],
  ],

  extra: {
    APP_URL:     process.env.APP_URL,
    API_URL:     process.env.API_URL,
    eas:         { projectId: process.env.EAS_PROJECT_ID },
  },
})

// eas.json — Single app, single build
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "aab" },
      "ios":     { "simulator": false }
    }
  }
}
```

---

## 12. DRIVER ONLINE/OFFLINE — Role-specific background task

```typescript
// app/(driver)/index.tsx
// Driver role — online/offline toggle + background location

import { useEffect, useState } from 'react'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'

const BG_LOCATION_TASK = 'DRIVER_LOCATION'

export default function DriverHomeScreen() {
  const [isOnline, setIsOnline] = useState(false)

  const goOnline = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync()
    if (status !== 'granted') return

    await Location.startLocationUpdatesAsync(BG_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 15000,
      distanceInterval: 30,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Eseller хүргэлт — Онлайн',
        notificationBody:  'Байршил илгээгдэж байна',
        notificationColor: '#F59E0B',
      },
    })

    await api.driver.setStatus('ONLINE')
    setIsOnline(true)
  }

  const goOffline = async () => {
    await Location.stopLocationUpdatesAsync(BG_LOCATION_TASK)
    await api.driver.setStatus('OFFLINE')
    setIsOnline(false)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Big online/offline toggle */}
      <TouchableOpacity
        onPress={isOnline ? goOffline : goOnline}
        style={{
          margin:          24,
          padding:         24,
          borderRadius:    20,
          backgroundColor: isOnline ? 'rgba(245,158,11,0.15)' : '#1A1A1A',
          borderWidth:     2,
          borderColor:     isOnline ? '#F59E0B' : '#3D3D3D',
          alignItems:      'center',
        }}
      >
        <View style={{
          width:           80, height: 80,
          borderRadius:    40,
          backgroundColor: isOnline ? '#F59E0B' : '#2A2A2A',
          alignItems:      'center',
          justifyContent:  'center',
          marginBottom:    12,
        }}>
          <TruckIcon size={36} color={isOnline ? '#0A0A0A' : '#555'} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '800', color: isOnline ? '#F59E0B' : '#A0A0A0' }}>
          {isOnline ? 'Онлайн — Хүргэлт авч байна' : 'Оффлайн — Дарж эхлэх'}
        </Text>
      </TouchableOpacity>

      {/* Pending deliveries */}
      {isOnline && <DeliveryQueue />}
    </View>
  )
}
```

---

## ХЭРЭГЖИЛТИЙН ДАРААЛАЛ

```
Долоо хоног 1 — Суурь:
  [ ] Expo Router file structure үүсгэх
  [ ] Zustand role store (persist + SecureStore)
  [ ] Root layout + role-based redirect
  [ ] Login + OTP screen
  [ ] /api/auth/roles endpoint
  [ ] 3 tab navigator (customer / seller / driver)

Долоо хоног 2 — Role switching:
  [ ] RoleSwitcher bottom sheet
  [ ] RoleHeaderButton (header right)
  [ ] Onboarding screen (first login with multiple roles)
  [ ] RoleIndicatorBadge
  [ ] Shared screens: notifications, account-settings

Долоо хоног 3 — Seller mode:
  [ ] Seller dashboard screen
  [ ] Real-time order alerts (WebSocket)
  [ ] Quick product add (camera)
  [ ] Seller → Customer smooth switch test

Долоо хоног 4 — Driver mode:
  [ ] Online/offline toggle + background location
  [ ] Delivery queue screen
  [ ] PIN/Photo confirmation
  [ ] Full E2E role switch test (customer → seller → driver → customer)

Тест:
  [ ] iOS + Android device test
  [ ] Role switch хурд (< 300ms)
  [ ] Background location battery test
  [ ] SecureStore token persistence test
```
