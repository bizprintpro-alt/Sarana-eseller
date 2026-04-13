import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { RoleProvider, useRoleStore, AppRole } from './lib/roleStore';
import { CartProvider } from './lib/cartStore';
import { registerPushToken, getDeepLinkFromNotification } from './lib/notifications';

function RootNavigator() {
  const { activeRole, userId } = useRoleStore();
  const router = useRouter();
  const segments = useSegments();
  const prevRole = useRef<AppRole>(activeRole);

  // Role switching navigation
  useEffect(() => {
    if (prevRole.current !== activeRole) {
      prevRole.current = activeRole;
      const target =
        activeRole === 'seller'
          ? '/(seller)'
          : activeRole === 'driver'
            ? '/(driver)'
            : activeRole === 'pos'
              ? '/(pos)'
              : activeRole === 'owner' as any
                ? '/(owner)'
                : '/(tabs)';
      router.replace(target as any);
    }
  }, [activeRole]);

  // Push notifications
  useEffect(() => {
    if (userId) {
      registerPushToken();
    }

    // Handle notification tap → deep link
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const link = getDeepLinkFromNotification(response.notification);
      if (link) {
        router.push(link as any);
      }
    });

    return () => subscription.remove();
  }, [userId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <StatusBar style="light" backgroundColor="#0A0A0A" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#111111' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700', fontSize: 16 },
          contentStyle: { backgroundColor: '#0A0A0A' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(seller)" options={{ headerShown: false }} />
        <Stack.Screen name="(driver)" options={{ headerShown: false }} />
        <Stack.Screen name="(pos)" options={{ headerShown: false }} />
        <Stack.Screen name="(owner)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(customer)/flash-sale" options={{ title: 'Flash Sale 🔥' }} />
        <Stack.Screen name="(customer)/addresses" options={{ title: 'Хүргэлтийн хаяг' }} />
        <Stack.Screen name="(customer)/returns" options={{ title: 'Буцаалт & Баргаан' }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Бараа' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Захиалга' }} />
        <Stack.Screen name="checkout/index" options={{ title: 'Төлбөр', presentation: 'modal' }} />
        <Stack.Screen name="confirm/[id]" options={{ title: 'Баталгаажуулах', presentation: 'modal' }} />
        <Stack.Screen name="chat/[roomId]" options={{ title: 'Чат' }} />
        <Stack.Screen name="(seller)/product/new" options={{ title: 'Бараа нэмэх' }} />
        <Stack.Screen name="(seller)/product/[id]/edit" options={{ title: 'Бараа засах' }} />
        <Stack.Screen name="(seller)/order/[id]" options={{ title: 'Захиалга' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <RoleProvider>
      <CartProvider>
        <RootNavigator />
      </CartProvider>
    </RoleProvider>
  );
}
