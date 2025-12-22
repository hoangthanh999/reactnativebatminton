import { Colors } from '@/constants/Colors';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={styles.container}>
                <Text style={styles.title}>404</Text>
                <Text style={styles.subtitle}>Trang không tồn tại</Text>
                <Link href="/(tabs)" style={styles.link}>
                    <Text style={styles.linkText}>← Về trang chủ</Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: Colors.background,
    },
    title: {
        fontSize: 80,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 20,
        color: Colors.text,
        marginBottom: 32,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '600',
    },
});
