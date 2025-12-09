import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';


export default function ProfileScreen() {
    type MenuItem = {
        icon: string;
        label: string;
        action: () => void;

        badge?: string | number;
        value?: string | number;
        toggle?: boolean;
    };
    type MenuSection = {
        section: string;
        items: MenuItem[];
    };
    const menuItems: MenuSection[] = [
        {
            section: 'Tài khoản',
            items: [
                { icon: '👤', label: 'Thông tin cá nhân', action: () => { } },
                { icon: '🔒', label: 'Đổi mật khẩu', action: () => { } },
                { icon: '🔔', label: 'Thông báo', action: () => { }, badge: '3' },
            ],
        },
        {
            section: 'Quản lý',
            items: [
                { icon: '🏸', label: 'Quản lý sân', action: () => router.push('/courts') },
                { icon: '💰', label: 'Quản lý giá', action: () => { } },
                { icon: '📊', label: 'Báo cáo & Thống kê', action: () => { } },
                { icon: '👥', label: 'Quản lý khách hàng', action: () => { } },
            ],
        },
        {
            section: 'Cài đặt',
            items: [
                { icon: '🌙', label: 'Giao diện tối', action: () => { }, toggle: true },
                { icon: '🌐', label: 'Ngôn ngữ', action: () => { }, value: 'Tiếng Việt' },
                { icon: '❓', label: 'Trợ giúp & Hỗ trợ', action: () => { } },
                { icon: 'ℹ️', label: 'Về ứng dụng', action: () => { } },
            ],
        },
    ];

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => router.replace('/(auth)/login'),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileInfo}>
                    <Avatar name="Admin User" size={80} />
                    <Text style={styles.name}>Quản lý sân</Text>
                    <Text style={styles.email}>admin@badminton.com</Text>

                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>✏️ Chỉnh sửa hồ sơ</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>156</Text>
                        <Text style={styles.statLabel}>Khách hàng</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Sân</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>89</Text>
                        <Text style={styles.statLabel}>Đặt sân</Text>
                    </View>
                </View>

                {/* Menu Sections */}
                {menuItems.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.section}</Text>
                        <Card variant="elevated" style={styles.menuCard}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={itemIndex}
                                    style={[
                                        styles.menuItem,
                                        itemIndex !== section.items.length - 1 && styles.menuItemBorder,
                                    ]}
                                    onPress={item.action}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <Text style={styles.menuIcon}>{item.icon}</Text>
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                    </View>
                                    <View style={styles.menuItemRight}>
                                        {item.badge && (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{item.badge}</Text>
                                            </View>
                                        )}
                                        {item.value && (
                                            <Text style={styles.menuValue}>{item.value}</Text>
                                        )}
                                        <Text style={styles.menuArrow}>›</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </Card>
                    </View>
                ))}

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <Button
                        title="Đăng xuất"
                        onPress={handleLogout}
                        variant="outline"
                        icon={<Text style={styles.logoutIcon}>🚪</Text>}
                    />
                </View>

                <Text style={styles.version}>Phiên bản 1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 24,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileInfo: {
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
        marginTop: 16,
    },
    email: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    editButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    editButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        marginHorizontal: 24,
        marginTop: -20,
        borderRadius: 16,
        padding: 20,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: Colors.border,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    menuCard: {
        padding: 0,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    menuLabel: {
        fontSize: 16,
        color: Colors.text,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        backgroundColor: Colors.error,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    menuValue: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    menuArrow: {
        fontSize: 24,
        color: Colors.textSecondary,
    },
    logoutContainer: {
        paddingHorizontal: 24,
        marginTop: 24,
        marginBottom: 16,
    },
    logoutIcon: {
        fontSize: 20,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 32,
    },
});
