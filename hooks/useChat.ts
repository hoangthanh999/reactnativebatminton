// hooks/useChat.ts
import { ChatMessage, ChatRequest, chatService, QuickAction } from '@/services/chatService';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const scrollViewRef = useRef<any>(null);

    // Request location permission
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
            }
        })();
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        // Add user message
        const userMessage: ChatMessage = {
            userMessage: text,
            aiResponse: '',
            messageType: 'TEXT',
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);

        setLoading(true);

        try {
            const request: ChatRequest = {
                message: text,
                sessionId: sessionId || undefined,
                latitude: location?.latitude,
                longitude: location?.longitude,
            };

            const response = await chatService.sendMessage(request);

            // Update session ID
            if (response.sessionId && !sessionId) {
                setSessionId(response.sessionId);
            }

            // Add AI response
            const aiMessage: ChatMessage = {
                userMessage: text,
                aiResponse: response.aiResponse,
                messageType: response.messageType,
                actionData: response.actionData,
                quickActions: response.quickActions,
                timestamp: response.timestamp,
                sessionId: response.sessionId,
            };

            setMessages(prev => [...prev.slice(0, -1), aiMessage]);

            // Auto scroll to bottom
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error: any) {
            console.error('Send message error:', error);

            // Add error message
            const errorMessage: ChatMessage = {
                userMessage: text,
                aiResponse: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
                messageType: 'TEXT',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev.slice(0, -1), errorMessage]);
        } finally {
            setLoading(false);
        }
    }, [sessionId, location]);


    const handleQuickAction = useCallback((action: QuickAction) => {
        // Handle different action types
        switch (action.action) {
            case 'SEARCH_COURTS':
                sendMessage('Tìm sân gần tôi');
                break;
            case 'SEARCH_PRODUCTS':
                sendMessage('Tìm sản phẩm');
                break;
            case 'VIEW_TIER':
                sendMessage('Xem thông tin cấp bậc');
                break;
            case 'BOOK_COURT':
                sendMessage(`Đặt sân ${action.params?.courtId}`);
                break;
            case 'BUY_PRODUCT':
                sendMessage(`Mua sản phẩm ${action.params?.productId}`);
                break;
            default:
                sendMessage(action.label);
        }
        const actionMessage = `ACTION:${JSON.stringify({
            action: action.action,
            ...action.params
        })}`;

        sendMessage(actionMessage);
    }, [sendMessage]);

    const clearChat = useCallback(async () => {
        if (sessionId) {
            try {
                await chatService.clearSession(sessionId);
            } catch (error) {
                console.error('Clear session error:', error);
            }
        }
        setMessages([]);
        setSessionId(null);
    }, [sessionId]);

    return {
        messages,
        loading,
        sessionId,
        sendMessage,
        handleQuickAction,
        clearChat,
        scrollViewRef,
    };
}
