// components/chat/ProductCard.tsx (MỚI)
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    brand: string;
    stockQuantity: number;
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (productId: number) => void;
    onBuyNow: (productId: number) => void;
    onViewDetail: (productId: number) => void;
}

export default function ProductCard({
    product,
    onAddToCart,
    onBuyNow,
    onViewDetail
}: ProductCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const discountPercent = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onViewDetail(product.id)}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: product.images[0] }}
                style={styles.image}
                resizeMode="cover"
            />

            {discountPercent > 0 && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{discountPercent}%</Text>
                </View>
            )}

            <View style={styles.info}>
                <Text style={styles.brand}>{product.brand}</Text>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>

                <View style={styles.priceContainer}>
                    <Text style={styles.price}>{formatPrice(product.price)}</Text>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <Text style={styles.originalPrice}>
                            {formatPrice(product.originalPrice)}
                        </Text>
                    )}
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.addToCartButton]}
                        onPress={() => onAddToCart(product.id)}
                    >
                        <Text style={styles.addToCartText}>🛒 Thêm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.buyNowButton]}
                        onPress={() => onBuyNow(product.id)}
                    >
                        <Text style={styles.buyNowText}>💳 Mua ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 180,
        backgroundColor: Colors.white,
        borderRadius: 12,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 140,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: Colors.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    discountText: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: 'bold',
    },
    info: {
        padding: 12,
    },
    brand: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
        height: 36,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.primary,
        marginRight: 6,
    },
    originalPrice: {
        fontSize: 11,
        color: Colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    actions: {
        flexDirection: 'row',
        gap: 6,
    },
    button: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    addToCartButton: {
        backgroundColor: Colors.primary + '15',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    addToCartText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    buyNowButton: {
        backgroundColor: Colors.primary,
    },
    buyNowText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.white,
    },
});
