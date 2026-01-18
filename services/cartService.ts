// services/cartService.ts
import apiClient from "./apiClient";
import { Cart } from "../types/shop";
import { ApiResponse } from "../types/api";

export const cartService = {
    // Lấy giỏ hàng
    getCart: async () => {
        const response = await apiClient.get<ApiResponse<Cart>>('/shop/cart');
        return response.data;
    },

    // Thêm vào giỏ hàng
    addToCart: async (productId: number, quantity: number) => {
        const response = await apiClient.post<ApiResponse<Cart>>('/shop/cart/items', {
            productId,
            quantity
        });
        return response.data;
    },

    // Cập nhật số lượng
    updateItem: async (cartItemId: number, quantity: number) => {
        const response = await apiClient.put<ApiResponse<Cart>>(`/shop/cart/items/${cartItemId}`, {
            quantity
        });
        return response.data;
    },

    // Xóa sản phẩm khỏi giỏ
    removeItem: async (cartItemId: number) => {
        const response = await apiClient.delete<ApiResponse<Cart>>(`/shop/cart/items/${cartItemId}`);
        return response.data;
    },

    // Xóa toàn bộ giỏ
    clearCart: async () => {
        const response = await apiClient.delete<ApiResponse<void>>('/shop/cart');
        return response.data;
    },

    // Đếm số lượng item
    getCartCount: async () => {
        const response = await apiClient.get<ApiResponse<number>>('/shop/cart/count');
        return response.data;
    }
};
