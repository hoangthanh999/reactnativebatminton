import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { logout as logoutService } from '@/services/authService';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { user, logout: clearAuthUser } = useAuth();

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                performLogout();
            }
        } else {
            Alert.alert('Xác nhận', 'Bạn có chắc muốn đăng xuất?', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', onPress: performLogout, style: 'destructive' },
            ]);
        }
    };

    const performLogout = async () => {
        await logoutService();
        clearAuthUser();
        // Router sẽ tự động redirect nhờ useEffect trong _layout.tsx
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.fullName?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.fullName || 'User'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <Text style={styles.phone}>{user?.phone}</Text>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>👤</Text>
                    <Text style={styles.menuText}>Thông tin cá nhân</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>🔔</Text>
                    <Text style={styles.menuText}>Thông báo</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>⚙️</Text>
                    <Text style={styles.menuText}>Cài đặt</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <Text style={styles.menuIcon}>🚪</Text>
                    <Text style={[styles.menuText, styles.logoutText]}>Đăng xuất</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 30,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 4,
    },
    phone: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    section: {
        padding: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    menuIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    menuArrow: {
        fontSize: 24,
        color: Colors.textSecondary,
    },
    logoutButton: {
        backgroundColor: Colors.error + '10',
        marginTop: 12,
    },
    logoutText: {
        color: Colors.error,
    },
});
