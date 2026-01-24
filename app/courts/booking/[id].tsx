// app/courts/booking/[id].tsx (tạo file mới)
import PaymentModal from '@/components/payment/PaymentModal';
import { Colors } from '@/constants/Colors';
import { BookingRequest, bookingService } from '@/services/bookingService';
import { Court, courtService } from '@/services/courtService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CourtBookingScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [court, setCourt] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();
    const [booking, setBooking] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedCourtNumber, setSelectedCourtNumber] = useState(1);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');

    const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);

    const DEPOSIT_PERCENTAGE = 30;

    useEffect(() => {
        loadCourtDetail();
    }, [id]);

    const loadCourtDetail = async () => {
        try {
            setLoading(true);
            const response = await courtService.getCourtById(Number(id));
            if (response.success) {
                setCourt(response.data);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông tin sân');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalPrice = useCallback(() => {
        if (!court || !startTime || !endTime) return 0;

        const start = parseInt(startTime.split(':')[0]);
        const end = parseInt(endTime.split(':')[0]);
        const hours = end - start;

        return hours * court.pricePerHour;
    }, [court, startTime, endTime]);

    const handleCreateBooking = async () => {
        if (!court) return;

        // Validation
        if (!startTime || !endTime) {
            Alert.alert('Lỗi', 'Vui lòng chọn giờ bắt đầu và kết thúc');
            return;
        }

        try {
            setBooking(true);

            const bookingData: BookingRequest = {
                courtId: court.id,
                courtNumber: selectedCourtNumber,
                bookingDate: selectedDate.toISOString().split('T')[0],
                startTime,
                endTime,
                notes,
            };

            const response = await bookingService.createBooking(bookingData);

            if (response.success) {
                setCreatedBookingId(response.data.id);
                setPaymentModalVisible(true);
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đặt sân');
        } finally {
            setBooking(false);
        }
    };

    const handlePaymentSuccess = () => {
        Alert.alert(
            'Thành công',
            'Đặt sân thành công! Vui lòng hoàn tất thanh toán.',
            [
                {
                    text: 'Xem chi tiết',
                    onPress: () => {
                        router.replace({
                            pathname: '/bookings/[id]',
                            params: { id: createdBookingId }
                        } as any);
                    },
                },
            ]
        );
    };

    const totalPrice = calculateTotalPrice();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!court) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đặt sân</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Court Info */}
                <View style={styles.courtCard}>
                    <Text style={styles.courtName}>{court.name}</Text>
                    <Text style={styles.courtAddress}>{court.address}</Text>
                    <Text style={styles.courtPrice}>
                        {court.pricePerHour.toLocaleString('vi-VN')}đ/giờ
                    </Text>
                </View>

                {/* Booking Form - Simplified for example */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin đặt sân</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Giờ bắt đầu (VD: 08:00)"
                        value={startTime}
                        onChangeText={setStartTime}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Giờ kết thúc (VD: 10:00)"
                        value={endTime}
                        onChangeText={setEndTime}
                    />

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Ghi chú (tùy chọn)"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Price Summary */}
                {totalPrice > 0 && (
                    <View style={styles.priceCard}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Tổng tiền:</Text>
                            <Text style={styles.priceValue}>
                                {totalPrice.toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Cọc ({DEPOSIT_PERCENTAGE}%):</Text>
                            <Text style={styles.depositValue}>
                                {((totalPrice * DEPOSIT_PERCENTAGE) / 100).toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.bookButton, booking && styles.bookButtonDisabled]}
                    onPress={handleCreateBooking}
                    disabled={booking || !totalPrice}
                >
                    {booking ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.bookButtonText}>Đặt sân ngay</Text>
                    )}
                </TouchableOpacity>
            </View>

            {createdBookingId && (
                <PaymentModal
                    visible={paymentModalVisible}
                    bookingId={createdBookingId}
                    totalPrice={totalPrice}
                    depositPercentage={DEPOSIT_PERCENTAGE}
                    onClose={() => setPaymentModalVisible(false)}
                    onSuccess={handlePaymentSuccess}
                />
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
    backIcon: {
        fontSize: 24,
        color: Colors.white,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    courtCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    courtName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    courtAddress: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    courtPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
        marginBottom: 12,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    priceCard: {
        backgroundColor: Colors.primaryLight,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 16,
        color: Colors.text,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    depositValue: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    bookButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    bookButtonDisabled: {
        opacity: 0.6,
    },
    bookButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
