// components/chat/ChatInput.tsx
import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ChatInputProps {
    onSend: (message: string) => void;
    loading: boolean;
}

export default function ChatInput({ onSend, loading }: ChatInputProps) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim() && !loading) {
            onSend(text.trim());
            setText('');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhắn tin với AI..."
                    placeholderTextColor={Colors.textSecondary}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={500}
                    editable={!loading}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!text.trim() || loading) && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!text.trim() || loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                        <Text style={styles.sendIcon}>➤</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingRight: 50,
        fontSize: 15,
        maxHeight: 100,
        color: Colors.text,
    },
    sendButton: {
        position: 'absolute',
        right: 4,
        bottom: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: Colors.textSecondary,
    },
    sendIcon: {
        fontSize: 18,
        color: Colors.white,
    },
});
