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

// ✅ THÊM: VNPay Payment Response
export interface VNPayPaymentResponse {
    paymentUrl: string;
    txnRef: string;
    amount: number;
    message?: string;
}

// ✅ THÊM: PayOS Payment Response  
export interface PayOSPaymentResponse {
    checkoutUrl: string;
    orderCode: string;
    amount: number;
}

export const paymentService = {
    // ==================== MOMO PAYMENT ====================

    // Tạo thanh toán MoMo cho booking
    createMoMoPayment: async (data: PaymentRequest): Promise<MoMoPaymentResponse> => {
        try {
            const response = await apiClient.post('/payments/momo/create', data);
            return response.data.data;
        } catch (error) {
            console.error('❌ Create MoMo payment error:', error);
            throw error;
        }
    },

    // ✅ THÊM: Tạo thanh toán MoMo cho order
    createMoMoOrderPayment: async (orderId: number): Promise<MoMoPaymentResponse> => {
        try {
            const response = await apiClient.post(
                `/shop/payments/momo/create/${orderId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('❌ Create MoMo order payment error:', error);
            throw error;
        }
    },

    // ==================== VNPAY PAYMENT ====================

    // ✅ THÊM: Tạo thanh toán VNPay cho booking
    createVNPayPayment: async (
        bookingId: number,
        paymentType: 'DEPOSIT' | 'FULL' = 'DEPOSIT'
    ): Promise<VNPayPaymentResponse> => {
        try {
            const response = await apiClient.post(
                `/payments/vnpay/create-booking/${bookingId}`,
                null,
                { params: { paymentType } }
            );
            return response.data.data;
        } catch (error) {
            console.error('❌ Create VNPay booking payment error:', error);
            throw error;
        }
    },

    // ✅ THÊM: Tạo thanh toán VNPay cho order
    createVNPayOrderPayment: async (orderId: number): Promise<VNPayPaymentResponse> => {
        try {
            const response = await apiClient.post(
                `/payments/vnpay/create-order/${orderId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('❌ Create VNPay order payment error:', error);
            throw error;
        }
    },

    // ==================== PAYOS PAYMENT ====================

    // ✅ THÊM: Tạo thanh toán PayOS cho order
    createPayOSOrderPayment: async (orderId: number): Promise<PayOSPaymentResponse> => {
        try {
            const response = await apiClient.post(
                `/payments/payos/create-order/${orderId}`
            );
            return response.data;
        } catch (error) {
            console.error('❌ Create PayOS order payment error:', error);
            throw error;
        }
    },

    // ==================== MOCK PAYMENT ====================

    // Xác nhận mock payment (cho testing)
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

    // ✅ THÊM: Xác nhận mock payment cho shop order
    confirmMockOrderPayment: async (momoOrderId: string, resultCode: number = 0): Promise<void> => {
        try {
            await apiClient.post(
                `/shop/payments/mock/confirm/${momoOrderId}`,
                null,
                { params: { resultCode } }
            );
        } catch (error) {
            console.error('❌ Confirm mock order payment error:', error);
            throw error;
        }
    },

    // ==================== PAYMENT INFO ====================

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

    // ✅ THÊM: Lấy tất cả payments (admin)
    getAllPayments: async (page: number = 0, size: number = 10) => {
        try {
            const response = await apiClient.get('/payments/admin/all', {
                params: { page, size }
            });
            return response.data.data;
        } catch (error) {
            console.error('❌ Get all payments error:', error);
            throw error;
        }
    },

    // ✅ THÊM: Lấy payments theo status (admin)
    getPaymentsByStatus: async (status: string, page: number = 0, size: number = 10) => {
        try {
            const response = await apiClient.get(`/payments/admin/status/${status}`, {
                params: { page, size }
            });
            return response.data.data;
        } catch (error) {
            console.error('❌ Get payments by status error:', error);
            throw error;
        }
    },

    // ✅ THÊM: Lấy pending payments (admin)
    getPendingPayments: async () => {
        try {
            const response = await apiClient.get('/payments/admin/pending');
            return response.data.data;
        } catch (error) {
            console.error('❌ Get pending payments error:', error);
            throw error;
        }
    },
};
