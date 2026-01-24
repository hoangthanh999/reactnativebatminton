// app/bookings/[id].tsx
import PaymentModal from '@/components/payment/PaymentModal';
import { Colors } from '@/constants/Colors';
import { Booking, bookingService } from '@/services/bookingService';
import { paymentService } from '@/services/paymentService';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);

    const DEPOSIT_PERCENTAGE = 30; // 30% cọc

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
            setActionLoading(true);
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
            setActionLoading(false);
        }
    };

    const handlePayment = () => {
        setPaymentModalVisible(true);
    };

    const handlePaymentSuccess = async () => {
        // Reload booking để lấy trạng thái mới
        await loadBookingDetail();
        Alert.alert(
            'Thông báo',
            'Đang chờ xác nhận thanh toán từ MoMo. Vui lòng kiểm tra lại sau ít phút.',
            [{ text: 'OK' }]
        );
    };

    const checkPaymentStatus = async () => {
        if (!booking) return;

        try {
            setCheckingPayment(true);
            const payment = await paymentService.checkPaymentStatus(booking.id);

            if (payment.status === 'COMPLETED' || payment.status === 'PARTIAL') {
                Alert.alert('Thành công', 'Thanh toán đã được xác nhận!');
                await loadBookingDetail();
            } else if (payment.status === 'PENDING') {
                Alert.alert('Chờ xác nhận', 'Thanh toán đang chờ xác nhận từ MoMo');
            } else {
                Alert.alert('Thất bại', 'Thanh toán chưa thành công');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái thanh toán');
        } finally {
            setCheckingPayment(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return { label: 'Đã xác nhận', color: Colors.success, icon: '✓' };
            case 'PENDING':
                return { label: 'Chờ thanh toán', color: Colors.warning, icon: '⏳' };
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
    const needsPayment = booking.status === 'PENDING';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
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

                {/* Payment Warning */}
                {needsPayment && (
                    <View style={styles.warningBox}>
                        <Text style={styles.warningIcon}>⚠️</Text>
                        <View style={styles.warningContent}>
                            <Text style={styles.warningTitle}>Cần thanh toán</Text>
                            <Text style={styles.warningText}>
                                Vui lòng thanh toán để xác nhận đặt sân. Đặt sân sẽ tự động hủy sau 15 phút nếu không thanh toán.
                            </Text>
                        </View>
                    </View>
                )}

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

                {/* Payment Info */}
                {booking.payment && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Trạng thái:</Text>
                                <Text style={[styles.infoValue, { color: Colors.primary }]}>
                                    {booking.payment.status === 'COMPLETED' ? 'Đã thanh toán' :
                                        booking.payment.status === 'PARTIAL' ? 'Đã cọc' :
                                            booking.payment.status === 'PENDING' ? 'Chờ thanh toán' : 'Chưa thanh toán'}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Loại:</Text>
                                <Text style={styles.infoValue}>
                                    {booking.payment.paymentType === 'DEPOSIT' ? 'Thanh toán cọc' : 'Thanh toán toàn bộ'}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Đã thanh toán:</Text>
                                <Text style={styles.infoValue}>
                                    {booking.payment.depositAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                            {booking.payment.remainingAmount > 0 && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Còn lại:</Text>
                                    <Text style={[styles.infoValue, { color: Colors.warning }]}>
                                        {booking.payment.remainingAmount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <View style={{ height: 150 }} />
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                {needsPayment && (
                    <>
                        <TouchableOpacity
                            style={styles.payButton}
                            onPress={handlePayment}
                        >
                            <Text style={styles.payButtonText}>💳 Thanh toán ngay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.checkButton}
                            onPress={checkPaymentStatus}
                            disabled={checkingPayment}
                        >
                            {checkingPayment ? (
                                <ActivityIndicator color={Colors.primary} />
                            ) : (
                                <Text style={styles.checkButtonText}>Kiểm tra thanh toán</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
                {canCancel && (
                    <TouchableOpacity
                        style={[styles.cancelButton, actionLoading && styles.cancelButtonDisabled]}
                        onPress={handleCancelBooking}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.cancelButtonText}>Hủy đặt sân</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Payment Modal */}
            <PaymentModal
                visible={paymentModalVisible}
                bookingId={booking.id}
                totalPrice={booking.totalPrice}
                depositPercentage={DEPOSIT_PERCENTAGE}
                onClose={() => setPaymentModalVisible(false)}
                onSuccess={handlePaymentSuccess}
            />
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
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
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
    warningBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF3CD',
        marginHorizontal: 24,
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.warning,
    },
    warningIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    warningText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
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
    payButton: {
        backgroundColor: '#A50064',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    payButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkButton: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    checkButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
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
