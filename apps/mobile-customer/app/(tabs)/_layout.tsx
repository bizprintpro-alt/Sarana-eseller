import { Tabs } from 'expo-router';
import { Home, Search, ShoppingCart, ClipboardList, User } from 'lucide-react-native';

const BRAND = '#E8242C';
const MUTED = '#555555';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        headerStyle: { backgroundColor: '#111111' },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Нүүр',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: 'eseller.mn',
          headerTitleStyle: { fontWeight: '900', fontSize: 18 },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Хайлт',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Сагс',
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Захиалга',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профайл',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
