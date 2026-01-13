// services/paymentService.ts
import apiClient from "./apiClient";

export interface PaymentRequest {
    bookingId: number;
    paymentType: 'FULL' | 'DEPOSIT';
    returnUrl?: string;
}

export interface Payment {
    id: number;
    bookingId: number;
    amount: number;
    depositAmount: number;
    remainingAmount: number;
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY';
    paymentType: 'FULL' | 'DEPOSIT';
    status: 'PENDING' | 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'EXPIRED';
    transactionId?: string;
    orderId: string;
    requestId: string;
    createdAt: string;
    paidAt?: string;
    expiredAt?: string;
}

export interface MoMoPaymentResponse {
    payUrl: string;
    orderId: string;
    requestId: string;
    message: string;
    resultCode: number;
}

export const paymentService = {
    // Tạo thanh toán MoMo
    createMoMoPayment: async (data: PaymentRequest): Promise<MoMoPaymentResponse> => {
        try {
            const response = await apiClient.post('/payments/momo/create', data);
            return response.data.data;
        } catch (error) {
            console.error('❌ Create MoMo payment error:', error);
            throw error;
        }
    },

    // ✅ THÊM MỚI - Xác nhận mock payment
    confirmMockPayment: async (orderId: string, resultCode: number = 0): Promise<Payment> => {
        try {
            const response = await apiClient.post(
                `/payments/mock/confirm/${orderId}`,
                null,
                { params: { resultCode } }
            );
            return response.data.data;
        } catch (error) {
            console.error('❌ Confirm mock payment error:', error);
            throw error;
        }
    },

    // Lấy thông tin payment theo booking
    getPaymentByBooking: async (bookingId: number): Promise<Payment> => {
        try {
            const response = await apiClient.get(`/payments/booking/${bookingId}`);
            return response.data.data;
        } catch (error) {
            console.error('❌ Get payment by booking error:', error);
            throw error;
        }
    },

    // Kiểm tra trạng thái thanh toán
    checkPaymentStatus: async (bookingId: number): Promise<Payment> => {
        try {
            const response = await apiClient.get(`/payments/booking/${bookingId}`);
            return response.data.data;
        } catch (error) {
            console.error('❌ Check payment status error:', error);
            throw error;
        }
    },
};
