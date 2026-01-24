// app/(admin)/bookings.tsx
import BookingCard from '@/components/bookings/BookingCard';
import { Colors } from '@/constants/Colors';
import { Booking, bookingService } from '@/services/bookingService';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export default function AdminBookingsScreen() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('ALL');
    const insets = useSafeAreaInsets();

    // app/admin/bookings.tsx - Sửa hàm loadBookings

    const loadBookings = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            // ✅ SỬA: Dùng getAllBookings thay vì getOwnerBookings
            const response = await bookingService.getAllBookings(0, 100);

            if (response.success) {
                setBookings(response.data.content);
            }
        } catch (error: any) {
            console.error('Load bookings error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đặt sân');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);


    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const onRefresh = useCallback(() => {
        loadBookings(true);
    }, [loadBookings]);

    const handleConfirmBooking = async (bookingId: number) => {
        Alert.alert(
            'Xác nhận',
            'Xác nhận đặt sân này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        try {
                            const response = await bookingService.updateBookingStatus(
                                bookingId,
                                'CONFIRMED'
                            );

                            if (response.success) {
                                Alert.alert('Thành công', 'Đã xác nhận đặt sân');
                                loadBookings(true);
                            }
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xác nhận');
                        }
                    },
                },
            ]
        );
    };

    const handleCancelBooking = async (bookingId: number) => {
        Alert.alert(
            'Hủy đặt sân',
            'Bạn có chắc muốn hủy đặt sân này?',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bookingService.cancelBooking(bookingId);
                            Alert.alert('Thành công', 'Đã hủy đặt sân');
                            loadBookings(true);
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể hủy');
                        }
                    },
                },
            ]
        );
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'ALL') return true;
        return booking.status === filter;
    });

    const filters = [
        { key: 'PENDING' as FilterType, label: 'Chờ xác nhận', count: bookings.filter(b => b.status === 'PENDING').length },
        { key: 'CONFIRMED' as FilterType, label: 'Đã xác nhận', count: bookings.filter(b => b.status === 'CONFIRMED').length },
        { key: 'COMPLETED' as FilterType, label: 'Hoàn thành', count: bookings.filter(b => b.status === 'COMPLETED').length },
        { key: 'CANCELLED' as FilterType, label: 'Đã hủy', count: bookings.filter(b => b.status === 'CANCELLED').length },
        { key: 'ALL' as FilterType, label: 'Tất cả', count: bookings.length },
    ];

    const handleBookingPress = (booking: Booking) => {
        Alert.alert(
            booking.courtName,
            `Sân ${booking.courtNumber}\n${booking.bookingDate}\n${booking.startTime} - ${booking.endTime}\n\nKhách hàng: ${booking.user?.fullName}\nSĐT: ${booking.user?.phone}\n\nTrạng thái: ${booking.status}`,
            [
                { text: 'Đóng', style: 'cancel' },
                ...(booking.status === 'PENDING' ? [
                    {
                        text: 'Xác nhận',
                        onPress: () => handleConfirmBooking(booking.id),
                    },
                ] : []),
                ...(booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? [
                    {
                        text: 'Hủy',
                        style: 'destructive' as const,
                        onPress: () => handleCancelBooking(booking.id),
                    },
                ] : []),
            ]
        );
    };

    if (loading) {
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
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Text style={styles.headerTitle}>Quản lý đặt sân</Text>
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
                        onPress={() => handleBookingPress(booking)}
                    />
                ))}

                {filteredBookings.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyText}>Không có lịch đặt sân nào</Text>
                    </View>
                )}
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
    },
});
