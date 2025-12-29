// app/(tabs)/courts.tsx
import CourtCard from '@/components/courts/CourtCard';
import { Colors } from '@/constants/Colors';
import { Court, courtService } from '@/services/courtService';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type FilterType = 'all' | 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export default function CourtsScreen() {
    const router = useRouter();
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);

    // Load courts
    const loadCourts = useCallback(async (pageNum = 0, isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await courtService.getAllCourts(pageNum, 10);

            if (response.success) {
                const newCourts = response.data.content;

                if (isRefresh || pageNum === 0) {
                    setCourts(newCourts);
                } else {
                    setCourts(prev => [...prev, ...newCourts]);
                }

                setPage(pageNum);
            }
        } catch (error: any) {
            console.error('Load courts error:', error);
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải danh sách sân');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Search courts
    const searchCourts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await courtService.searchCourts({
                name: searchQuery || undefined,
                page: 0,
                size: 20,
            });

            if (response.success) {
                setCourts(response.data.content);
            }
        } catch (error: any) {
            console.error('Search courts error:', error);
            Alert.alert('Lỗi', 'Không thể tìm kiếm sân');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        loadCourts(0);
    }, [loadCourts]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                searchCourts();
            } else {
                loadCourts(0);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, searchCourts, loadCourts]);

    const onRefresh = useCallback(() => {
        loadCourts(0, true);
    }, [loadCourts]);

    // Filter courts
    const filteredCourts = courts.filter(court => {
        if (filter === 'all') return true;
        return court.status === filter;
    });

    const filters = [
        { key: 'all' as FilterType, label: 'Tất cả', count: courts.length },
        { key: 'ACTIVE' as FilterType, label: 'Hoạt động', count: courts.filter(c => c.status === 'ACTIVE').length },
        { key: 'INACTIVE' as FilterType, label: 'Ngừng hoạt động', count: courts.filter(c => c.status === 'INACTIVE').length },
        { key: 'MAINTENANCE' as FilterType, label: 'Bảo trì', count: courts.filter(c => c.status === 'MAINTENANCE').length },
    ];

    const handleCourtPress = (courtId: number) => {
        // Sử dụng href thay vì template literal
        router.push({
            pathname: '/courts/[id]',
            params: { id: courtId }
        } as any);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Danh sách sân</Text>
                <Text style={styles.headerSubtitle}>
                    {filteredCourts.length} sân có sẵn
                </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm sân..."
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {filters.map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                            styles.filterChip,
                            filter === item.key && styles.filterChipActive,
                        ]}
                        onPress={() => setFilter(item.key)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === item.key && styles.filterTextActive,
                            ]}
                        >
                            {item.label} ({item.count})
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Courts List */}
            {loading && page === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.courtsContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                        />
                    }
                >
                    {filteredCourts.map((court) => (
                        <CourtCard
                            key={court.id}
                            {...court}
                            onPress={() => handleCourtPress(court.id)}
                        />
                    ))}

                    {filteredCourts.length === 0 && !loading && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🏸</Text>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'Không tìm thấy sân phù hợp' : 'Chưa có sân nào'}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    searchContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
    },
    searchIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    clearIcon: {
        fontSize: 18,
        color: Colors.textSecondary,
        padding: 4,
    },
    filtersContainer: {
        maxHeight: 50,
        marginBottom: 16,
    },
    filtersContent: {
        paddingHorizontal: 24,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    filterTextActive: {
        color: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    courtsContainer: {
        padding: 24,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
