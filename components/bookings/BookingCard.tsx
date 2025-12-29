// components/bookings/BookingCard.tsx
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BookingCardProps {
    id: number;
    courtName: string;
    courtAddress: string;
    courtNumber: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    onPress: () => void;
}

export default function BookingCard({
    courtName,
    courtAddress,
    courtNumber,
    bookingDate,
    startTime,
    endTime,
    totalPrice,
    status,
    onPress,
}: BookingCardProps) {
    const getStatusInfo = () => {
        switch (status) {
            case 'CONFIRMED':
                return { label: 'Đã xác nhận', color: Colors.success, icon: '✓' };
            case 'PENDING':
                return { label: 'Chờ xác nhận', color: Colors.warning, icon: '⏳' };
            case 'CANCELLED':
                return { label: 'Đã hủy', color: Colors.error, icon: '✕' };
            case 'COMPLETED':
                return { label: 'Hoàn thành', color: Colors.primary, icon: '✓' };
        }
    };

    const statusInfo = getStatusInfo();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.courtInfo}>
                    <Text style={styles.courtName}>{courtName}</Text>
                    <Text style={styles.courtNumber}>Sân {courtNumber}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.icon} {statusInfo.label}
                    </Text>
                </View>
            </View>

            <Text style={styles.address} numberOfLines={1}>📍 {courtAddress}</Text>

            <View style={styles.divider} />

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <Text style={styles.detailText}>{formatDate(bookingDate)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>⏰</Text>
                    <Text style={styles.detailText}>{startTime} - {endTime}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.priceLabel}>Tổng tiền:</Text>
                <Text style={styles.price}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    courtInfo: {
        flex: 1,
    },
    courtName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    courtNumber: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
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
    address: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 12,
    },
    details: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    detailText: {
        fontSize: 14,
        color: Colors.text,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    priceLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});
