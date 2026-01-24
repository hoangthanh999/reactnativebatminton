// components/chat/QuickActionButton.tsx
import { Colors } from '@/constants/Colors';
import { QuickAction } from '@/services/chatService';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface QuickActionButtonProps {
    action: QuickAction;
    onPress: (action: QuickAction) => void;
}

export default function QuickActionButton({ action, onPress }: QuickActionButtonProps) {
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={() => onPress(action)}
            activeOpacity={0.7}
        >
            <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.primary + '15',
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
});
