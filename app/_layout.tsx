// app/_layout.tsx
import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import * as Linking from 'expo-linking'; // ← THÊM
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // ✅ THÊM: Xử lý deep linking
  useEffect(() => {
    // Xử lý deep link khi app đang mở
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('📱 Deep link received:', url);
      handleDeepLink(url);
    });

    // Xử lý deep link khi app được mở từ link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('📱 Initial URL:', url);
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // ✅ THÊM: Hàm xử lý deep link
  const handleDeepLink = (url: string) => {
    try {
      const { hostname, path, queryParams } = Linking.parse(url);

      console.log('🔍 Parsed URL:', { hostname, path, queryParams });

      // Xử lý VNPay callback
      if (hostname === 'payment-callback' || path === 'payment-callback') {
        console.log('💳 VNPay callback detected');
        router.push({
          pathname: '/payment-callback',
          params: queryParams as any
        });
      }
      // Xử lý MoMo callback
      else if (hostname === 'momo-callback' || path === 'momo-callback') {
        console.log('💰 MoMo callback detected');
        router.push({
          pathname: '/payment-callback',
          params: queryParams as any
        });
      }
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
    }
  };

  // Auth navigation logic
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      console.log('➡️ Redirecting to tabs...');
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      console.log('➡️ Redirecting to login...');
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="courts/[id]" />
      <Stack.Screen name="bookings/[id]" />

      {/* ✅ THÊM: Payment callback screen */}
      <Stack.Screen
        name="payment-callback"
        options={{
          headerShown: true,
          title: 'Kết quả thanh toán',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackVisible: false,
          presentation: 'modal'
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootLayoutNav />
      </CartProvider>
    </AuthProvider>
  );
}
