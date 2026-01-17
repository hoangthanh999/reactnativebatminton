// app/admin/courts/_layout.tsx
import { Stack } from 'expo-router';

export default function CourtsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // ✅ Tắt header mặc định
            }}
        >
            {/* Tùy chỉnh từng screen nếu cần */}
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="add"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="edit/[id]"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}