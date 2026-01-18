import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function ShopLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: 'Cửa hàng' }} />
        </Stack>
    );
}
