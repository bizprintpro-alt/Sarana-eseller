import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{ fontSize: 9, fontWeight: '600', color: focused ? '#E8242C' : '#555' }}>{label}</Text>
    </View>
  );
}

export default function SellerTabs() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#E8242C', tabBarInactiveTintColor: '#555',
      tabBarStyle: { backgroundColor: '#111111', borderTopColor: '#2A2A2A', height: 64, paddingBottom: 8 },
      tabBarShowLabel: false,
      headerStyle: { backgroundColor: '#111111' }, headerTintColor: '#FFF', headerShadowVisible: false,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Самбар', tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Самбар" focused={focused} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Захиалга', tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Захиалга" focused={focused} /> }} />
      <Tabs.Screen name="products" options={{ title: 'Бараа', tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Бараа" focused={focused} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Чат', tabBarIcon: ({ focused }) => <TabIcon emoji="💬" label="Чат" focused={focused} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Тохиргоо', tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="Тохиргоо" focused={focused} /> }} />
    </Tabs>
  );
}
