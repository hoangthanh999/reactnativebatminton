import { Colors } from '@/constants/Colors';
import { useCart } from '@/hooks/useCart';
import { productService } from '@/services/productService';
import { ProductDetail } from '@/types/shop';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert,
    Image, ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const insets = useSafeAreaInsets();
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                if (id) {
                    const response = await productService.getProductById(Number(id));
                    setProduct(response.data);
                }
            } catch {
                Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
                router.back();
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, router]);

    const handleAddToCart = async () => {
        if (product) {
            await addToCart(product.id, quantity);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!product) return null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết sản phẩm</Text>
                <TouchableOpacity onPress={() => router.push('/shop/cart' as any)} style={styles.cartButton}>
                    <Text style={{ fontSize: 24 }}>🛒</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Image Gallery */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri: product.images && product.images.length > 0
                                ? product.images[selectedImage]
                                : 'https://via.placeholder.com/300'
                        }}
                        style={styles.mainImage}
                        resizeMode="contain"
                    />
                    <ScrollView horizontal style={styles.thumbnailList}>
                        {product.images?.map((img, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedImage(index)}
                                style={[styles.thumbnail, selectedImage === index && styles.activeThumbnail]}
                            >
                                <Image source={{ uri: img }} style={styles.thumbnailImage} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}đ</Text>
                        {product.originalPrice > product.price && (
                            <Text style={styles.originalPrice}>{product.originalPrice.toLocaleString('vi-VN')}đ</Text>
                        )}
                        {product.discountPercent > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{product.discountPercent}%</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.ratingRow}>
                        <Text>⭐ {product.averageRating} ({product.reviewCount} đánh giá) • Đã bán {product.soldQuantity}</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Mô tả</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
                    {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                        <View key={key} style={styles.specRow}>
                            <Text style={styles.specKey}>{key}</Text>
                            <Text style={styles.specValue}>{value}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={styles.footer}>
                <View style={styles.quantityControl}>
                    <TouchableOpacity
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        style={styles.qtyButton}
                    >
                        <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity
                        onPress={() => setQuantity(quantity + 1)}
                        style={styles.qtyButton}
                    >
                        <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                    <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
        zIndex: 10,
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: '#333',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    cartButton: {
        padding: 8,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#f9f9f9',
    },
    mainImage: {
        width: 300,
        height: 300,
    },
    thumbnailList: {
        marginTop: 10,
        paddingHorizontal: 10,
    },
    thumbnail: {
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 4,
    },
    activeThumbnail: {
        borderColor: Colors.primary,
    },
    thumbnailImage: {
        width: 60,
        height: 60,
        borderRadius: 4,
    },
    infoContainer: {
        padding: 16,
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginRight: 10,
    },
    originalPrice: {
        fontSize: 16,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 10,
    },
    discountBadge: {
        backgroundColor: '#FFE5E5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: 'red',
        fontSize: 12,
        fontWeight: 'bold',
    },
    ratingRow: {
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    description: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    specRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    specKey: {
        flex: 1,
        color: '#666',
        fontWeight: '500',
    },
    specValue: {
        flex: 2,
        color: '#333',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginRight: 16,
    },
    qtyButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    qtyButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
    },
    qtyText: {
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 30,
        textAlign: 'center',
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    addToCartText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
