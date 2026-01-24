// app/(tabs)/profile.tsx - VERSION HOÀN CHỈNH
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/services/authService';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'; // Added import for LinearGradient

export default function ProfileScreen() {
    const { user, logout: logoutContext } = useAuth();
    const router = useRouter();
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const insets = useSafeAreaInsets(); // Added this line

    console.log('USER:', user);
    console.log('ROLE:', user?.role);

    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Bạn có chắc muốn đăng xuất?');
            if (!confirmed) return;
        } else {
            Alert.alert(
                'Đăng xuất',
                'Bạn có chắc muốn đăng xuất?',
                [
                    { text: 'Hủy', style: 'cancel' },
                    {
                        text: 'Đăng xuất',
                        style: 'destructive',
                        onPress: async () => {
                            await performLogout();
                        },
                    },
                ],
            );
            return;
        }

        await performLogout();
    };

    const performLogout = async () => {
        try {
            await logout();
            logoutContext();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <LinearGradient // Changed View to LinearGradient
                colors={[Colors.primary, '#4c669f']} // Added colors for gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 20 }]} // Added paddingTop using insets
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.fullName?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </View>
                <Text style={styles.name}>{user?.fullName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {user?.role === 'ADMIN' ? '👑 Admin' :
                            user?.role === 'OWNER' ? '🏢 Chủ sân' : '👤 Người dùng'}
                    </Text>
                </View>
            </LinearGradient> {/* Changed View to LinearGradient */}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Admin Menu - Chỉ hiện cho ADMIN và OWNER */}
                {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quản trị</Text>
                        <View style={styles.menuCard}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => router.push('/admin' as any)}
                            >
                                <Text style={styles.menuIcon}>⚙️</Text>
                                <Text style={styles.menuText}>Trang quản trị</Text>
                                <Text style={styles.menuArrow}>›</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tài khoản</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuIcon}>👤</Text>
                            <Text style={styles.menuText}>Thông tin cá nhân</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => setShowChangePasswordModal(true)}
                        >
                            <Text style={styles.menuIcon}>🔒</Text>
                            <Text style={styles.menuText}>Đổi mật khẩu</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cài đặt</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuIcon}>🔔</Text>
                            <Text style={styles.menuText}>Thông báo</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuIcon}>🌐</Text>
                            <Text style={styles.menuText}>Ngôn ngữ</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuIcon}>❓</Text>
                            <Text style={styles.menuText}>Trợ giúp</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Change Password Modal */}
            <ChangePasswordModal
                visible={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        // paddingTop: 60, // Removed this line as it's now handled by insets
        paddingBottom: 30,
        paddingHorizontal: 24,
        // backgroundColor: Colors.primary, // Removed this line as LinearGradient handles background
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        fontSize: 32,
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
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 12,
        color: Colors.white,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    menuCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.surface,
    },
    menuIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    menuArrow: {
        fontSize: 24,
        color: Colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginHorizontal: 16,
    },
    logoutButton: {
        backgroundColor: Colors.error,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
    },
});
