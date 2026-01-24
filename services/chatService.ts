// services/chatService.ts
import apiClient from "./apiClient";

export interface ChatMessage {
    id?: number;
    userMessage: string;
    aiResponse: string;
    messageType: 'TEXT' | 'COURT_LIST' | 'PRODUCT_LIST' | 'BOOKING_CONFIRM' | 'ORDER_CONFIRM';
    actionData?: any;
    quickActions?: QuickAction[];
    timestamp: string;
    sessionId?: string;
}

export interface QuickAction {
    label: string;
    action: string;
    params?: Record<string, any>;
}

export interface ChatRequest {
    message: string;
    sessionId?: string;
    latitude?: number;
    longitude?: number;
}

export interface ChatResponse {
    messageId?: number;
    aiResponse: string;
    messageType: 'TEXT' | 'COURT_LIST' | 'PRODUCT_LIST' | 'BOOKING_CONFIRM' | 'ORDER_CONFIRM';
    actionData?: any;
    quickActions?: QuickAction[];
    sessionId: string;
    timestamp: string;
}

export const chatService = {
    sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
        try {
            const response = await apiClient.post('/chat/message', data);
            return response.data.data;
        } catch (error) {
            console.error('❌ Send chat message error:', error);
            throw error;
        }
    },

    getChatHistory: async (page = 0, size = 50) => {
        try {
            const response = await apiClient.get('/chat/history', {
                params: { page, size },
            });
            return response.data.data;
        } catch (error) {
            console.error('❌ Get chat history error:', error);
            throw error;
        }
    },

    clearSession: async (sessionId: string) => {
        try {
            const response = await apiClient.delete(`/chat/session/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Clear session error:', error);
            throw error;
        }
    },
};
