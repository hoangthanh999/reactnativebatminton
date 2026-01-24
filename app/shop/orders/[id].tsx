// app/shop/orders/[id].tsx - Order Detail Screen
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { Order } from '@/types/shop';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            const response = await orderService.getOrderById(Number(id));
            setOrder(response.data);
        } catch (error) {
            console.error('Error fetching order:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#FFA500';
            case 'CONFIRMED': return '#4CAF50';
            case 'PROCESSING': return '#2196F3';
            case 'SHIPPING': return '#9C27B0';
            case 'DELIVERED': return '#4CAF50';
            case 'CANCELLED': return '#F44336';
            default: return Colors.textSecondary;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'PROCESSING': return 'Đang xử lý';
            case 'SHIPPING': return 'Đang giao hàng';
            case 'DELIVERED': return 'Đã giao hàng';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    const getPaymentMethodText = (method: string) => {
        switch (method) {
            case 'CASH': return 'Tiền mặt';
            case 'BANK_TRANSFER': return 'Chuyển khoản';
            case 'MOMO': return 'MoMo';
            case 'VNPAY': return 'VNPay';
            default: return method;
        }
    };

    const formatDate = (dateArray: number[]) => {
        if (!dateArray || dateArray.length < 6) return '';
        const [year, month, day, hour, minute] = dateArray;
        return `${day}/${month}/${year} ${hour}:${minute.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity
                    style={styles.headerBackButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.headerBackButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* Order Status */}
                <View style={styles.section}>
                    <View style={[styles.statusCard, { borderLeftColor: getStatusColor(order.status) }]}>
                        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                        <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                            {getStatusText(order.status)}
                        </Text>
                    </View>
                </View>

                {/* Order Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                    <View style={styles.infoCard}>
                        <InfoRow label="Ngày đặt" value={formatDate(order.createdAt as any)} />
                        <InfoRow label="Phương thức thanh toán" value={getPaymentMethodText(order.paymentMethod)} />
                        <InfoRow
                            label="Trạng thái thanh toán"
                            value={order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            valueColor={order.paymentStatus === 'PAID' ? Colors.success : Colors.error}
                        />
                    </View>
                </View>

                {/* Delivery Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
                    <View style={styles.infoCard}>
                        <InfoRow label="Người nhận" value={order.recipientName} />
                        <InfoRow label="Số điện thoại" value={order.recipientPhone} />
                        <InfoRow label="Địa chỉ" value={order.shippingAddress} multiline />
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sản phẩm</Text>
                    <View style={styles.itemsCard}>
                        {order.items?.map((item, index) => (
                            <View key={item.id}>
                                {index > 0 && <View style={styles.divider} />}
                                <View style={styles.itemRow}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName}>{item.productName}</Text>
                                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                    </View>
                                    <Text style={styles.itemPrice}>
                                        {Number(item.price * item.quantity).toLocaleString()}đ
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Total */}
                <View style={styles.section}>
                    <View style={styles.infoCard}>
                        <InfoRow label="Tạm tính" value={`${Number(order.subtotal).toLocaleString()}đ`} />
                        <InfoRow label="Phí vận chuyển" value={`${Number(order.shippingFee || 0).toLocaleString()}đ`} />
                        {order.discount > 0 && (
                            <InfoRow
                                label="Giảm giá"
                                value={`-${Number(order.discount).toLocaleString()}đ`}
                                valueColor={Colors.success}
                            />
                        )}
                        <View style={styles.totalDivider} />
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tổng cộng</Text>
                            <Text style={styles.totalValue}>
                                {Number(order.totalAmount).toLocaleString()}đ
                            </Text>
                        </View>
                    </View>
                </View>

                {order.note && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ghi chú</Text>
                        <View style={styles.infoCard}>
                            <Text style={styles.noteText}>{order.note}</Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

interface InfoRowProps {
    label: string;
    value: string;
    valueColor?: string;
    multiline?: boolean;
}

function InfoRow({ label, value, valueColor, multiline }: InfoRowProps) {
    return (
        <View style={[styles.infoRow, multiline && styles.infoRowColumn]}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, valueColor && { color: valueColor }, multiline && styles.infoValueMultiline]}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: Colors.primary,
        paddingBottom: 20,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerBackButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBackButtonText: {
        fontSize: 32,
        color: Colors.white,
        marginTop: -4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 24,
        paddingBottom: 0,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    statusCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 20,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoRowColumn: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    infoValueMultiline: {
        textAlign: 'left',
        marginLeft: 0,
    },
    itemsCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    itemInfo: {
        flex: 1,
        marginRight: 16,
    },
    itemName: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 4,
    },
    itemQuantity: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    itemPrice: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
    },
    totalDivider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    noteText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
    errorText: {
        fontSize: 16,
        color: Colors.error,
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
    },
    backButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
