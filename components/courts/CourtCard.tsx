import { Colors } from '@/constants/Colors';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CourtCardProps {
    id: number;
    name: string;
    address: string;
    pricePerHour: number;
    numberOfCourts: number;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    images?: string[];  // ✅ Đổi sang images array
    onPress: () => void;
}

export default function CourtCard({
    name,
    address,
    pricePerHour,
    numberOfCourts,
    status,
    images,  // ✅ Nhận images thay vì imageUrl
    onPress,
}: CourtCardProps) {
    const getStatusInfo = () => {
        switch (status) {
            case 'ACTIVE':
                return { label: 'Hoạt động', color: Colors.success, icon: '✓' };
            case 'INACTIVE':
                return { label: 'Ngừng hoạt động', color: Colors.textSecondary, icon: '○' };
            case 'MAINTENANCE':
                return { label: 'Bảo trì', color: Colors.warning, icon: '⚠' };
        }
    };

    const statusInfo = getStatusInfo();

    // ✅ Lấy ảnh đầu tiên
    const imageUrl = images && images.length > 0 ? images[0] : undefined;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Image */}
            <View style={styles.imageContainer}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                    />
                ) : (
                    <View style={[styles.image, styles.placeholderImage]}>
                        <Text style={styles.placeholderIcon}>🏸</Text>
                    </View>
                )}

                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                    <Text style={styles.statusText}>{statusInfo.label}</Text>
                </View>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.address} numberOfLines={1}>📍 {address}</Text>

                <View style={styles.footer}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>
                            {pricePerHour.toLocaleString('vi-VN')}đ
                        </Text>
                        <Text style={styles.priceUnit}>/giờ</Text>
                    </View>
                    <View style={styles.courtsInfo}>
                        <Text style={styles.courtsText}>{numberOfCourts} sân</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 180,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        backgroundColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 48,
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    info: {
        padding: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 6,
    },
    address: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    priceUnit: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    courtsInfo: {
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    courtsText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
});