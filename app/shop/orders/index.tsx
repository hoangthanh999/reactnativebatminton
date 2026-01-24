// app/shop/orders/index.tsx - Orders List Screen
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { Order } from '@/types/shop';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OrdersListScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await orderService.getMyOrders(0, 20);
            setOrders(response.data?.content || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrders();
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

    const formatDate = (dateArray: number[]) => {
        if (!dateArray || dateArray.length < 3) return '';
        const [year, month, day] = dateArray;
        return `${day}/${month}/${year}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {orders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
                        <TouchableOpacity
                            style={styles.shopButton}
                            onPress={() => router.push('/(tabs)/shop')}
                        >
                            <Text style={styles.shopButtonText}>Khám phá sản phẩm</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    orders.map((order) => (
                        <TouchableOpacity
                            key={order.id}
                            style={styles.orderCard}
                            onPress={() => router.push(`/shop/orders/${order.id}` as any)}
                        >
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                        {getStatusText(order.status)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.orderInfo}>
                                <Text style={styles.orderDate}>
                                    📅 {formatDate(order.createdAt as any)}
                                </Text>
                            </View>

                            <View style={styles.orderItems}>
                                {order.items?.slice(0, 2).map((item, idx) => (
                                    <Text key={idx} style={styles.itemText}>
                                        • {item.productName} x{item.quantity}
                                    </Text>
                                ))}
                                {order.items && order.items.length > 2 && (
                                    <Text style={styles.moreItems}>
                                        +{order.items.length - 2} sản phẩm khác
                                    </Text>
                                )}
                            </View>

                            <View style={styles.orderFooter}>
                                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                                <Text style={styles.totalAmount}>
                                    {order.totalAmount?.toLocaleString()}đ
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
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
        padding: 24,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
    },
    shopButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    orderCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderInfo: {
        marginBottom: 12,
    },
    orderDate: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    orderItems: {
        marginBottom: 12,
    },
    itemText: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 4,
    },
    moreItems: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    totalLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});
