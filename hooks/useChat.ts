// hooks/useChat.ts
import { ChatMessage, ChatRequest, chatService, QuickAction } from '@/services/chatService';
import { paymentService } from '@/services/paymentService'; // ← ĐÃ CÓ
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

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

            // ✅ THÊM DEBUG ĐẦY ĐỦ
            console.log('📥 ===== CHAT RESPONSE =====');
            console.log('📥 Full response:', JSON.stringify(response, null, 2));
            console.log('📥 AI Response:', response.aiResponse);
            console.log('📥 Message Type:', response.messageType);
            console.log('📥 Quick Actions:', response.quickActions);
            console.log('📥 Quick Actions Count:', response.quickActions?.length);

            if (response.quickActions) {
                response.quickActions.forEach((action, idx) => {
                    console.log(`📥 Action ${idx}:`, JSON.stringify(action, null, 2));
                });
            }
            console.log('📥 ===========================');

            if (response.sessionId && !sessionId) {
                setSessionId(response.sessionId);
            }

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

            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error: any) {
            console.error('❌ Send message error:', error);
            console.error('❌ Error details:', error.response?.data);

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


    // ✅ SỬA: Xử lý thanh toán VNPay
    const handleVNPayPayment = useCallback(async (
        type: 'booking' | 'order',
        id: number,
        paymentType?: 'DEPOSIT' | 'FULL'
    ) => {
        try {
            setLoading(true);

            let paymentResponse;
            if (type === 'booking') {
                // ✅ SỬA: Dùng createVNPayPayment
                paymentResponse = await paymentService.createVNPayPayment(
                    id,
                    paymentType || 'DEPOSIT'
                );
            } else {
                // ✅ SỬA: Dùng createVNPayOrderPayment
                paymentResponse = await paymentService.createVNPayOrderPayment(id);
            }

            const canOpen = await Linking.canOpenURL(paymentResponse.paymentUrl);
            if (canOpen) {
                await Linking.openURL(paymentResponse.paymentUrl);

                const infoMessage: ChatMessage = {
                    userMessage: '',
                    aiResponse: `✅ Đã tạo link thanh toán VNPay!\n\nMã giao dịch: ${paymentResponse.txnRef}\nSố tiền: ${paymentResponse.amount.toLocaleString('vi-VN')}đ\n\nVui lòng hoàn tất thanh toán trong trình duyệt.`,
                    messageType: 'TEXT',
                    timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, infoMessage]);
            } else {
                throw new Error('Không thể mở link thanh toán');
            }
        } catch (error: any) {
            console.error('VNPay payment error:', error);
            Alert.alert(
                'Lỗi thanh toán',
                error.response?.data?.message || 'Không thể tạo thanh toán VNPay'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ SỬA: Xử lý thanh toán MoMo
    const handleMoMoPayment = useCallback(async (
        type: 'booking' | 'order',
        id: number,
        paymentType?: 'DEPOSIT' | 'FULL'
    ) => {
        try {
            setLoading(true);

            let paymentResponse;
            if (type === 'booking') {
                // ✅ SỬA: Dùng createMoMoPayment
                paymentResponse = await paymentService.createMoMoPayment({
                    bookingId: id,
                    paymentType: paymentType || 'DEPOSIT'
                });
            } else {
                // ✅ SỬA: Dùng createMoMoOrderPayment
                paymentResponse = await paymentService.createMoMoOrderPayment(id);
            }

            const canOpen = await Linking.canOpenURL(paymentResponse.payUrl);
            if (canOpen) {
                await Linking.openURL(paymentResponse.payUrl);

                const infoMessage: ChatMessage = {
                    userMessage: '',
                    aiResponse: `✅ Đã tạo link thanh toán MoMo!\n\nMã giao dịch: ${paymentResponse.orderId}\n\nVui lòng hoàn tất thanh toán trong ứng dụng MoMo.`,
                    messageType: 'TEXT',
                    timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, infoMessage]);
            } else {
                throw new Error('Không thể mở link thanh toán');
            }
        } catch (error: any) {
            console.error('MoMo payment error:', error);
            Alert.alert(
                'Lỗi thanh toán',
                error.response?.data?.message || 'Không thể tạo thanh toán MoMo'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ THÊM: Xử lý thanh toán PayOS
    const handlePayOSPayment = useCallback(async (
        type: 'booking' | 'order',
        id: number
    ) => {
        try {
            setLoading(true);

            if (type === 'order') {
                // ✅ Tạo PayOS payment cho order
                const paymentResponse = await paymentService.createPayOSOrderPayment(id);

                const canOpen = await Linking.canOpenURL(paymentResponse.checkoutUrl);
                if (canOpen) {
                    await Linking.openURL(paymentResponse.checkoutUrl);

                    const infoMessage: ChatMessage = {
                        userMessage: '',
                        aiResponse: `✅ Đã tạo link thanh toán PayOS!\n\nMã đơn hàng: ${paymentResponse.orderCode}\nSố tiền: ${paymentResponse.amount.toLocaleString('vi-VN')}đ\n\nVui lòng hoàn tất thanh toán trong trình duyệt.`,
                        messageType: 'TEXT',
                        timestamp: new Date().toISOString(),
                    };
                    setMessages(prev => [...prev, infoMessage]);
                } else {
                    throw new Error('Không thể mở link thanh toán');
                }
            }
        } catch (error: any) {
            console.error('PayOS payment error:', error);
            Alert.alert(
                'Lỗi thanh toán',
                error.response?.data?.message || 'Không thể tạo thanh toán PayOS'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const handleQuickAction = useCallback((action: QuickAction) => {
        console.log('🔵 Quick action:', action);

        switch (action.action) {
            case 'PAY_VNPAY':
                if (action.params?.orderId) {
                    handleVNPayPayment('order', action.params.orderId);
                } else if (action.params?.bookingId) {
                    handleVNPayPayment(
                        'booking',
                        action.params.bookingId,
                        action.params.paymentType
                    );
                }
                break;

            case 'PAY_MOMO':
                if (action.params?.orderId) {
                    handleMoMoPayment('order', action.params.orderId);
                } else if (action.params?.bookingId) {
                    handleMoMoPayment(
                        'booking',
                        action.params.bookingId,
                        action.params.paymentType
                    );
                }
                break;

            case 'PAY_PAYOS':
                if (action.params?.orderId) {
                    handlePayOSPayment('order', action.params.orderId);
                }
                break;

            case 'SEARCH_COURTS':
                sendMessage('Tìm sân gần tôi');
                break;
            case 'SEARCH_PRODUCTS':
                sendMessage('Tìm sản phẩm');
                break;
            case 'VIEW_TIER':
                sendMessage('Xem thông tin cấp bậc');
                break;
            case 'VIEW_CART':
                sendMessage('Xem giỏ hàng');
                break;
            default:
                const actionMessage = `ACTION:${JSON.stringify({
                    action: action.action,
                    ...action.params
                })}`;
                sendMessage(actionMessage);
        }
    }, [sendMessage, handleVNPayPayment, handleMoMoPayment, handlePayOSPayment]);

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
