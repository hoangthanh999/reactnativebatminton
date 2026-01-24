// components/chat/ProductListMessage.tsx

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ProductCard from '../chat/ProductCard';

interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    brand: string;
    stockQuantity: number;
}

interface ProductListMessageProps {
    products: Product[];
    onAddToCart: (productId: number) => void;
    onBuyNow: (productId: number) => void;
    onViewDetail: (productId: number) => void;
}

export default function ProductListMessage({
    products,
    onAddToCart,
    onBuyNow,
    onViewDetail
}: ProductListMessageProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    onViewDetail={onViewDetail}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    content: {
        paddingHorizontal: 16,
    },
});
