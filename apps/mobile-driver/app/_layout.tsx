import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#111111' }, headerTintColor: '#FFF', contentStyle: { backgroundColor: '#0A0A0A' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="shipment/[id]" options={{ title: 'Хүргэлт' }} />
        <Stack.Screen name="confirm/[id]" options={{ title: 'Баталгаажуулах', presentation: 'modal' }} />
      </Stack>
    </View>
  );
}
