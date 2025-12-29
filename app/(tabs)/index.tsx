// app/(tabs)/index.tsx
import BookingCard from '@/components/bookings/BookingCard';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Booking, bookingService } from '@/services/bookingService';
import { UserProfile, userService } from '@/services/userService';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
  });

  const loadUserData = useCallback(async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Load user error:', error);
    }
  }, []);

  const loadBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await bookingService.getMyBookings(0, 5);

      if (response.success) {
        const bookingData = response.data.content;
        setBookings(bookingData);

        // Calculate stats
        setStats({
          totalBookings: response.data.totalElements,
          confirmedBookings: bookingData.filter((b: Booking) => b.status === 'CONFIRMED').length,
          pendingBookings: bookingData.filter((b: Booking) => b.status === 'PENDING').length,
          completedBookings: bookingData.filter((b: Booking) => b.status === 'COMPLETED').length,
        });
      }
    } catch (error: any) {
      console.error('Load bookings error:', error);
      // Không hiển thị alert nếu chưa đăng nhập
      if (error.response?.status !== 401) {
        Alert.alert('Lỗi', 'Không thể tải danh sách đặt sân');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    loadBookings();
  }, [loadUserData, loadBookings]);

  const onRefresh = useCallback(() => {
    loadUserData();
    loadBookings(true);
  }, [loadUserData, loadBookings]);

  const navigateToBookings = useCallback(() => {
    // Sử dụng replace thay vì push cho tab navigation
    router.push('/bookings' as any);
  }, []);

  const navigateToCourts = useCallback(() => {
    router.push('/courts' as any);
  }, []);

  const navigateToProfile = useCallback(() => {
    router.push('/profile' as any);
  }, []);

  const quickActions = [
    {
      icon: '🏸',
      label: 'Đặt sân',
      color: Colors.primary,
      action: navigateToCourts,
    },
    {
      icon: '📋',
      label: 'Lịch sử',
      color: Colors.success,
      action: navigateToBookings,
    },
    {
      icon: '👤',
      label: 'Hồ sơ',
      color: Colors.secondary,
      action: navigateToProfile,
    },
    {
      icon: '💬',
      label: 'Hỗ trợ',
      color: Colors.error,
      action: () => Alert.alert('Hỗ trợ', 'Liên hệ: 0123456789'),
    },
  ];

  const statsData = [
    { icon: '📊', label: 'Tổng đặt sân', value: stats.totalBookings.toString(), color: Colors.primary },
    { icon: '✓', label: 'Đã xác nhận', value: stats.confirmedBookings.toString(), color: Colors.success },
    { icon: '⏳', label: 'Chờ xác nhận', value: stats.pendingBookings.toString(), color: Colors.warning },
    { icon: '✓', label: 'Hoàn thành', value: stats.completedBookings.toString(), color: Colors.secondary },
  ];

  const handleBookingPress = useCallback((bookingId: number) => {
    router.push({
      pathname: '/bookings/[id]',
      params: { id: bookingId }
    } as any);
  }, []);

  if (loading && !refreshing) {
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
        <View>
          <Text style={styles.greeting}>Xin chào 👋</Text>
          <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
        </View>
        <TouchableOpacity onPress={navigateToProfile}>
          <Avatar name={user?.fullName || 'User'} size={50} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.action}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Thống kê</Text>
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => (
              <Card key={index} variant="elevated" style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đặt sân gần đây</Text>
            <TouchableOpacity onPress={navigateToBookings}>
              <Text style={styles.seeAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                {...booking}
                onPress={() => handleBookingPress(booking.id)}
              />
            ))
          ) : (
            <Card variant="elevated" style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🏸</Text>
              <Text style={styles.emptyText}>Chưa có lịch đặt sân nào</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={navigateToCourts}
              >
                <Text style={styles.emptyButtonText}>Đặt sân ngay</Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>

        {/* News/Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tin tức & Mẹo hay</Text>

          <Card variant="elevated" style={styles.newsCard}>
            <Text style={styles.newsIcon}>📰</Text>
            <Text style={styles.newsTitle}>Khuyến mãi đặc biệt</Text>
            <Text style={styles.newsContent}>
              Giảm 20% cho lần đặt sân đầu tiên trong tháng này!
            </Text>
            <Text style={styles.newsDate}>Hôm nay</Text>
          </Card>

          <Card variant="elevated" style={styles.newsCard}>
            <Text style={styles.newsIcon}>💡</Text>
            <Text style={styles.newsTitle}>Mẹo chơi cầu lông</Text>
            <Text style={styles.newsContent}>
              5 kỹ thuật cơ bản giúp bạn cải thiện kỹ năng chơi cầu lông.
            </Text>
            <Text style={styles.newsDate}>2 ngày trước</Text>
          </Card>
        </View>

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
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 68) / 4,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 28,
  },
  quickActionLabel: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
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
  newsCard: {
    padding: 16,
    marginBottom: 12,
  },
  newsIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  newsContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
