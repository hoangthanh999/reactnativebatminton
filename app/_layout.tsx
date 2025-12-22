import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(auth)';

      console.log('📍 Navigation check:', {
        isAuthenticated,
        inAuthGroup,
        segments,
      });

      if (!isAuthenticated && !inAuthGroup) {
        // Chưa login → redirect về login
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        // Đã login → redirect về tabs
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
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
