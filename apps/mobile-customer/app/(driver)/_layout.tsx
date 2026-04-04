import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoleHeaderButton from '../components/RoleHeaderButton';

const ACCENT = '#F59E0B';

export default function DriverLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 0.5,
          height: Platform.OS === 'android' ? 80 : 90,
          paddingBottom: Platform.OS === 'android' ? 24 : 30,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        headerStyle: { backgroundColor: '#111111' },
        headerTintColor: '#FFF',
        headerShadowVisible: false,
        headerRight: () => <RoleHeaderButton />,
        headerRightContainerStyle: { paddingRight: 14 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Хүргэлт',
          headerTitle: 'Жолооч',
          tabBarIcon: ({ color }) => <Ionicons name="bicycle-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Түүх',
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Орлого',
          tabBarIcon: ({ color }) => <Ionicons name="wallet-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
