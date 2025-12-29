// app/bookings/[id].tsx
import { Colors } from '@/constants/Colors';
import { Booking, bookingService } from '@/services/bookingService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BookingDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    const loadBookingDetail = useCallback(async () => {
        try {
            setLoading(true);
            const response = await bookingService.getBookingById(Number(id));

            if (response.success) {
                setBooking(response.data);
            }
        } catch (error: any) {
            console.error('Load booking detail error:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin đặt sân');
            router.back();
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        loadBookingDetail();
    }, [loadBookingDetail]);

    const handleCancelBooking = () => {
        Alert.alert(
            'Xác nhận hủy',
            'Bạn có chắc muốn hủy lịch đặt sân này?',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy đặt sân',
                    style: 'destructive',
                    onPress: performCancelBooking,
                },
            ]
        );
    };

    const performCancelBooking = async () => {
        if (!booking) return;

        try {
            setCancelling(true);
            const response = await bookingService.cancelBooking(booking.id);

            if (response.success) {
                Alert.alert('Thành công', 'Đã hủy lịch đặt sân', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }
        } catch (error: any) {
            console.error('Cancel booking error:', error);
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể hủy đặt sân');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return { label: 'Đã xác nhận', color: Colors.success, icon: '✓' };
            case 'PENDING':
                return { label: 'Chờ xác nhận', color: Colors.warning, icon: '⏳' };
            case 'CANCELLED':
                return { label: 'Đã hủy', color: Colors.error, icon: '✕' };
            case 'COMPLETED':
                return { label: 'Hoàn thành', color: Colors.primary, icon: '✓' };
            default:
                return { label: status, color: Colors.textSecondary, icon: '○' };
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    if (!booking) {
        return null;
    }

    const statusInfo = getStatusInfo(booking.status);
    const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết đặt sân</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.icon} {statusInfo.label}
                    </Text>
                </View>

                {/* Court Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin sân</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Tên sân:</Text>
                            <Text style={styles.infoValue}>{booking.courtName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Địa chỉ:</Text>
                            <Text style={styles.infoValue}>{booking.courtAddress}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Số sân:</Text>
                            <Text style={styles.infoValue}>Sân {booking.courtNumber}</Text>
                        </View>
                    </View>
                </View>

                {/* Booking Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin đặt sân</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>📅 Ngày:</Text>
                            <Text style={styles.infoValue}>
                                {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>⏰ Giờ:</Text>
                            <Text style={styles.infoValue}>
                                {booking.startTime} - {booking.endTime}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>💰 Tổng tiền:</Text>
                            <Text style={[styles.infoValue, styles.priceText]}>
                                {booking.totalPrice.toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                        {booking.notes && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>📝 Ghi chú:</Text>
                                <Text style={styles.infoValue}>{booking.notes}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* User Info (if available) */}
                {booking.user && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông tin người đặt</Text>
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>👤 Họ tên:</Text>
                                <Text style={styles.infoValue}>{booking.user.fullName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>📧 Email:</Text>
                                <Text style={styles.infoValue}>{booking.user.email}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>📱 SĐT:</Text>
                                <Text style={styles.infoValue}>{booking.user.phone}</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Action Buttons */}
            {canCancel && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
                        onPress={handleCancelBooking}
                        disabled={cancelling}
                    >
                        {cancelling ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.cancelButtonText}>Hủy đặt sân</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: Colors.primary,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: Colors.white,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    statusBadge: {
        margin: 24,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },
    priceText: {
        color: Colors.primary,
        fontSize: 18,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    cancelButton: {
        backgroundColor: Colors.error,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonDisabled: {
        opacity: 0.6,
    },
    cancelButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
