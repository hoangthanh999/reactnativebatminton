// app/_layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { isAuthenticated } from '@/services/authService';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 Checking auth... Segments:', segments);
      const authenticated = await isAuthenticated();
      console.log('🔐 Authenticated:', authenticated);

      const inAuthGroup = segments[0] === '(auth)';
      console.log('📍 In auth group:', inAuthGroup);

      if (!authenticated && !inAuthGroup) {
        console.log('➡️ Redirecting to login...');
        router.replace('/(auth)/login');
      } else if (authenticated && inAuthGroup) {
        console.log('➡️ Redirecting to tabs...');
        router.replace('/(tabs)');
      }

      setIsReady(true);
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setIsReady(true);
    }
  }, [segments, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="admin" /> {/* ✅ Không có dấu ngoặc */}
      <Stack.Screen name="courts/[id]" />
      <Stack.Screen name="bookings/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
