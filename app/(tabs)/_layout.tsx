// app/(tabs)/_layout.tsx
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="courts"
        options={{
          title: 'Sân',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🏸</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"  // ← THÊM MỚI
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🤖</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Cửa hàng',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🛍️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Lịch đặt',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
