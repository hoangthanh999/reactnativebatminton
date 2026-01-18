// services/orderService.ts
import apiClient from "./apiClient";
import { Order } from "../types/shop";
import { ApiResponse, Page } from "../types/api";

export interface CreateOrderRequest {
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingProvince: string;
    shippingDistrict: string;
    shippingWard: string;
    note?: string;
    paymentMethod: 'COD' | 'MOMO' | 'VNPAY' | 'ZALOPAY';
}

export const orderService = {
    // Tạo đơn hàng
    createOrder: async (data: CreateOrderRequest) => {
        const response = await apiClient.post<ApiResponse<Order>>('/shop/orders', data);
        return response.data;
    },

    // Lấy danh sách đơn hàng của tôi
    getMyOrders: async (page = 0, size = 10, status?: string) => {
        const url = status
            ? `/shop/orders/my-orders/status/${status}`
            : '/shop/orders/my-orders';

        const response = await apiClient.get<ApiResponse<Page<Order>>>(url, {
            params: { page, size }
        });
        return response.data;
    },

    // Chi tiết đơn hàng
    getOrderById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<Order>>(`/shop/orders/${id}`);
        return response.data;
    },

    // Hủy đơn hàng
    cancelOrder: async (id: number, reason: string) => {
        const response = await apiClient.post<ApiResponse<Order>>(`/shop/orders/${id}/cancel`, null, {
            params: { reason }
        });
        return response.data;
    }
};
