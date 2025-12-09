import { Colors } from '@/constants/Colors';
import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface AvatarProps {
    source?: string;
    name?: string;
    size?: number;
    style?: ViewStyle;
}

export default function Avatar({
    source,
    name = 'User',
    size = 50,
    style,
}: AvatarProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <View
            style={[
                styles.container,
                { width: size, height: size, borderRadius: size / 2 },
                style,
            ]}
        >
            {source ? (
                <Image
                    source={{ uri: source }}
                    style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
                />
            ) : (
                <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
                    {getInitials(name)}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    initials: {
        color: Colors.white,
        fontWeight: 'bold',
    },
});
