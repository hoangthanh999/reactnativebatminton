import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useCart } from '@/hooks/useCart';
import { orderService, CreateOrderRequest } from '@/services/orderService';
import { userService } from '@/services/userService';

export default function CheckoutScreen() {
    const router = useRouter();
    const { cart, loadCart } = useCart(); // Assuming loadCart refreshes global state if any
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<CreateOrderRequest>({
        recipientName: '',
        recipientPhone: '',
        shippingAddress: '',
        shippingProvince: '',
        shippingDistrict: '',
        shippingWard: '',
        note: '',
        paymentMethod: 'COD'
    });

    useEffect(() => {
        // Pre-fill user data
        const loadUser = async () => {
            try {
                const user = await userService.getCurrentUser();
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        recipientName: user.fullName || '',
                        recipientPhone: user.phone || ''
                    }));
                }
            } catch (error) {
                console.error('Load user error', error);
            }
        };
        loadUser();
    }, []);

    const handleOrder = async () => {
        if (!formData.recipientName || !formData.recipientPhone || !formData.shippingAddress) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        try {
            setLoading(true);
            const response = await orderService.createOrder(formData);
            // Backend usually creates order and clears cart. 
            // We should refresh cart state or assume it's cleared.

            Alert.alert('Thành công', 'Đặt hàng thành công!', [
                {
                    text: 'OK', onPress: () => {
                        // Navigate to home or order history
                        router.push('/(tabs)/shop' as any);
                        // Ideally navigate to Order Detail or History
                    }
                }
            ]);
            loadCart(); // Refresh cart to show 0
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Đặt hàng thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.items.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', marginTop: 100 }}>Giỏ hàng trống</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thanh toán</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Họ tên người nhận"
                    value={formData.recipientName}
                    onChangeText={t => setFormData({ ...formData, recipientName: t })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    value={formData.recipientPhone}
                    keyboardType="phone-pad"
                    onChangeText={t => setFormData({ ...formData, recipientPhone: t })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Địa chỉ (Số nhà, đường)"
                    value={formData.shippingAddress}
                    onChangeText={t => setFormData({ ...formData, shippingAddress: t })}
                />
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        placeholder="Tỉnh/TP"
                        value={formData.shippingProvince}
                        onChangeText={t => setFormData({ ...formData, shippingProvince: t })}
                    />
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Quận/Huyện"
                        value={formData.shippingDistrict}
                        onChangeText={t => setFormData({ ...formData, shippingDistrict: t })}
                    />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Phường/Xã"
                    value={formData.shippingWard}
                    onChangeText={t => setFormData({ ...formData, shippingWard: t })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Ghi chú"
                    value={formData.note}
                    onChangeText={t => setFormData({ ...formData, note: t })}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                <View style={styles.paymentOptions}>
                    <TouchableOpacity
                        style={[styles.paymentOption, formData.paymentMethod === 'COD' && styles.activePayment]}
                        onPress={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                    >
                        <Text style={formData.paymentMethod === 'COD' ? styles.activeText : styles.text}>Thanh toán khi nhận hàng (COD)</Text>
                    </TouchableOpacity>

                    {/* Add other methods if integrated */}
                    <TouchableOpacity
                        style={[styles.paymentOption, formData.paymentMethod === 'MOMO' && styles.activePayment]}
                        onPress={() => setFormData({ ...formData, paymentMethod: 'MOMO' })}
                    >
                        <Text style={formData.paymentMethod === 'MOMO' ? styles.activeText : styles.text}>Ví MoMo</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
                <View style={styles.summaryRow}>
                    <Text>Tổng tiền hàng</Text>
                    <Text>{cart.totalAmount?.toLocaleString('vi-VN')}đ</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text>Phí vận chuyển</Text>
                    <Text>0đ</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalText}>Thành tiền</Text>
                    <Text style={[styles.totalText, { color: Colors.primary }]}>
                        {cart.totalAmount?.toLocaleString('vi-VN')}đ
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.payButton}
                onPress={handleOrder}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.payButtonText}>ĐẶT HÀNG</Text>}
            </TouchableOpacity>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 16,
    },
    header: {
        marginTop: 40,
        marginBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
    },
    paymentOptions: {
        gap: 10,
    },
    paymentOption: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    activePayment: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '10',
    },
    text: { color: '#333' },
    activeText: { color: Colors.primary, fontWeight: 'bold' },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    payButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    payButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
