// app/payment-callback.tsx
import { Colors } from '@/constants/Colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentCallbackScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [paymentType, setPaymentType] = useState<'booking' | 'order' | null>(null);

    useEffect(() => {
        // ✅ Xử lý VNPay callback
        if (params.vnp_ResponseCode) {
            const responseCode = params.vnp_ResponseCode as string;
            const txnRef = params.vnp_TxnRef as string;

            setStatus(responseCode === '00' ? 'success' : 'failed');

            // Xác định loại thanh toán
            if (txnRef?.startsWith('BOOKING_')) {
                setPaymentType('booking');
            } else if (txnRef?.startsWith('ORDER_')) {
                setPaymentType('order');
            }
        }
        // ✅ Xử lý MoMo callback (nếu cần)
        else if (params.resultCode) {
            const resultCode = params.resultCode as string;
            setStatus(resultCode === '0' ? 'success' : 'failed');

            const orderId = params.orderId as string;
            if (orderId?.startsWith('BOOKING_')) {
                setPaymentType('booking');
            } else if (orderId?.startsWith('ORDER_') || orderId?.startsWith('SHOP_')) {
                setPaymentType('order');
            }
        }
    }, [params]);

    const handleGoHome = () => {
        router.replace('/(tabs)');
    };

    const handleViewBookings = () => {
        router.replace('/(tabs)/bookings');
    };

    const handleViewOrders = () => {
        // ✅ Nếu bạn có tab orders
        router.replace('/(tabs)/profile'); // Hoặc navigate đến màn hình orders
    };

    const handleBackToChat = () => {
        router.replace('/(tabs)/chat');
    };

    if (status === 'processing') {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.processingText}>Đang xử lý thanh toán...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>
                    {status === 'success' ? '✅' : '❌'}
                </Text>

                <Text style={styles.title}>
                    {status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                </Text>

                <Text style={styles.message}>
                    {status === 'success'
                        ? 'Giao dịch của bạn đã được xử lý thành công.'
                        : 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
                </Text>

                {/* Transaction Info */}
                {(params.vnp_TxnRef || params.orderId) && (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Mã giao dịch:</Text>
                        <Text style={styles.infoValue}>
                            {params.vnp_TxnRef || params.orderId}
                        </Text>

                        {params.vnp_Amount && (
                            <>
                                <Text style={[styles.infoLabel, { marginTop: 12 }]}>Số tiền:</Text>
                                <Text style={styles.infoValue}>
                                    {(parseInt(params.vnp_Amount as string) / 100).toLocaleString('vi-VN')}đ
                                </Text>
                            </>
                        )}

                        {params.vnp_TransactionNo && (
                            <>
                                <Text style={[styles.infoLabel, { marginTop: 12 }]}>Mã GD ngân hàng:</Text>
                                <Text style={styles.infoValue}>
                                    {params.vnp_TransactionNo}
                                </Text>
                            </>
                        )}
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleGoHome}
                    >
                        <Text style={styles.primaryButtonText}>🏠 Về trang chủ</Text>
                    </TouchableOpacity>

                    {status === 'success' && (
                        <>
                            {paymentType === 'booking' && (
                                <TouchableOpacity
                                    style={[styles.button, styles.secondaryButton]}
                                    onPress={handleViewBookings}
                                >
                                    <Text style={styles.secondaryButtonText}>
                                        📅 Xem đặt sân
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {paymentType === 'order' && (
                                <TouchableOpacity
                                    style={[styles.button, styles.secondaryButton]}
                                    onPress={handleViewOrders}
                                >
                                    <Text style={styles.secondaryButtonText}>
                                        🛍️ Xem đơn hàng
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.button, styles.outlineButton]}
                        onPress={handleBackToChat}
                    >
                        <Text style={styles.outlineButtonText}>💬 Quay lại chat</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    processingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.text,
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    icon: {
        fontSize: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    infoBox: {
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: 16,
        width: '100%',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    infoLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    actions: {
        width: '100%',
        gap: 12,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: Colors.primary,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
    },
    secondaryButton: {
        backgroundColor: Colors.primary + '15',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
});
