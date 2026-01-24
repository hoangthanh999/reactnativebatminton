// app/(tabs)/chat.tsx
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import ProductListMessage from '@/components/chat/ProductListMessage';
import QuickActionButton from '@/components/chat/QuickActionButton';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { Colors } from '@/constants/Colors';
import { useChat } from '@/hooks/useChat';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function ChatScreen() {
    const { messages, loading, sendMessage, handleQuickAction, clearChat, scrollViewRef } = useChat();
    const insets = useSafeAreaInsets();

    const handleClearChat = () => {
        Alert.alert(
            'Xóa lịch sử chat',
            'Bạn có chắc muốn xóa toàn bộ lịch sử chat?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: clearChat },
            ]
        );
    };

    const renderMessage = (message: any, index: number) => {
        return (
            <View key={index}>
                {/* User Message */}
                {message.userMessage && !message.userMessage.startsWith('ACTION:') && (
                    <ChatBubble
                        message={message.userMessage}
                        isUser={true}
                        timestamp={message.timestamp}
                    />
                )}

                {/* AI Response */}
                {message.aiResponse && (
                    <>
                        <ChatBubble
                            message={message.aiResponse}
                            isUser={false}
                            timestamp={message.timestamp}
                        />

                        {/* Product List */}
                        {message.messageType === 'PRODUCT_LIST' &&
                            message.actionData?.products && (
                                <ProductListMessage
                                    products={message.actionData.products}
                                    onAddToCart={(productId) => {
                                        handleQuickAction({
                                            label: 'Thêm vào giỏ',
                                            action: 'ADD_TO_CART',
                                            params: { productId, quantity: 1 }
                                        });
                                    }}
                                    onBuyNow={(productId) => {
                                        handleQuickAction({
                                            label: 'Mua ngay',
                                            action: 'BUY_NOW',
                                            params: { productId, quantity: 1 }
                                        });
                                    }}
                                    onViewDetail={(productId) => {
                                        handleQuickAction({
                                            label: 'Xem chi tiết',
                                            action: 'VIEW_PRODUCT_DETAIL',
                                            params: { productId }
                                        });
                                    }}
                                />
                            )}

                        {/* Quick Actions */}
                        {message.quickActions && message.quickActions.length > 0 && (
                            <View style={styles.quickActionsContainer}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.quickActionsContent}
                                >
                                    {message.quickActions.map((action: any, idx: number) => (
                                        <QuickActionButton
                                            key={idx}
                                            action={action}
                                            onPress={handleQuickAction}
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar style="light" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View>
                    <Text style={styles.headerTitle}>🤖 AI Assistant</Text>
                    <Text style={styles.headerSubtitle}>
                        {messages.length > 0 ? `${messages.length} tin nhắn` : 'Bắt đầu trò chuyện'}
                    </Text>
                </View>
                {messages.length > 0 && (
                    <TouchableOpacity style={styles.clearButton} onPress={handleClearChat}>
                        <Text style={styles.clearIcon}>🗑️</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>💬</Text>
                        <Text style={styles.emptyTitle}>Chào bạn!</Text>
                        <Text style={styles.emptyText}>
                            Tôi có thể giúp bạn:{'\n\n'}
                            🏸 Tìm và đặt sân cầu lông{'\n'}
                            🛍️ Mua sắm sản phẩm thể thao{'\n'}
                            👑 Xem thông tin cấp bậc{'\n\n'}
                            Hãy hỏi tôi bất cứ điều gì!
                        </Text>
                    </View>
                ) : (
                    messages.map((message, index) => renderMessage(message, index))
                )}

                {loading && <TypingIndicator />}

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Input */}
            <ChatInput onSend={sendMessage} loading={loading} />
        </KeyboardAvoidingView>
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
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },
    clearButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearIcon: {
        fontSize: 20,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: 16,
    },
    quickActionsContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    quickActionsContent: {
        paddingRight: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
});