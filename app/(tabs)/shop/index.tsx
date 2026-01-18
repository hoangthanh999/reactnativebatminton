import { Colors } from '@/constants/Colors';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl, StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


export default function ShopScreen() {
    const router = useRouter();
    const {
        products, categories, loading, loadProducts, initShop
    } = useProducts();
    const { itemCount } = useCart();

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        initShop();
    }, [initShop]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (searchTimer) clearTimeout(searchTimer);

        const timer = setTimeout(() => {
            loadProducts({ keyword: text, categoryId: selectedCategory || undefined }, false);
        }, 500);
        setSearchTimer(timer);
    };

    const handleCategorySelect = (categoryId: number | null) => {
        setSelectedCategory(categoryId);
        loadProducts({ categoryId: categoryId || undefined, keyword: searchQuery }, false);
    };

    const renderProductItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => router.push(`/shop/${item.id}` as any)}
        >
            <Image
                source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150' }}
                style={styles.productImage}
                resizeMode="cover"
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
                <View style={styles.ratingContainer}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.ratingText}>{item.averageRating?.toFixed(1) || '0.0'}</Text>
                    <Text style={styles.soldText}>({item.soldQuantity || 0} đã bán)</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
                <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/shop/cart' as any)}>
                    <Text style={styles.cartIcon}>🛒</Text>
                    {itemCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{itemCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoryContainer}>
                <FlatList
                    data={[{ id: 0, name: 'Tất cả' }, ...categories]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                (selectedCategory === item.id || (item.id === 0 && selectedCategory === null)) && styles.activeCategory
                            ]}
                            onPress={() => handleCategorySelect(item.id === 0 ? null : item.id)}
                        >
                            <Text style={[
                                styles.categoryText,
                                (selectedCategory === item.id || (item.id === 0 && selectedCategory === null)) && styles.activeCategoryText
                            ]}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            </View>

            {/* Product List */}
            {loading && products.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.productList}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={() => loadProducts({ categoryId: selectedCategory || undefined, keyword: searchQuery }, true)}
                            colors={[Colors.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: Colors.primary,
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 40,
        marginRight: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
    cartButton: {
        position: 'relative',
        padding: 5,
    },
    cartIcon: {
        fontSize: 24,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    categoryContainer: {
        marginVertical: 12,
    },
    categoryChip: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeCategory: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryText: {
        color: '#333',
        fontWeight: '500',
    },
    activeCategoryText: {
        color: 'white',
    },
    productList: {
        padding: 16,
    },
    productCard: {
        backgroundColor: 'white',
        width: '48%',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 150,
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
        height: 40,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginRight: 4,
    },
    soldText: {
        fontSize: 10,
        color: '#999',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        color: '#999',
    }
});
