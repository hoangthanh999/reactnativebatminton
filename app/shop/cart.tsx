import React, { useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useCart } from '@/hooks/useCart';

export default function CartScreen() {
    const router = useRouter();
    const { items, loading, removeItem, updateQuantity, clearCart, totalAmount } = useCart();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        // Assuming useCart handles initial loading internally now, as loadCart is removed from destructuring
        // If not, a loadCart function would need to be added back to useCart hook or its equivalent
    }, []);

    const renderCartItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.productImage }} style={styles.itemImage} resizeMode="cover" />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>

                <View style={styles.controls}>
                    <View style={styles.qtyControl}>
                        <TouchableOpacity
                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                            style={styles.qtyButton}
                        >
                            <Text>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                            style={styles.qtyButton}
                        >
                            <Text>+</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                        <Text style={styles.removeText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading && !items) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giỏ hàng</Text>
                <View style={{ width: 40 }} />
            </View>

            {items && items.length > 0 ? (
                <>
                    <FlatList
                        data={items}
                        renderItem={renderCartItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.list}
                    />
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tổng cộng:</Text>
                            <Text style={styles.totalAmount}>
                                {totalAmount?.toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={() => router.push('/shop/checkout' as any)}
                        >
                            <Text style={styles.checkoutText}>Thanh toán</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🛒</Text>
                    <Text style={styles.emptyText}>Giỏ hàng trống</Text>
                    <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)/shop' as any)}>
                        <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: Colors.primary,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Kept from original for layout
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: 'white', // Changed color for contrast with new header background
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white', // Changed color for contrast with new header background
    },
    list: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginBottom: 12,
        padding: 12,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
    },
    qtyButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    qtyText: {
        width: 30,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
    removeText: {
        color: 'red',
        fontSize: 12,
    },
    footer: {
        backgroundColor: 'white',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    checkoutButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    shopButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
