// components/payment/PaymentModal.tsx
import { Colors } from '@/constants/Colors';
import { paymentService } from '@/services/paymentService';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentModalProps {
    visible: boolean;
    bookingId: number;
    totalPrice: number;
    depositPercentage: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({
    visible,
    bookingId,
    totalPrice,
    depositPercentage,
    onClose,
    onSuccess,
}: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<'FULL' | 'DEPOSIT'>('DEPOSIT');

    const depositAmount = (totalPrice * depositPercentage) / 100;
    const remainingAmount = totalPrice - depositAmount;

    // ✅ Kiểm tra xem có phải mock payment không
    const isMockPayment = (payUrl: string): boolean => {
        return payUrl.startsWith('mock://');
    };

    // ✅ Xử lý mock payment
    const handleMockPayment = async (orderId: string) => {
        Alert.alert(
            '🎭 Chế độ Demo',
            'Đây là chế độ demo. Bạn có muốn xác nhận thanh toán không?',
            [
                {
                    text: 'Xác nhận thanh toán',
                    onPress: async () => {
                        try {
                            setLoading(true);

                            // Gọi API confirm mock payment
                            await paymentService.confirmMockPayment(orderId, 0);

                            Alert.alert(
                                'Thành công ✅',
                                'Thanh toán đã được xác nhận!\n\nĐặt sân của bạn đã được xác nhận.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            onClose();
                                            onSuccess();
                                        },
                                    },
                                ]
                            );
                        } catch (error: any) {
                            console.error('Mock payment error:', error);
                            Alert.alert(
                                'Lỗi',
                                error.response?.data?.message || 'Không thể xác nhận thanh toán'
                            );
                        } finally {
                            setLoading(false);
                        }
                    },
                },
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
            ]
        );
    };

    // ✅ Xử lý real MoMo payment
    const handleRealMoMoPayment = async (payUrl: string) => {
        const supported = await Linking.canOpenURL(payUrl);

        if (supported) {
            await Linking.openURL(payUrl);

            Alert.alert(
                'Đang chuyển đến MoMo',
                'Vui lòng hoàn tất thanh toán trên MoMo. Sau khi thanh toán thành công, đặt sân sẽ được xác nhận tự động.',
                [
                    {
                        text: 'Đã thanh toán',
                        onPress: () => {
                            onClose();
                            onSuccess();
                        },
                    },
                    {
                        text: 'Kiểm tra sau',
                        style: 'cancel',
                        onPress: onClose,
                    },
                ]
            );
        } else {
            Alert.alert('Lỗi', 'Không thể mở ứng dụng MoMo');
        }
    };

    const handlePayment = async () => {
        try {
            setLoading(true);

            console.log('🔵 Creating payment:', {
                bookingId,
                paymentType: selectedType,
            });

            // Tạo payment request
            const response = await paymentService.createMoMoPayment({
                bookingId,
                paymentType: selectedType,
            });

            console.log('📥 Payment response:', response);

            if (response.resultCode === 0 && response.payUrl) {
                // ✅ Kiểm tra mock payment
                if (isMockPayment(response.payUrl)) {
                    console.log('🎭 Mock payment detected');
                    await handleMockPayment(response.orderId);
                } else {
                    console.log('💳 Real MoMo payment');
                    await handleRealMoMoPayment(response.payUrl);
                }
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể tạo thanh toán');
            }
        } catch (error: any) {
            console.error('❌ Payment error:', error);
            Alert.alert(
                'Lỗi',
                error.response?.data?.message || 'Không thể tạo thanh toán'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Chọn phương thức thanh toán</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Payment Options */}
                    <View style={styles.content}>
                        {/* Deposit Option */}
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                selectedType === 'DEPOSIT' && styles.optionCardSelected,
                            ]}
                            onPress={() => setSelectedType('DEPOSIT')}
                            disabled={loading}
                        >
                            <View style={styles.optionHeader}>
                                <View style={styles.radioButton}>
                                    {selectedType === 'DEPOSIT' && (
                                        <View style={styles.radioButtonInner} />
                                    )}
                                </View>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionTitle}>
                                        Thanh toán cọc ({depositPercentage}%)
                                    </Text>
                                    <Text style={styles.optionSubtitle}>
                                        Khuyến nghị - Đặt cọc trước
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.priceBreakdown}>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Cọc trước:</Text>
                                    <Text style={styles.priceValue}>
                                        {depositAmount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Thanh toán sau:</Text>
                                    <Text style={styles.priceValueSecondary}>
                                        {remainingAmount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Full Payment Option */}
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                selectedType === 'FULL' && styles.optionCardSelected,
                            ]}
                            onPress={() => setSelectedType('FULL')}
                            disabled={loading}
                        >
                            <View style={styles.optionHeader}>
                                <View style={styles.radioButton}>
                                    {selectedType === 'FULL' && (
                                        <View style={styles.radioButtonInner} />
                                    )}
                                </View>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionTitle}>
                                        Thanh toán toàn bộ
                                    </Text>
                                    <Text style={styles.optionSubtitle}>
                                        Thanh toán 100% ngay
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.priceBreakdown}>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Tổng tiền:</Text>
                                    <Text style={styles.priceValue}>
                                        {totalPrice.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Payment Method */}
                        <View style={styles.paymentMethodCard}>
                            <Text style={styles.paymentMethodTitle}>
                                Thanh toán qua
                            </Text>
                            <View style={styles.momoLogo}>
                                <Text style={styles.momoText}>MoMo</Text>
                                <Text style={styles.momoIcon}>💳</Text>
                            </View>
                        </View>

                        {/* Info */}
                        <View style={styles.infoBox}>
                            <Text style={styles.infoIcon}>ℹ️</Text>
                            <Text style={styles.infoText}>
                                {selectedType === 'DEPOSIT'
                                    ? `Bạn cần thanh toán cọc ${depositPercentage}% để xác nhận đặt sân. Số tiền còn lại sẽ thanh toán khi đến sân.`
                                    : 'Bạn sẽ thanh toán toàn bộ chi phí ngay bây giờ.'}
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Thanh toán ngay:</Text>
                            <Text style={styles.totalValue}>
                                {(selectedType === 'DEPOSIT'
                                    ? depositAmount
                                    : totalPrice
                                ).toLocaleString('vi-VN')}
                                đ
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.payButton, loading && styles.payButtonDisabled]}
                            onPress={handlePayment}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.payButtonText}>
                                    Thanh toán với MoMo
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Styles giữ nguyên như cũ
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    closeButton: {
        fontSize: 24,
        color: Colors.textSecondary,
        padding: 4,
    },
    content: {
        padding: 20,
    },
    optionCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    optionCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    priceBreakdown: {
        marginLeft: 36,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    priceLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    priceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    priceValueSecondary: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    paymentMethodCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentMethodTitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    momoLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#A50064',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    momoText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
        marginRight: 8,
    },
    momoIcon: {
        fontSize: 20,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.primaryLight,
        borderRadius: 12,
        padding: 12,
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: Colors.text,
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    payButton: {
        backgroundColor: '#A50064',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    payButtonDisabled: {
        opacity: 0.6,
    },
    payButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
