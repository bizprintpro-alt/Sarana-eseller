import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function Icon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return <View style={{ alignItems: 'center', gap: 2 }}><Text style={{ fontSize: 20 }}>{emoji}</Text><Text style={{ fontSize: 9, fontWeight: '600', color: focused ? '#E8242C' : '#555' }}>{label}</Text></View>;
}

export default function DriverTabs() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: '#111111', borderTopColor: '#2A2A2A', height: 64, paddingBottom: 8 }, tabBarShowLabel: false, headerStyle: { backgroundColor: '#111111' }, headerTintColor: '#FFF' }}>
      <Tabs.Screen name="index" options={{ title: 'Хүргэлт', tabBarIcon: ({ focused }) => <Icon emoji="🚚" label="Хүргэлт" focused={focused} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Түүх', tabBarIcon: ({ focused }) => <Icon emoji="📋" label="Түүх" focused={focused} /> }} />
      <Tabs.Screen name="earnings" options={{ title: 'Орлого', tabBarIcon: ({ focused }) => <Icon emoji="💰" label="Орлого" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Профайл', tabBarIcon: ({ focused }) => <Icon emoji="👤" label="Профайл" focused={focused} /> }} />
    </Tabs>
  );
}
