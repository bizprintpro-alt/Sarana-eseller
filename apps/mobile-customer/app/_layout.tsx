import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
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
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Бараа' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Захиалга' }} />
        <Stack.Screen name="checkout/index" options={{ title: 'Төлбөр', presentation: 'modal' }} />
      </Stack>
    </View>
  );
}
