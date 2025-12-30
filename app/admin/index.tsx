// app/admin/index.tsx
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        todayRevenue: 0,
        monthRevenue: 0,
    });

    // app/admin/index.tsx - Sửa hàm loadStats

    const loadStats = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            // ✅ SỬA: Dùng getAllBookings thay vì getOwnerBookings
            const response = await bookingService.getAllBookings(0, 1000);

            if (response.success) {
                const bookings = response.data.content;

                // Calculate stats
                const today = new Date().toISOString().split('T')[0];
                const currentMonth = new Date().getMonth();

                const todayBookings = bookings.filter((b: any) =>
                    b.bookingDate === today
                );

                const monthBookings = bookings.filter((b: any) => {
                    const bookingMonth = new Date(b.bookingDate).getMonth();
                    return bookingMonth === currentMonth;
                });

                setStats({
                    totalBookings: bookings.length,
                    pendingBookings: bookings.filter((b: any) => b.status === 'PENDING').length,
                    confirmedBookings: bookings.filter((b: any) => b.status === 'CONFIRMED').length,
                    completedBookings: bookings.filter((b: any) => b.status === 'COMPLETED').length,
                    cancelledBookings: bookings.filter((b: any) => b.status === 'CANCELLED').length,
                    todayRevenue: todayBookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0),
                    monthRevenue: monthBookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0),
                });
            }
        } catch (error) {
            console.error('Load stats error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);


    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const onRefresh = useCallback(() => {
        loadStats(true);
    }, [loadStats]);

    const statsData = [
        {
            icon: '📊',
            label: 'Tổng đặt sân',
            value: stats.totalBookings.toString(),
            color: Colors.primary,
            onPress: () => router.push('/admin/bookings'),
        },
        {
            icon: '⏳',
            label: 'Chờ xác nhận',
            value: stats.pendingBookings.toString(),
            color: Colors.warning,
            onPress: () => router.push('/admin/bookings'),
        },
        {
            icon: '✓',
            label: 'Đã xác nhận',
            value: stats.confirmedBookings.toString(),
            color: Colors.success,
            onPress: () => router.push('/admin/bookings'),
        },
        {
            icon: '✓',
            label: 'Hoàn thành',
            value: stats.completedBookings.toString(),
            color: Colors.secondary,
            onPress: () => router.push('/admin/bookings'),
        },
    ];

    const revenueData = [
        {
            icon: '💰',
            label: 'Doanh thu hôm nay',
            value: stats.todayRevenue.toLocaleString('vi-VN') + 'đ',
            color: Colors.success,
        },
        {
            icon: '📈',
            label: 'Doanh thu tháng này',
            value: stats.monthRevenue.toLocaleString('vi-VN') + 'đ',
            color: Colors.primary,
        },
    ];

    const quickActions = [
        {
            icon: '✓',
            label: 'Xác nhận đặt sân',
            color: Colors.success,
            onPress: () => router.push('/admin/bookings'),
        },
        {
            icon: '🏸',
            label: 'Quản lý sân',
            color: Colors.primary,
            onPress: () => router.push('/courts'),
        },
        {
            icon: '👥',
            label: 'Quản lý user',
            color: Colors.secondary,
            onPress: () => router.push('/'),
        },
        {
            icon: '📊',
            label: 'Báo cáo',
            color: Colors.warning,
            onPress: () => alert('Tính năng đang phát triển'),
        },
    ];

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào Admin 👋</Text>
                    <Text style={styles.userName}>{user?.fullName}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.fullName?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                    />
                }
            >
                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.quickActionCard}
                                onPress={action.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                                    <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                                </View>
                                <Text style={styles.quickActionLabel}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thống kê đặt sân</Text>
                    <View style={styles.statsGrid}>
                        {statsData.map((stat, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={stat.onPress}
                                activeOpacity={0.7}
                            >
                                <Card variant="elevated" style={styles.statCard}>
                                    <Text style={styles.statIcon}>{stat.icon}</Text>
                                    <Text style={[styles.statValue, { color: stat.color }]}>
                                        {stat.value}
                                    </Text>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Revenue */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Doanh thu</Text>
                    {revenueData.map((item, index) => (
                        <Card key={index} variant="elevated" style={styles.revenueCard}>
                            <View style={styles.revenueIcon}>
                                <Text style={styles.revenueEmoji}>{item.icon}</Text>
                            </View>
                            <View style={styles.revenueInfo}>
                                <Text style={styles.revenueLabel}>{item.label}</Text>
                                <Text style={[styles.revenueValue, { color: item.color }]}>
                                    {item.value}
                                </Text>
                            </View>
                        </Card>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    greeting: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
        marginTop: 4,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionCard: {
        width: (width - 60) / 2,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    quickActionEmoji: {
        fontSize: 28,
    },
    quickActionLabel: {
        fontSize: 14,
        color: Colors.text,
        textAlign: 'center',
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: (width - 60) / 2,
        alignItems: 'center',
        padding: 16,
    },
    statIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    revenueCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
    },
    revenueIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    revenueEmoji: {
        fontSize: 28,
    },
    revenueInfo: {
        flex: 1,
    },
    revenueLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    revenueValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
