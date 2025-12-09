import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const stats = [
    { icon: '🏸', label: 'Sân đang hoạt động', value: '12' },
    { icon: '📅', label: 'Đặt sân hôm nay', value: '8' },
    { icon: '💰', label: 'Doanh thu tháng', value: '25M' },
    { icon: '👥', label: 'Khách hàng', value: '156' },
  ];

  const recentBookings = [
    { id: 1, court: 'Sân 1', time: '08:00 - 10:00', customer: 'Nguyễn Văn A', status: 'confirmed' },
    { id: 2, court: 'Sân 3', time: '10:00 - 12:00', customer: 'Trần Thị B', status: 'pending' },
    { id: 3, court: 'Sân 2', time: '14:00 - 16:00', customer: 'Lê Văn C', status: 'confirmed' },
  ];

  const quickActions = [
    { icon: '➕', label: 'Đặt sân mới', color: Colors.primary, action: () => router.push('/courts') },
    { icon: '📊', label: 'Thống kê', color: Colors.success, action: () => { } },
    { icon: '💵', label: 'Thu chi', color: Colors.error, action: () => { } },
    { icon: '⚙️', label: 'Cài đặt', color: Colors.textSecondary, action: () => { } },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào 👋</Text>
          <Text style={styles.userName}>Quản lý sân</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Avatar name="Admin" size={50} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card key={index} variant="elevated" style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

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

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đặt sân gần đây</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {recentBookings.map((booking) => (
            <Card key={booking.id} variant="elevated" style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View>
                  <Text style={styles.courtName}>{booking.court}</Text>
                  <Text style={styles.bookingTime}>⏰ {booking.time}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: booking.status === 'confirmed' ? Colors.success + '20' : Colors.error + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: booking.status === 'confirmed' ? Colors.success : Colors.error }
                  ]}>
                    {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                  </Text>
                </View>
              </View>
              <Text style={styles.customerName}>👤 {booking.customer}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 56) / 2,
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
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
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  bookingCard: {
    marginBottom: 12,
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courtName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
