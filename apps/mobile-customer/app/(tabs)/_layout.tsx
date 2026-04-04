import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E8242C',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 0.5,
          height: Platform.OS === 'android' ? 70 : 85,
          paddingBottom: Platform.OS === 'android' ? 16 : 28,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        headerStyle: { backgroundColor: '#111111' },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Нүүр',
        tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
        headerTitle: 'eseller.mn',
        headerTitleStyle: { fontWeight: '900', fontSize: 18 },
      }} />
      <Tabs.Screen name="search" options={{
        title: 'Хайлт',
        tabBarIcon: ({ color }) => <Ionicons name="search" size={22} color={color} />,
      }} />
      <Tabs.Screen name="cart" options={{
        title: 'Сагс',
        tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={24} color={color} />,
      }} />
      <Tabs.Screen name="orders" options={{
        title: 'Захиалга',
        tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={22} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Профайл',
        tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
      }} />
    </Tabs>
  );
}
