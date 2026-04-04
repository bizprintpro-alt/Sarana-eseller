import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { RoleProvider, useRoleStore, AppRole } from './lib/roleStore';

function RootNavigator() {
  const { activeRole } = useRoleStore();
  const router = useRouter();
  const segments = useSegments();
  const prevRole = useRef<AppRole>(activeRole);

  useEffect(() => {
    if (prevRole.current !== activeRole) {
      prevRole.current = activeRole;
      const target =
        activeRole === 'seller'
          ? '/(seller)'
          : activeRole === 'driver'
            ? '/(driver)'
            : '/(tabs)';
      router.replace(target as any);
    }
  }, [activeRole]);

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
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Бараа' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Захиалга' }} />
        <Stack.Screen name="checkout/index" options={{ title: 'Төлбөр', presentation: 'modal' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <RoleProvider>
      <RootNavigator />
    </RoleProvider>
  );
}
