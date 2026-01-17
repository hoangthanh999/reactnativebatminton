// app/admin/courts/index.tsx
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
    TouchableOpacity,
    View,
} from 'react-native';

export default function AdminCourtsScreen() {
    const router = useRouter();
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadCourts = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await courtService.getMyCourts();

            if (response.success) {
                setCourts(response.data);
            }
        } catch (error: any) {
            console.error('Load courts error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách sân');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadCourts();
    }, [loadCourts]);

    const onRefresh = useCallback(() => {
        loadCourts(true);
    }, [loadCourts]);

    const handleCourtPress = (court: Court) => {
        Alert.alert(
            court.name,
            'Chọn thao tác',
            [
                {
                    text: 'Xem chi tiết',
                    onPress: () => router.push({
                        pathname: '/courts/[id]',
                        params: { id: court.id }
                    } as any),
                },
                {
                    text: 'Chỉnh sửa',
                    onPress: () => router.push({
                        pathname: '/admin/courts/edit/[id]',
                        params: { id: court.id }
                    } as any),
                },
                {
                    text: court.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt',
                    onPress: () => handleToggleStatus(court),
                },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => handleDeleteCourt(court),
                },
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleToggleStatus = async (court: Court) => {
        const newStatus = court.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        try {
            await courtService.updateCourtStatus(court.id, newStatus);
            Alert.alert('Thành công', 'Đã cập nhật trạng thái sân');
            loadCourts(true);
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật');
        }
    };

    const handleDeleteCourt = (court: Court) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa sân "${court.name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await courtService.deleteCourt(court.id);
                            Alert.alert('Thành công', 'Đã xóa sân');
                            loadCourts(true);
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa');
                        }
                    },
                },
            ]
        );
    };

    const handleCreateCourt = () => {
        router.push('/admin/courts/create' as any);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quản lý sân</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleCreateCourt}
                >
                    <Text style={styles.addButtonText}>+ Thêm sân</Text>
                </TouchableOpacity>
            </View>

            {/* Courts List */}
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
                {courts.map((court) => (
                    <CourtCard
                        key={court.id}
                        {...court}
                        onPress={() => handleCourtPress(court)}
                    />
                ))}

                {courts.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🏸</Text>
                        <Text style={styles.emptyText}>Chưa có sân nào</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={handleCreateCourt}
                        >
                            <Text style={styles.emptyButtonText}>Thêm sân đầu tiên</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    addButton: {
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    courtsContainer: {
        padding: 24,
        paddingBottom: 100,
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
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});