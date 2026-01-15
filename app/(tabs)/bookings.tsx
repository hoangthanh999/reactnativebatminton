// app/(tabs)/bookings.tsx
import BookingCard from '@/components/bookings/BookingCard';
import { Colors } from '@/constants/Colors';
import { Booking, bookingService } from '@/services/bookingService';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type FilterType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export default function BookingsScreen() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('ALL');

    const loadBookings = useCallback(async (isRefresh = false) => {
        try {
            console.log('🔄 Loading bookings...');

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await bookingService.getMyBookings(0, 50);

            console.log('📥 Bookings response:', response);

            if (response.success) {
                setBookings(response.data.content);
                console.log('✅ Loaded', response.data.content.length, 'bookings');
            }
        } catch (error: any) {
            console.error('❌ Load bookings error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đặt sân');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // ✅ SỬA: Dùng useFocusEffect thay vì useEffect
    useFocusEffect(
        useCallback(() => {
            console.log('👁️ Bookings screen focused, loading data...');
            loadBookings();
        }, [loadBookings])
    );

    const onRefresh = useCallback(() => {
        loadBookings(true);
    }, [loadBookings]);

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'ALL') return true;
        return booking.status === filter;
    });

    const filters = [
        { key: 'ALL' as FilterType, label: 'Tất cả', count: bookings.length },
        { key: 'PENDING' as FilterType, label: 'Chờ xác nhận', count: bookings.filter(b => b.status === 'PENDING').length },
        { key: 'CONFIRMED' as FilterType, label: 'Đã xác nhận', count: bookings.filter(b => b.status === 'CONFIRMED').length },
        { key: 'COMPLETED' as FilterType, label: 'Hoàn thành', count: bookings.filter(b => b.status === 'COMPLETED').length },
        { key: 'CANCELLED' as FilterType, label: 'Đã hủy', count: bookings.filter(b => b.status === 'CANCELLED').length },
    ];

    const handleBookingPress = (bookingId: number) => {
        router.push({
            pathname: '/bookings/[id]',
            params: { id: bookingId }
        } as any);
    };

    if (loading && bookings.length === 0) {
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
                <Text style={styles.headerTitle}>Lịch sử đặt sân</Text>
                <Text style={styles.headerSubtitle}>
                    {filteredBookings.length} lịch đặt
                </Text>
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {filters.map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                            styles.filterChip,
                            filter === item.key && styles.filterChipActive,
                        ]}
                        onPress={() => setFilter(item.key)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === item.key && styles.filterTextActive,
                            ]}
                        >
                            {item.label} ({item.count})
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Bookings List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.bookingsContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                    />
                }
            >
                {filteredBookings.map((booking) => (
                    <BookingCard
                        key={booking.id}
                        {...booking}
                        onPress={() => handleBookingPress(booking.id)}
                    />
                ))}

                {filteredBookings.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyText}>Chưa có lịch đặt sân nào</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => router.push('/(tabs)/courts' as any)}
                        >
                            <Text style={styles.emptyButtonText}>Đặt sân ngay</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

// Styles giữ nguyên
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
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    filtersContainer: {
        maxHeight: 50,
        marginVertical: 16,
    },
    filtersContent: {
        paddingHorizontal: 24,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    filterTextActive: {
        color: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    bookingsContainer: {
        padding: 24,
        paddingBottom: 100,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
