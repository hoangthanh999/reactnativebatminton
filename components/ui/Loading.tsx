import { Colors } from '@/constants/Colors';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface LoadingProps {
    visible?: boolean;
    text?: string;
    overlay?: boolean;
}

export default function Loading({
    visible = true,
    text = 'Đang tải...',
    overlay = false,
}: LoadingProps) {
    if (!visible) return null;

    const content = (
        <View style={styles.container}>
            <View style={styles.content}>
                <ActivityIndicator size="large" color={Colors.primary} />
                {text && <Text style={styles.text}>{text}</Text>}
            </View>
        </View>
    );

    if (overlay) {
        return (
            <Modal transparent visible={visible} animationType="fade">
                {content}
            </Modal>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
        backgroundColor: Colors.white,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        minWidth: 150,
    },
    text: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.text,
        fontWeight: '600',
    },
});
