import CourtCard from '@/components/courts/CourtCard';
import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type FilterType = 'all' | 'available' | 'occupied' | 'maintenance';

export default function CourtsScreen() {
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const courts = [
        { id: 1, name: 'Sân 1', status: 'available' as const, price: '100.000đ', currentBooking: undefined },
        { id: 2, name: 'Sân 2', status: 'occupied' as const, price: '100.000đ', currentBooking: '08:00 - 10:00' },
        { id: 3, name: 'Sân 3', status: 'available' as const, price: '120.000đ', currentBooking: undefined },
        { id: 4, name: 'Sân 4', status: 'occupied' as const, price: '100.000đ', currentBooking: '10:00 - 12:00' },
        { id: 5, name: 'Sân 5', status: 'maintenance' as const, price: '100.000đ', currentBooking: undefined },
        { id: 6, name: 'Sân 6', status: 'available' as const, price: '120.000đ', currentBooking: undefined },
    ];

    const filters = [
        { key: 'all' as FilterType, label: 'Tất cả', count: courts.length },
        { key: 'available' as FilterType, label: 'Trống', count: courts.filter(c => c.status === 'available').length },
        { key: 'occupied' as FilterType, label: 'Đang dùng', count: courts.filter(c => c.status === 'occupied').length },
        { key: 'maintenance' as FilterType, label: 'Bảo trì', count: courts.filter(c => c.status === 'maintenance').length },
    ];

    const filteredCourts = courts.filter(court => {
        const matchFilter = filter === 'all' || court.status === filter;
        const matchSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quản lý sân</Text>
                <Text style={styles.headerSubtitle}>Tổng số: {courts.length} sân</Text>
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
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.courtsContainer}
                showsVerticalScrollIndicator={false}
            >
                {filteredCourts.map((court) => (
                    <CourtCard
                        key={court.id}
                        {...court}
                        onPress={() => console.log('Court pressed:', court.id)}
                    />
                ))}

                {filteredCourts.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🏸</Text>
                        <Text style={styles.emptyText}>Không tìm thấy sân nào</Text>
                    </View>
                )}
            </ScrollView>

            {/* Add Court Button */}
            <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            </View>
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
    filtersContainer: {
        maxHeight: 50,
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
    },
    fabContainer: {
        position: 'absolute',
        bottom: 80,
        right: 24,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: Colors.white,
        fontWeight: '300',
    },
});
