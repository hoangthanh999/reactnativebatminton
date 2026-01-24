// components/chat/ChatBubble.tsx
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ChatBubbleProps {
    message: string;
    isUser: boolean;
    timestamp: string;
}

export default function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
    const formatTime = (isoString: string) => {
        try {
            // ✅ XỬ LÝ CẢ ISO VÀ CUSTOM FORMAT
            const date = new Date(isoString);

            // ✅ KIỂM TRA VALID DATE
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', isoString);
                return 'Vừa xong';
            }

            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Vừa xong';
        }
    };

    return (
        <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.message, isUser ? styles.userMessage : styles.aiMessage]}>
                    {message}
                </Text>
                <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
                    {formatTime(timestamp)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    aiContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: Colors.surface,
        borderBottomLeftRadius: 4,
    },
    message: {
        fontSize: 15,
        lineHeight: 20,
    },
    userMessage: {
        color: Colors.white,
    },
    aiMessage: {
        color: Colors.text,
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
    },
    userTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'right',
    },
    aiTimestamp: {
        color: Colors.textSecondary,
    },
});
