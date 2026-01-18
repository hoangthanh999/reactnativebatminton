// app/admin/_layout.tsx
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Text } from 'react-native';

export default function AdminLayout() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập');
            router.replace('/(auth)/login');
            return;
        }

        if (user?.role !== 'ADMIN' && user?.role !== 'OWNER') {
            Alert.alert('Lỗi', 'Bạn không có quyền truy cập trang này');
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, user, router]);

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
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size }}>📊</Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Đặt sân',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size }}>📋</Text>
                    ),
                }}
            />
            {/* Quan trọng: name phải là "courts" không có gì khác */}
            <Tabs.Screen
                name="courts"
                options={{
                    title: 'Quản lý sân',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size }}>🏸</Text>
                    ),
                    headerShown: false, // Để Stack tự quản lý header
                }}
            />
        </Tabs>
    );
}