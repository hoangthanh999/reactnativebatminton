import Card from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CourtCardProps {
    id: number;
    name: string;
    status: 'available' | 'occupied' | 'maintenance';
    price: string;
    currentBooking?: string;
    onPress: () => void;
}

export default function CourtCard({
    name,
    status,
    price,
    currentBooking,
    onPress,
}: CourtCardProps) {
    const statusConfig = {
        available: { label: 'Trống', color: Colors.success, icon: '✓' },
        occupied: { label: 'Đang sử dụng', color: Colors.error, icon: '⏱' },
        maintenance: { label: 'Bảo trì', color: Colors.textSecondary, icon: '🔧' },
    };

    const config = statusConfig[status];

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card variant="elevated" style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.name}>{name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
                        <Text style={styles.statusIcon}>{config.icon}</Text>
                        <Text style={[styles.statusText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.info}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>💰 Giá thuê:</Text>
                        <Text style={styles.infoValue}>{price}/giờ</Text>
                    </View>

                    {currentBooking && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>⏰ Đang đặt:</Text>
                            <Text style={styles.infoValue}>{currentBooking}</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.button} onPress={onPress}>
                    <Text style={styles.buttonText}>
                        {status === 'available' ? 'Đặt sân' : 'Xem chi tiết'}
                    </Text>
                </TouchableOpacity>
            </Card>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    statusIcon: {
        fontSize: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    info: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
});
